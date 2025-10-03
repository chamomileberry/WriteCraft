import { Router } from "express";
import { storage } from "../storage";
import { insertPromptSchema } from "@shared/schema";
import { z } from "zod";
import { generatePromptWithAI } from "../ai-generation";

const router = Router();

// Prompt generator routes
router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      type: z.string().optional(),
      userId: z.string().nullable().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const authUserId = req.headers['x-user-id'] as string || 'demo-user';
    const { genre, type, userId, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, authUserId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    // Use AI generation for prompts
    const aiPrompt = await generatePromptWithAI({ genre, type });
    
    const prompt = {
      text: aiPrompt.text,
      genre: genre || null,
      promptType: type || null,
      userId: userId || null,
      notebookId: notebookId || null
    };

    // Validate the generated prompt data before saving
    const validatedPrompt = insertPromptSchema.parse(prompt);
    const savedPrompt = await storage.createPrompt(validatedPrompt);
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

router.get("/random", async (req, res) => {
  try {
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const prompts = await storage.getUserPrompts('demo-user', notebookId);
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

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
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

router.get("/:id", async (req, res) => {
  try {
    const prompt = await storage.getPrompt(req.params.id);
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