import { Router } from "express";
import { storage } from "../storage";
import { insertMoodSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      userId: z.string().nullable().optional()
    });
    
    const { genre, userId } = generateRequestSchema.parse(req.body);
    
    // TODO: Extract generator function from main routes.ts file
    const mood = {
      name: `Generated ${genre || 'atmospheric'} mood`,
      description: `A ${genre || 'compelling'} atmosphere for your story`,
      genre: genre === 'any' ? null : genre,
      userId: userId || null
    };

    const validatedMood = insertMoodSchema.parse(mood);
    const savedMood = await storage.createMood(validatedMood);
    res.json(savedMood);
  } catch (error) {
    console.error('Error generating mood:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const validatedMood = insertMoodSchema.parse(req.body);
    const savedMood = await storage.createMood(validatedMood);
    res.json(savedMood);
  } catch (error) {
    console.error('Error saving mood:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const moods = await storage.getUserMoods(userId, notebookId);
    res.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const mood = await storage.getMood(req.params.id);
    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }
    res.json(mood);
  } catch (error) {
    console.error('Error fetching mood:', error);
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

export default router;