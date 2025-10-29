import { Router } from "express";
import { storage } from "../storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";
import { generateArticleForContent } from "../article-generation";
import { makeAICall } from "../lib/aiHelper";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";
import { aiRateLimiter, readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/generate", aiRateLimiter, trackAIUsage('location_generation'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const generateRequestSchema = z.object({
      locationType: z.string().optional(),
      genre: z.string().optional(),
      notebookId: z.string()
    });
    
    const { locationType, genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();
    
    const typeContext = locationType ? ` of type ${locationType}` : '';
    const genreContext = genre && genre !== 'any' ? ` for ${genre} stories` : '';
    
    // System prompt for AI generation
    const systemPrompt = `You are a creative writing assistant specialized in worldbuilding locations and settings. Generate vivid, immersive locations that bring story worlds to life${typeContext}${genreContext}.${styleInstruction}

IMPORTANT GUIDELINES:
- Locations should evoke atmosphere and sense of place
- Include sensory details (sights, sounds, smells, textures)
- Consider the location's history, culture, and significance
- Make locations feel lived-in and authentic`;

    const userPrompt = `Generate a compelling location${typeContext}${genreContext}.

Return a JSON object with exactly these fields:
{
  "name": "Evocative location name (2-5 words)",
  "description": "Vivid description including atmosphere, key features, cultural significance, and what makes it unique (2-3 sentences)",
  "locationType": "${locationType || 'city'}"
}`;

    // Use intelligent model selection
    const result = await makeAICall({
      operationType: 'location_generation',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 512,
      enableCaching: true
    });

    // Parse the AI response
    const parsed = JSON.parse(result.content);
    
    const location = {
      name: parsed.name,
      description: parsed.description,
      locationType: parsed.locationType,
      genre: genre === 'any' ? null : genre,
      userId,
      notebookId
    };

    const validatedLocation = insertLocationSchema.parse(location);
    const savedLocation = await storage.createLocation(validatedLocation);
    
    // Attach usage metadata for tracking
    attachUsageMetadata(res, result.usage, result.model);
    
    res.json(savedLocation);
  } catch (error) {
    console.error('Error generating location:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    const locationData = { ...req.body, userId };
    const validatedLocation = insertLocationSchema.parse(locationData);
    const savedLocation = await storage.createLocation(validatedLocation);
    res.json(savedLocation);
  } catch (error) {
    console.error('Error saving location:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save location' });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const locations = await storage.getUserLocations(userId, notebookId);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const location = await storage.getLocation(req.params.id, userId, notebookId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Generate article from structured location data
router.post("/:id/generate-article", aiRateLimiter, async (req: any, res) => {
  try {
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Use centralized secure article generation service
    const updatedLocation = await generateArticleForContent(
      'locations',
      req.params.id,
      userId,
      notebookId
    );
    
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error generating location article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
