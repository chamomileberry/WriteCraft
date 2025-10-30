import { Router } from "express";
import { storage } from "../storage";
import { insertPromptSchema } from "@shared/schema";
import { z } from "zod";
import { generatePromptWithAI } from "../ai-generation";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";
import { aiRateLimiter, readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// Prompt generator routes
router.post("/generate", aiRateLimiter, trackAIUsage('prompt_generation'), async (req: any, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      type: z.string().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const userId = req.user.claims.sub;
    const { genre, type, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    // Use AI generation for prompts
    const aiResult = await generatePromptWithAI({ genre, type });
    const aiPrompt = aiResult.result;
    
    const prompt = {
      text: aiPrompt.text,
      genre: genre || 'general',
      type: type || 'general',
      difficulty: aiPrompt.difficulty || 'intermediate',
      wordCount: aiPrompt.wordCount || '500-1000',
      tags: aiPrompt.tags || [],
      userId: userId,
      notebookId: notebookId || null
    };

    // Validate the generated prompt data before saving
    const validatedPrompt = insertPromptSchema.parse(prompt);
    const savedPrompt = await storage.createPrompt(validatedPrompt);
    
    // Attach usage metadata for tracking
    if (aiResult.usage) {
      attachUsageMetadata(res, aiResult.usage, aiResult.model);
    }
    
    res.json(savedPrompt);
  } catch (error) {
    console.error('Error generating prompt:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/random", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const prompts = await storage.getUserPrompts(userId, notebookId);
    if (prompts.length === 0) {
      return res.status(404).json({ error: 'No prompts found' });
    }
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    res.json(randomPrompt);
  } catch (error) {
    console.error('Error fetching random prompt:', error);
    res.status(500).json({ error: 'Failed to fetch random prompt' });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const prompts = await storage.getUserPrompts(userId, notebookId);
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const prompt = await storage.getPrompt(req.params.id, userId, notebookId);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }
    res.json(prompt);
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

export default router;
