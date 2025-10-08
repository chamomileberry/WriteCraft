import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { characters } from "@shared/schema";
import { and, eq, or, ilike } from "drizzle-orm";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/improve-text", async (req: any, res) => {
  try {
    const { text, action, customPrompt } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();

    let prompt = '';

    switch (action) {
      case 'improve':
        prompt = `Improve the following text by making it clearer, more engaging, and better written while preserving the original meaning. Return ONLY the improved text without any explanations or commentary.${styleInstruction}

${text}`;
        break;

      case 'shorten':
        prompt = `Make the following text more concise while preserving its key points and meaning. Return ONLY the shortened text without any explanations or commentary.${styleInstruction}

${text}`;
        break;

      case 'expand':
        prompt = `Expand the following text with more details, examples, or elaboration while maintaining its style and tone. Return ONLY the expanded text without any explanations or commentary.${styleInstruction}

${text}`;
        break;

      case 'fix':
        prompt = `Fix any grammar, spelling, or punctuation errors in the following text. Return ONLY the corrected text without any explanations or commentary.${styleInstruction}

${text}`;
        break;

      case 'ask':
        if (customPrompt) {
          prompt = `You are a creative writing assistant. The user has selected the following text and wants you to help with a specific task.

SELECTED TEXT:
${text}

USER'S INSTRUCTION:
${customPrompt}

Follow the user's instruction and return ONLY the modified text without any explanations or commentary.${styleInstruction}`;
        } else {
          prompt = `You are a creative writing assistant. The user has selected this text and wants your help with it. Provide a brief, helpful suggestion or improvement. Be concise.${styleInstruction}

${text}`;
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const suggestedText = message.content[0].type === 'text' 
      ? message.content[0].text.trim()
      : text;

    res.json({ suggestedText });

  } catch (error) {
    console.error('Error in AI text improvement:', error);
    res.status(500).json({ error: 'Failed to improve text' });
  }
});

router.post("/generate-field", async (req: any, res) => {
  try {
    const { fieldName, fieldLabel, action, customPrompt, currentValue, characterContext } = req.body;

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

    let prompt = '';

    switch (action) {
      case 'generate':
        prompt = `You are a creative writing assistant helping to flesh out a character. Generate compelling content for the "${fieldLabel}" field.${contextStr}

IMPORTANT: The existing character information above provides context for consistency. DO NOT repeat or restate information that's already covered in other fields. Instead, provide NEW details and perspectives that build upon what's already established. Add fresh information, not summaries of existing content.

Return ONLY the generated ${fieldLabel.toLowerCase()} without any explanations, labels, or commentary.${styleInstruction}`;
        break;

      case 'improve':
        prompt = `You are a creative writing assistant. Improve the following ${fieldLabel.toLowerCase()} by making it more engaging, detailed, and well-written while preserving the core ideas.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

Return ONLY the improved text without any explanations or commentary.${styleInstruction}`;
        break;

      case 'expand':
        prompt = `You are a creative writing assistant. Expand the following ${fieldLabel.toLowerCase()} with more details, depth, and elaboration while maintaining consistency with the character.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

IMPORTANT: Add NEW details and depth. Don't just repeat what's already in the existing character information - build upon it with fresh perspectives and additional information.

Return ONLY the expanded text without any explanations or commentary.${styleInstruction}`;
        break;

      case 'custom':
        prompt = `You are a creative writing assistant helping with a character's ${fieldLabel.toLowerCase()}.${contextStr}${relatedCharactersContext}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue || '(Empty)'}

USER'S INSTRUCTION:
${customPrompt}

IMPORTANT: Use the existing character information for consistency, but DO NOT repeat information that's already covered elsewhere. Provide fresh details that complement what's established.

Follow the user's instruction and return ONLY the modified or generated ${fieldLabel.toLowerCase()} without any explanations or commentary.${styleInstruction}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const generatedText = message.content[0].type === 'text' 
      ? message.content[0].text.trim()
      : currentValue || '';

    res.json({ generatedText });

  } catch (error) {
    console.error('Error in AI field generation:', error);
    res.status(500).json({ error: 'Failed to generate field content' });
  }
});

export default router;
