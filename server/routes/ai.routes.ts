import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { characters } from "@shared/schema";
import { and, eq, or, ilike } from "drizzle-orm";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";
import { createRateLimiter } from "../security";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";
import { secureAuthentication } from "../security/middleware";
import { makeAICall } from "../lib/aiHelper";

const router = Router();

// AI generation rate limiting: 30 requests per 15 minutes
// This protects against API abuse and controls costs
const aiRateLimiter = createRateLimiter({ 
  maxRequests: 30, 
  windowMs: 15 * 60 * 1000 
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/improve-text", secureAuthentication, aiRateLimiter, trackAIUsage('text_improvement'), async (req: any, res) => {
  try {
    const { text, action, customPrompt } = req.body;
    const userId = req.user.claims.sub;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();

    // System prompt for caching (common across all text improvement requests)
    const systemPrompt = `You are a creative writing assistant specialized in improving text. Follow the user's instructions precisely and return ONLY the modified text without any explanations or commentary.${styleInstruction}`;

    let userPrompt = '';

    switch (action) {
      case 'improve':
        userPrompt = `Improve the following text by making it clearer, more engaging, and better written while preserving the original meaning:

${text}`;
        break;

      case 'shorten':
        userPrompt = `Make the following text more concise while preserving its key points and meaning:

${text}`;
        break;

      case 'expand':
        userPrompt = `Expand the following text with more details, examples, or elaboration while maintaining its style and tone:

${text}`;
        break;

      case 'fix':
        userPrompt = `Fix any grammar, spelling, or punctuation errors in the following text:

${text}`;
        break;

      case 'ask':
        if (customPrompt) {
          userPrompt = `The user has selected the following text and wants you to help with a specific task.

SELECTED TEXT:
${text}

USER'S INSTRUCTION:
${customPrompt}

Follow the user's instruction and return ONLY the modified text.`;
        } else {
          userPrompt = `The user has selected this text and wants your help with it. Provide a brief, helpful suggestion or improvement:

${text}`;
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Use intelligent model selection with prompt caching
    const result = await makeAICall({
      operationType: 'improve_text',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 1024,
      textLength: text.length,
      enableCaching: true
    });

    const suggestedText = result.content.trim() || text;

    // Attach usage metadata for tracking (includes cached tokens if any)
    attachUsageMetadata(res, result.usage, result.model);

    res.json({ suggestedText });

  } catch (error) {
    console.error('Error in AI text improvement:', error);
    res.status(500).json({ error: 'Failed to improve text' });
  }
});

router.post("/generate-field", secureAuthentication, aiRateLimiter, trackAIUsage('field_generation'), async (req: any, res) => {
  try {
    const { fieldName, fieldLabel, action, customPrompt, currentValue, characterContext } = req.body;
    const userId = req.user.claims.sub;

    if (!fieldLabel) {
      return res.status(400).json({ error: 'Field label is required' });
    }
    
    // If custom prompt provided, search for mentioned characters and include their context
    let relatedCharactersContext = '';
    if (customPrompt && characterContext.notebookId) {
      try {
        // Extract potential character names from the prompt (words starting with capital letters)
        const potentialNames = customPrompt.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
        
        if (potentialNames.length > 0) {
          // Search for characters in the same notebook matching these names
          const relatedChars = await db.select()
            .from(characters)
            .where(
              and(
                eq(characters.notebookId, characterContext.notebookId),
                or(
                  ...potentialNames.flatMap((name: string) => {
                    const parts = name.split(' ');
                    return [
                      ilike(characters.givenName, `%${name}%`),
                      ilike(characters.familyName, `%${name}%`),
                      ...(parts.length > 1 ? [
                        and(
                          ilike(characters.givenName, `%${parts[0]}%`),
                          ilike(characters.familyName, `%${parts[parts.length - 1]}%`)
                        )
                      ] : [])
                    ];
                  })
                )
              )
            )
            .limit(3); // Limit to 3 related characters to avoid context overflow
          
          if (relatedChars.length > 0) {
            const relatedContextParts: string[] = [];
            for (const char of relatedChars) {
              const charName = [char.givenName, char.familyName].filter(Boolean).join(' ');
              const charDetails: string[] = [`Name: ${charName}`];
              
              if (char.age) charDetails.push(`Age: ${char.age}`);
              if (char.species) charDetails.push(`Species: ${char.species}`);
              if (char.occupation) charDetails.push(`Occupation: ${char.occupation}`);
              if ((char as any).generalDescription) charDetails.push(`Description: ${(char as any).generalDescription}`);
              
              relatedContextParts.push(`\n${charName}:\n${charDetails.join('\n')}`);
            }
            
            relatedCharactersContext = `\n\nRELATED CHARACTERS (mentioned in your prompt - maintain consistency with these):\n${relatedContextParts.join('\n')}\n`;
          }
        }
      } catch (error) {
        console.error('Error fetching related characters:', error);
        // Continue without related characters context
      }
    }

    // Build context string from character data - include ALL filled fields
    const contextParts: string[] = [];
    
    // Helper to format field name for display
    const formatFieldName = (key: string): string => {
      return key
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
    };
    
    // Helper to check if a value has meaningful content
    const hasContent = (value: any): boolean => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return true;
    };
    
    // Prioritize key fields first for better context ordering
    const priorityFields = ['givenName', 'familyName', 'species', 'age', 'gender', 'occupation'];
    const fieldOrder = [
      ...priorityFields,
      ...Object.keys(characterContext).filter(k => !priorityFields.includes(k) && k !== fieldName)
    ];
    
    for (const key of fieldOrder) {
      const value = characterContext[key];
      if (!hasContent(value)) continue;
      
      // Special handling for name fields
      if (key === 'givenName' || key === 'familyName') {
        const fullName = [characterContext.givenName, characterContext.familyName].filter(Boolean).join(' ');
        if (fullName && !contextParts.some(p => p.startsWith('Character name:'))) {
          contextParts.push(`Character name: ${fullName}`);
        }
        continue;
      }
      
      // Format the value
      let formattedValue: string;
      if (Array.isArray(value)) {
        formattedValue = value.join(', ');
      } else if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      } else {
        formattedValue = String(value);
      }
      
      // Only include if the value is substantial (not just a single character or number under 100 chars for text fields)
      if (formattedValue.length > 0) {
        contextParts.push(`${formatFieldName(key)}: ${formattedValue}`);
      }
    }

    const contextStr = contextParts.length > 0 
      ? `\n\nEXISTING CHARACTER INFORMATION (maintain consistency with these details):\n${contextParts.join('\n')}\n`
      : '';

    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();

    // System prompt for caching (common across all field generation requests)
    const systemPrompt = `You are a creative writing assistant specialized in character development. Follow instructions precisely and return ONLY the requested content without any explanations, labels, or commentary.${styleInstruction}

IMPORTANT GUIDELINES:
- Use existing character information for consistency
- DO NOT repeat information already covered in other fields
- Provide NEW details and perspectives that build upon what's established
- Add fresh information, not summaries of existing content`;

    let userPrompt = '';

    switch (action) {
      case 'generate':
        userPrompt = `Generate compelling content for the "${fieldLabel}" field.${contextStr}${relatedCharactersContext}

Return ONLY the generated ${fieldLabel.toLowerCase()}.`;
        break;

      case 'improve':
        userPrompt = `Improve the following ${fieldLabel.toLowerCase()} by making it more engaging, detailed, and well-written while preserving the core ideas.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

Return ONLY the improved text.`;
        break;

      case 'expand':
        userPrompt = `Expand the following ${fieldLabel.toLowerCase()} with more details, depth, and elaboration while maintaining consistency with the character.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

Add NEW details and depth that complement what's established. Return ONLY the expanded text.`;
        break;

      case 'custom':
        userPrompt = `Working with character's ${fieldLabel.toLowerCase()}.${contextStr}${relatedCharactersContext}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue || '(Empty)'}

USER'S INSTRUCTION:
${customPrompt}

Follow the user's instruction and return ONLY the modified or generated ${fieldLabel.toLowerCase()}.`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Use intelligent model selection with prompt caching
    const result = await makeAICall({
      operationType: 'field_generation',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 2048,
      textLength: (currentValue || '').length + contextStr.length,
      enableCaching: true
    });

    const generatedText = result.content.trim() || currentValue || '';

    // Attach usage metadata for tracking (includes cached tokens if any)
    attachUsageMetadata(res, result.usage, result.model);

    res.json({ generatedText });

  } catch (error) {
    console.error('Error in AI field generation:', error);
    res.status(500).json({ error: 'Failed to generate field content' });
  }
});

// Polish content endpoint - Premium feature (Professional/Team only)
// Uses Opus 4.1 for higher quality enhancement
router.post("/polish", secureAuthentication, aiRateLimiter, trackAIUsage('polish'), async (req: any, res) => {
  try {
    const { content, contentType = "text" } = req.body;
    const userId = req.user.claims.sub;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();

    // System prompt for polishing with premium quality
    const systemPrompt = `You are an expert writing editor with a keen eye for excellence. Your task is to polish the provided content to a professional, publication-ready standard. Focus on:

1. **Clarity & Flow**: Ensure ideas flow smoothly and logically
2. **Language Quality**: Elevate word choice, vary sentence structure, enhance imagery
3. **Engagement**: Make the content more compelling and vivid
4. **Consistency**: Maintain the author's voice and style while improving quality
5. **Professional Polish**: Eliminate awkward phrasing, redundancy, and weak constructions

Preserve the original meaning and core ideas while significantly enhancing the quality. Return ONLY the polished content without explanations.${styleInstruction}`;

    let userPrompt = '';
    
    if (contentType === "character") {
      userPrompt = `Polish this character description to publication quality, making it vivid, compelling, and professionally crafted:

${content}`;
    } else if (contentType === "plot") {
      userPrompt = `Polish this plot structure to publication quality, ensuring it's engaging, well-paced, and professionally structured:

${content}`;
    } else if (contentType === "setting") {
      userPrompt = `Polish this setting description to publication quality, making it immersive, atmospheric, and professionally crafted:

${content}`;
    } else {
      userPrompt = `Polish this content to publication quality, enhancing clarity, engagement, and professional polish:

${content}`;
    }

    // Use makeAICall with 'polish' operation type (routes to Opus 4.1)
    const result = await makeAICall({
      operationType: 'polish',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 4096, // Generous token budget for high-quality output
      textLength: content.length,
      enableCaching: false // Don't cache - each polish request is unique
    });

    const polishedContent = result.content.trim() || content;

    // Attach usage metadata for tracking
    attachUsageMetadata(res, result.usage, result.model);

    res.json({ polishedContent });

  } catch (error: any) {
    console.error('Error in AI polish:', error);
    
    // Handle quota exceeded errors
    if (error.message && error.message.includes('quota')) {
      return res.status(403).json({ 
        error: 'Polish quota exceeded',
        message: error.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to polish content' });
  }
});

// Context analysis for smart prompt suggestions
router.post("/analyze-context", secureAuthentication, aiRateLimiter, trackAIUsage('context_analysis'), async (req: any, res) => {
  try {
    const { messages, editorState } = req.body;
    const userId = req.user.claims.sub;

    if (!messages || messages.length === 0) {
      return res.json({ topics: [], entities: [] });
    }

    // Take last 3-5 messages for context
    const recentMessages = messages.slice(-5);
    const conversationText = recentMessages
      .map((m: any) => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = `You are an expert at analyzing creative writing conversations and detecting topics and entities being discussed.

Analyze the conversation and identify:
1. TOPICS being discussed (plot, character, dialogue, setting, worldbuilding, pacing, etc.)
2. ENTITIES mentioned (character names, location names, plot points, etc.)

Return your analysis as JSON with this exact structure:
{
  "topics": [
    {"topic": "plot", "confidence": 0.9, "reason": "discussing plot structure"},
    {"topic": "character", "confidence": 0.8, "reason": "discussing character motivations"}
  ],
  "entities": [
    {"type": "character", "name": "Marcus", "context": "villain who is the hero's uncle"},
    {"type": "location", "name": "Crystal Castle", "context": "ancient fortress"}
  ]
}

IMPORTANT:
- Only include topics/entities with confidence > 0.6
- For entities, extract concrete details from the conversation
- Topic values must be one of: plot, character, dialogue, setting, worldbuilding, pacing, theme, conflict, prose, grammar
- Entity types must be one of: character, location, plotPoint, magicSystem, organization`;

    const userPrompt = `Analyze this creative writing conversation:

${conversationText}

${editorState?.hasContent ? `\nCurrent editor state: User is actively editing a ${editorState.type} titled "${editorState.title}"` : ''}

Return your analysis as JSON.`;

    const result = await makeAICall({
      operationType: 'context_analysis',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 1024,
      enableCaching: true
    });

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = { topics: [], entities: [] };
      }
    } catch (parseError) {
      console.error('Failed to parse context analysis JSON:', parseError);
      analysis = { topics: [], entities: [] };
    }

    // Attach usage metadata
    attachUsageMetadata(res, result.usage, result.model);

    res.json(analysis);

  } catch (error) {
    console.error('Error in context analysis:', error);
    res.status(500).json({ error: 'Failed to analyze context', topics: [], entities: [] });
  }
});

export default router;
