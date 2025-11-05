import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { characters } from "@shared/schema";
import { and, eq, or, ilike } from "drizzle-orm";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";
import {
  trackAIUsage,
  attachUsageMetadata,
} from "../middleware/aiUsageMiddleware";
import { secureAuthentication } from "../security/middleware";
import { makeAICall } from "../lib/aiHelper";
import { modelSelector, type OperationType } from "../services/modelSelector";
import { entityCache } from "../lib/entityCache";
import { aiRateLimiter, aiChatRateLimiter } from "../security/rateLimiters";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post(
  "/improve-text",
  secureAuthentication,
  aiRateLimiter,
  trackAIUsage("text_improvement"),
  async (req: any, res) => {
    try {
      const { text, action, customPrompt } = req.body;
      const userId = req.user.claims.sub;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      // Load style instruction from database
      const styleInstruction = await getBannedPhrasesInstruction();

      // System prompt for caching (common across all text improvement requests)
      const systemPrompt = `You are a creative writing assistant specialized in improving text. Follow the user's instructions precisely and return ONLY the modified text without any explanations or commentary.${styleInstruction}`;

      let userPrompt = "";

      switch (action) {
        case "improve":
          userPrompt = `Improve the following text by making it clearer, more engaging, and better written while preserving the original meaning:

${text}`;
          break;

        case "shorten":
          userPrompt = `Make the following text more concise while preserving its key points and meaning:

${text}`;
          break;

        case "expand":
          userPrompt = `Expand the following text with more details, examples, or elaboration while maintaining its style and tone:

${text}`;
          break;

        case "fix":
          userPrompt = `Fix any grammar, spelling, or punctuation errors in the following text:

${text}`;
          break;

        case "ask":
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
          return res.status(400).json({ error: "Invalid action" });
      }

      // Use intelligent model selection with prompt caching
      const result = await makeAICall({
        operationType: "improve_text",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 1024,
        textLength: text.length,
        enableCaching: true,
      });

      const suggestedText = result.content.trim() || text;

      // Attach usage metadata for tracking (includes cached tokens if any)
      attachUsageMetadata(res, result.usage, result.model);

      res.json({ suggestedText });
    } catch (error) {
      console.error("Error in AI text improvement:", error);
      res.status(500).json({ error: "Failed to improve text" });
    }
  },
);

router.post(
  "/generate-field",
  secureAuthentication,
  aiRateLimiter,
  trackAIUsage("field_generation"),
  async (req: any, res) => {
    try {
      const {
        fieldName,
        fieldLabel,
        action,
        customPrompt,
        currentValue,
        characterContext,
      } = req.body;
      const userId = req.user.claims.sub;

      if (!fieldLabel) {
        return res.status(400).json({ error: "Field label is required" });
      }

      // If custom prompt provided, search for mentioned characters and include their context
      let relatedCharactersContext = "";
      if (customPrompt && characterContext.notebookId) {
        try {
          // Extract potential character names from the prompt (words starting with capital letters)
          const potentialNames =
            customPrompt.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];

          if (potentialNames.length > 0) {
            // Search for characters in the same notebook matching these names
            const relatedChars = await db
              .select()
              .from(characters)
              .where(
                and(
                  eq(characters.notebookId, characterContext.notebookId),
                  or(
                    ...potentialNames.flatMap((name: string) => {
                      const parts = name.split(" ");
                      return [
                        ilike(characters.givenName, `%${name}%`),
                        ilike(characters.familyName, `%${name}%`),
                        ...(parts.length > 1
                          ? [
                              and(
                                ilike(characters.givenName, `%${parts[0]}%`),
                                ilike(
                                  characters.familyName,
                                  `%${parts[parts.length - 1]}%`,
                                ),
                              ),
                            ]
                          : []),
                      ];
                    }),
                  ),
                ),
              )
              .limit(3); // Limit to 3 related characters to avoid context overflow

            if (relatedChars.length > 0) {
              const relatedContextParts: string[] = [];
              for (const char of relatedChars) {
                const charName = [char.givenName, char.familyName]
                  .filter(Boolean)
                  .join(" ");
                const charDetails: string[] = [`Name: ${charName}`];

                if (char.age) charDetails.push(`Age: ${char.age}`);
                if (char.species) charDetails.push(`Species: ${char.species}`);
                if (char.occupation)
                  charDetails.push(`Occupation: ${char.occupation}`);
                if ((char as any).generalDescription)
                  charDetails.push(
                    `Description: ${(char as any).generalDescription}`,
                  );

                relatedContextParts.push(
                  `\n${charName}:\n${charDetails.join("\n")}`,
                );
              }

              relatedCharactersContext = `\n\nRELATED CHARACTERS (mentioned in your prompt - maintain consistency with these):\n${relatedContextParts.join("\n")}\n`;
            }
          }
        } catch (error) {
          console.error("Error fetching related characters:", error);
          // Continue without related characters context
        }
      }

      // Build context string from character data - include ALL filled fields
      const contextParts: string[] = [];

      // Helper to format field name for display
      const formatFieldName = (key: string): string => {
        return key
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
          .trim();
      };

      // Helper to check if a value has meaningful content
      const hasContent = (value: any): boolean => {
        if (value === null || value === undefined || value === "") return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object") return Object.keys(value).length > 0;
        return true;
      };

      // Prioritize key fields first for better context ordering
      const priorityFields = [
        "givenName",
        "familyName",
        "species",
        "age",
        "gender",
        "occupation",
      ];
      const fieldOrder = [
        ...priorityFields,
        ...Object.keys(characterContext).filter(
          (k) => !priorityFields.includes(k) && k !== fieldName,
        ),
      ];

      for (const key of fieldOrder) {
        const value = characterContext[key];
        if (!hasContent(value)) continue;

        // Special handling for name fields
        if (key === "givenName" || key === "familyName") {
          const fullName = [
            characterContext.givenName,
            characterContext.familyName,
          ]
            .filter(Boolean)
            .join(" ");
          if (
            fullName &&
            !contextParts.some((p) => p.startsWith("Character name:"))
          ) {
            contextParts.push(`Character name: ${fullName}`);
          }
          continue;
        }

        // Format the value
        let formattedValue: string;
        if (Array.isArray(value)) {
          formattedValue = value.join(", ");
        } else if (typeof value === "object") {
          formattedValue = JSON.stringify(value);
        } else {
          formattedValue = String(value);
        }

        // Only include if the value is substantial (not just a single character or number under 100 chars for text fields)
        if (formattedValue.length > 0) {
          contextParts.push(`${formatFieldName(key)}: ${formattedValue}`);
        }
      }

      const contextStr =
        contextParts.length > 0
          ? `\n\nEXISTING CHARACTER INFORMATION (maintain consistency with these details):\n${contextParts.join("\n")}\n`
          : "";

      // Load style instruction from database
      const styleInstruction = await getBannedPhrasesInstruction();

      // System prompt for caching (common across all field generation requests)
      const systemPrompt = `You are a creative writing assistant specialized in character development. Follow instructions precisely and return ONLY the requested content without any explanations, labels, or commentary.${styleInstruction}

IMPORTANT GUIDELINES:
- Use existing character information for consistency
- DO NOT repeat information already covered in other fields
- Provide NEW details and perspectives that build upon what's established
- Add fresh information, not summaries of existing content`;

      let userPrompt = "";

      switch (action) {
        case "generate":
          userPrompt = `Generate compelling content for the "${fieldLabel}" field.${contextStr}${relatedCharactersContext}

Return ONLY the generated ${fieldLabel.toLowerCase()}.`;
          break;

        case "improve":
          userPrompt = `Improve the following ${fieldLabel.toLowerCase()} by making it more engaging, detailed, and well-written while preserving the core ideas.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

Return ONLY the improved text.`;
          break;

        case "expand":
          userPrompt = `Expand the following ${fieldLabel.toLowerCase()} with more details, depth, and elaboration while maintaining consistency with the character.${contextStr}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue}

Add NEW details and depth that complement what's established. Return ONLY the expanded text.`;
          break;

        case "custom":
          userPrompt = `Working with character's ${fieldLabel.toLowerCase()}.${contextStr}${relatedCharactersContext}

CURRENT ${fieldLabel.toUpperCase()}:
${currentValue || "(Empty)"}

USER'S INSTRUCTION:
${customPrompt}

Follow the user's instruction and return ONLY the modified or generated ${fieldLabel.toLowerCase()}.`;
          break;

        default:
          return res.status(400).json({ error: "Invalid action" });
      }

      // Use intelligent model selection with prompt caching
      const result = await makeAICall({
        operationType: "field_generation",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 2048,
        textLength: (currentValue || "").length + contextStr.length,
        enableCaching: true,
      });

      const generatedText = result.content.trim() || currentValue || "";

      // Attach usage metadata for tracking (includes cached tokens if any)
      attachUsageMetadata(res, result.usage, result.model);

      res.json({ generatedText });
    } catch (error) {
      console.error("Error in AI field generation:", error);
      res.status(500).json({ error: "Failed to generate field content" });
    }
  },
);

// Polish content endpoint - Premium feature (Professional/Team only)
// Uses Opus 4.1 for higher quality enhancement
router.post(
  "/polish",
  secureAuthentication,
  aiRateLimiter,
  trackAIUsage("polish"),
  async (req: any, res) => {
    try {
      const { content, contentType = "text" } = req.body;
      const userId = req.user.claims.sub;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Content is required" });
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

      let userPrompt = "";

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
        operationType: "polish",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 4096, // Generous token budget for high-quality output
        textLength: content.length,
        enableCaching: false, // Don't cache - each polish request is unique
      });

      const polishedContent = result.content.trim() || content;

      // Attach usage metadata for tracking
      attachUsageMetadata(res, result.usage, result.model);

      res.json({ polishedContent });
    } catch (error: any) {
      console.error("Error in AI polish:", error);

      // Handle quota exceeded errors
      if (error.message && error.message.includes("quota")) {
        return res.status(403).json({
          error: "Polish quota exceeded",
          message: error.message,
        });
      }

      res.status(500).json({ error: "Failed to polish content" });
    }
  },
);

// Entity detection for auto-creating content from conversations
router.post(
  "/detect-entities",
  secureAuthentication,
  aiRateLimiter,
  trackAIUsage("context_analysis"),
  async (req: any, res) => {
    try {
      const { messages, notebookId } = req.body;
      const userId = req.user.claims.sub;

      if (!messages || messages.length === 0) {
        return res.json({ entities: [] });
      }

      // Take last 10 messages for context
      const recentMessages = messages.slice(-10);

      // Check cache first
      const cachedResult = entityCache.get(recentMessages, userId);
      if (cachedResult) {
        console.log("[Entity Detection] Cache hit - returning cached entities");
        return res.json(cachedResult);
      }
      const conversationText = recentMessages
        .map(
          (m: any) =>
            `${m.type === "user" ? "User" : "Assistant"}: ${m.content}`,
        )
        .join("\n\n");

      const systemPrompt = `You are an expert at analyzing creative writing conversations and extracting detailed character, location, and plot information.

CRITICAL INSTRUCTIONS:
1. Read the ENTIRE conversation carefully - users often develop characters across multiple messages
2. Extract ALL mentioned details, even if scattered across different messages
3. Consolidate information about the same entity from multiple mentions
4. Be generous with extraction - if something is discussed, it should be captured
5. Default confidence to 0.9 for any entity with 3+ details mentioned

Return your analysis as JSON with this exact structure:
{
  "entities": [
    {
      "type": "character",
      "name": "Full character name",
      "confidence": 0.9,
      "details": {
        "givenName": "First name",
        "familyName": "Last name (if mentioned)",
        "age": "Age or age range (if mentioned)",
        "species": "Human/Elf/etc (if mentioned)",
        "occupation": "Job or role (if mentioned)",
        "personality": "ALL personality traits, behaviors, quirks mentioned - be comprehensive",
        "physicalDescription": "ALL physical details mentioned - appearance, build, features, clothing",
        "backstory": "COMPLETE background - family, history, past events, formative experiences",
        "motivation": "What drives them - goals, desires, needs, fears",
        "flaw": "Weaknesses, negative traits, vulnerabilities",
        "strength": "Positive traits, skills, what makes them capable",
        "relationships": ["Names of related characters mentioned"],
        "abilities": "Skills, powers, talents, what they're good at",
        "likes": "Things they enjoy, value, are drawn to",
        "dislikes": "Things they avoid, dislike, oppose"
      }
    }
  ]
}

EXTRACTION GUIDELINES:
- For characters: If the conversation discusses WHO someone is, WHAT they do, or HOW they act - extract it
- Include even partial information (e.g., "young adult" for age, "troubled past" for backstory)
- Capture personality from dialogue, actions described, or explicit statements
- Extract backstory from ANY mention of their past, family, or history
- Motivation includes both what they want AND what they fear/avoid
- Confidence scoring: 0.9+ if 3+ fields filled, 0.8+ if 2 fields, 0.75+ if 1 field with detail
- Only exclude entities with almost no information (just a name mention)

Entity types must be: character, location, or plotPoint`;

      const userPrompt = `Analyze this creative writing conversation and extract detailed information about characters, locations, or plot points.

CONVERSATION:
${conversationText}

Look for:
- Character names and descriptions
- Personality traits, behaviors, quirks
- Physical appearance details
- Background stories, family, past events
- Motivations, goals, fears, desires
- Relationships with other characters
- Skills, abilities, powers
- Preferences, likes, dislikes

Extract EVERYTHING mentioned about each entity. Even scattered details across messages should be consolidated. If the user is developing a character in detail, capture ALL of it.

Return your analysis as JSON with comprehensive details for each entity.`;

      const result = await makeAICall({
        operationType: "context_analysis",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 2048,
        enableCaching: true,
      });

      // Parse JSON response with improved error handling
      let analysis;
      try {
        // Try to find JSON in the response
        const content = result.content.trim();

        // Try direct parse first
        try {
          analysis = JSON.parse(content);
        } catch {
          // If that fails, try to extract JSON from markdown code blocks
          const codeBlockMatch = content.match(
            /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
          );
          if (codeBlockMatch) {
            analysis = JSON.parse(codeBlockMatch[1]);
          } else {
            // Try to find any JSON object in the content
            const jsonMatch = content.match(/\{[\s\S]*?\}(?=\s*$)/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
            } else {
              analysis = { entities: [] };
            }
          }
        }

        // Ensure the response has the expected structure
        if (!analysis.entities || !Array.isArray(analysis.entities)) {
          analysis = { entities: [] };
        }
      } catch (parseError) {
        console.error("Failed to parse entity detection JSON:", parseError);
        console.error("Raw response:", result.content.substring(0, 500));
        analysis = { entities: [] };
      }

      // Store in cache for future requests
      entityCache.set(recentMessages, analysis, userId);
      console.log("[Entity Detection] Stored result in cache");

      // Attach usage metadata
      attachUsageMetadata(res, result.usage, result.model);

      res.json(analysis);
    } catch (error) {
      console.error("Error in entity detection:", error);
      res
        .status(500)
        .json({ error: "Failed to detect entities", entities: [] });
    }
  },
);

// Context analysis for smart prompt suggestions
router.post(
  "/analyze-context",
  secureAuthentication,
  aiRateLimiter,
  trackAIUsage("context_analysis"),
  async (req: any, res) => {
    try {
      const { messages, editorState } = req.body;
      const userId = req.user.claims.sub;

      if (!messages || messages.length === 0) {
        return res.json({ topics: [], entities: [] });
      }

      // Take last 3-5 messages for context
      const recentMessages = messages.slice(-5);

      // Create cache key from recent messages
      const cacheKey = recentMessages.map((m: any) => `${m.type}:${m.content}`);

      // Check cache first
      const cachedResult = entityCache.get(cacheKey, userId);
      if (cachedResult) {
        console.log("[Context Analysis] Cache hit - returning cached analysis");
        return res.json(cachedResult);
      }

      const conversationText = recentMessages
        .map(
          (m: any) =>
            `${m.type === "user" ? "User" : "Assistant"}: ${m.content}`,
        )
        .join("\n\n");

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

${editorState?.hasContent ? `\nCurrent editor state: User is actively editing a ${editorState.type} titled "${editorState.title}"` : ""}

Return your analysis as JSON.`;

      const result = await makeAICall({
        operationType: "context_analysis",
        userId,
        systemPrompt,
        userPrompt,
        maxTokens: 1024,
        enableCaching: true,
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
        console.error("Failed to parse context analysis JSON:", parseError);
        analysis = { topics: [], entities: [] };
      }

      // Store in cache for future requests
      entityCache.set(cacheKey, analysis, userId);
      console.log("[Context Analysis] Stored result in cache");

      // Attach usage metadata
      attachUsageMetadata(res, result.usage, result.model);

      res.json(analysis);
    } catch (error) {
      console.error("Error in context analysis:", error);
      res
        .status(500)
        .json({ error: "Failed to analyze context", topics: [], entities: [] });
    }
  },
);

// Conversational chat endpoint
router.post(
  "/writing-assistant/chat",
  secureAuthentication,
  aiChatRateLimiter,
  trackAIUsage("conversational_chat"),
  async (req: any, res) => {
    try {
      const {
        message,
        conversationHistory,
        editorContent,
        documentTitle,
        documentType,
        notebookId,
        projectId,
        guideId,
        useExtendedThinking,
        context,
      } = req.body;

      if (!message || typeof message !== "string") {
        return res
          .status(400)
          .json({ error: "Message is required and must be a string" });
      }

      const userId = req.user?.claims?.sub;

      // Build context-aware system prompt
      let systemPrompt = "";

      // Check if this is a help/support context
      if (context === "help_support") {
        systemPrompt = `You are a helpful support assistant for WriteCraft, a creative writing platform. You help users with:

- Navigating the application and understanding features
- Using generators, notebooks, projects, and collaboration tools
- Understanding subscription tiers and billing
- Troubleshooting common issues
- Finding documentation and tutorials

Your responses should be:
- Clear and concise
- Friendly and supportive
- Specific to WriteCraft features
- Include step-by-step instructions when helpful

IMPORTANT: If a user asks about any of the following, you MUST suggest they contact support:
- Technical issues, bugs, or errors you cannot diagnose
- Account-specific problems (login issues, payment failures, data loss)
- Requests to speak with a real person, representative, customer service, or human
- Billing disputes or refund requests
- Feature requests or custom modifications
- Issues that require administrative access or manual intervention

When suggesting support, use phrases like "I recommend contacting our support team" or "You should reach out to customer service for help with this" to trigger the contact support button.`;
      } else {
        systemPrompt = `You are a helpful writing assistant for creative writers. You provide guidance on:
- Character development and relationships
- Plot structure and pacing
- World-building and setting details
- Writing techniques and style
- Story brainstorming and ideation

Your responses should be:
- Specific and actionable
- Encouraging and supportive
- Grounded in storytelling principles
- Tailored to the writer's current context`;

        // Add document context if available (only for writing assistant context)
        if (editorContent) {
          systemPrompt += `\n\nThe writer is currently working on a ${documentType || "document"} titled "${documentTitle || "Untitled"}"`;
          if (editorContent.length > 0) {
            const preview = editorContent.substring(0, 1000);
            systemPrompt += `\n\nCurrent content excerpt:\n${preview}${editorContent.length > 1000 ? "..." : ""}`;
          }
        }
      }

      // Build conversation messages
      const messages: any[] = [];

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        );
      }

      // Add current message
      messages.push({
        role: "user",
        content: message,
      });

      // Select operation type based on Extended Thinking flag
      const operationType: OperationType = useExtendedThinking
        ? "extended_thinking"
        : "conversational_chat";

      // Make AI call using conversation format
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const model = modelSelector.selectModel(operationType);

      const response = await anthropic.messages.create({
        model,
        system: systemPrompt,
        max_tokens: 4096,
        messages,
      });

      const content = response.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response format from Anthropic API");
      }

      // Attach usage metadata
      attachUsageMetadata(res, response.usage, model);

      res.json({
        content: content.text,
        model: modelSelector.getModelDisplayName(model),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  },
);

export default router;
