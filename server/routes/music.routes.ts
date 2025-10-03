import { Router } from "express";
import { storage } from "../storage";
import { insertMusicSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const validatedMusic = insertMusicSchema.parse(req.body);
    const savedMusic = await storage.createMusic(validatedMusic);
    res.json(savedMusic);
  } catch (error) {
    console.error('Error saving music:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save music' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const music = await storage.getUserMusic(userId, notebookId);
    res.json(music);
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const music = await storage.getMusic(req.params.id, userId, notebookId);
    if (!music) {
      return res.status(404).json({ error: 'Music not found' });
    }
    res.json(music);
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertMusicSchema.parse(req.body);
    const updatedMusic = await storage.updateMusic(req.params.id, userId, validatedUpdates);
    res.json(updatedMusic);
  } catch (error) {
    console.error('Error updating music:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteMusic(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting music:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete music' });
  }
});

export default router;
