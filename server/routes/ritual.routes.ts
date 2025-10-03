import { Router } from "express";
import { storage } from "../storage";
import { insertRitualSchema } from "@shared/schema";
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
    
    const validatedRitual = insertRitualSchema.parse(req.body);
    const savedRitual = await storage.createRitual(validatedRitual);
    res.json(savedRitual);
  } catch (error) {
    console.error('Error saving ritual:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save ritual' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const rituals = await storage.getUserRituals(userId, notebookId);
    res.json(rituals);
  } catch (error) {
    console.error('Error fetching rituals:', error);
    res.status(500).json({ error: 'Failed to fetch rituals' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const ritual = await storage.getRitual(req.params.id);
    if (!ritual) {
      return res.status(404).json({ error: 'Ritual not found' });
    }
    res.json(ritual);
  } catch (error) {
    console.error('Error fetching ritual:', error);
    res.status(500).json({ error: 'Failed to fetch ritual' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertRitualSchema.parse(req.body);
    const updatedRitual = await storage.updateRitual(req.params.id, userId, validatedUpdates);
    res.json(updatedRitual);
  } catch (error) {
    console.error('Error updating ritual:', error);
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
    await storage.deleteRitual(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ritual:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete ritual' });
  }
});

export default router;
