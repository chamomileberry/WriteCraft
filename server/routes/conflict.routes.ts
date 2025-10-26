import { Router } from "express";
import { storage } from "../storage";
import { insertConflictSchema } from "@shared/schema";
import { z } from "zod";
import { makeAICall } from "../lib/aiHelper";
import { getBannedPhrasesInstruction } from "../utils/banned-phrases";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";
import { createRateLimiter } from "../security";

const router = Router();

// AI generation rate limiting: 30 requests per 15 minutes
const aiRateLimiter = createRateLimiter({ 
  maxRequests: 30, 
  windowMs: 15 * 60 * 1000 
});

router.post("/generate", aiRateLimiter, trackAIUsage('conflict_generation'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const generateRequestSchema = z.object({
      conflictType: z.string().optional(),
      genre: z.string().optional(),
      notebookId: z.string().optional(),
    });
    
    const { conflictType, genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Load style instruction from database
    const styleInstruction = await getBannedPhrasesInstruction();
    
    const typeContext = conflictType ? ` focusing on ${conflictType} conflict` : '';
    const genreContext = genre && genre !== 'any' ? ` for ${genre} stories` : '';
    
    // System prompt for AI generation
    const systemPrompt = `You are a creative writing assistant specialized in story conflicts. Generate compelling dramatic conflicts that drive compelling narratives${typeContext}${genreContext}.${styleInstruction}

IMPORTANT GUIDELINES:
- Conflicts should have clear stakes and emotional resonance
- Create tension that can be explored and developed
- Make conflicts specific and actionable for storytelling
- Include both external circumstances and internal dimensions`;

    const userPrompt = `Generate a powerful story conflict${typeContext}${genreContext}.

Return a JSON object with exactly these fields:
{
  "name": "Compelling conflict title (4-8 words)",
  "description": "Detailed explanation of the conflict, including who/what is involved, what's at stake, and the core tension (2-3 sentences)",
  "conflictType": "${conflictType || 'person vs person'}"
}`;

    // Use intelligent model selection
    const result = await makeAICall({
      operationType: 'conflict_generation',
      userId,
      systemPrompt,
      userPrompt,
      maxTokens: 512,
      enableCaching: true
    });

    // Parse the AI response
    const parsed = JSON.parse(result.content);
    
    const conflict = {
      name: parsed.name,
      description: parsed.description,
      conflictType: parsed.conflictType,
      genre: genre === 'any' ? null : genre,
      userId: userId || null,
      notebookId: notebookId || null
    };

    const validatedConflict = insertConflictSchema.parse(conflict);
    const savedConflict = await storage.createConflict(validatedConflict);
    
    // Attach usage metadata for tracking
    attachUsageMetadata(res, result.usage, result.model);
    
    res.json([savedConflict]); // Return as array for backwards compatibility
  } catch (error) {
    console.error('Error generating conflicts:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req: any, res) => {
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
    
    const validatedConflict = insertConflictSchema.parse(req.body);
    const savedConflict = await storage.createConflict(validatedConflict);
    res.json(savedConflict);
  } catch (error) {
    console.error('Error saving conflict:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save conflict' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const conflicts = await storage.getUserConflicts(userId, notebookId);
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const conflict = await storage.getConflict(req.params.id, userId, notebookId);
    if (!conflict) {
      return res.status(404).json({ error: 'Conflict not found' });
    }
    res.json(conflict);
  } catch (error) {
    console.error('Error fetching conflict:', error);
    res.status(500).json({ error: 'Failed to fetch conflict' });
  }
});

export default router;
