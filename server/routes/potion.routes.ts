import { Router } from "express";
import { storage } from "../storage";
import { insertPotionSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

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
    
    const validatedPotion = insertPotionSchema.parse(req.body);
    const savedPotion = await storage.createPotion(validatedPotion);
    res.json(savedPotion);
  } catch (error) {
    console.error('Error saving potion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save potion' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const potions = await storage.getUserPotions(userId, notebookId);
    res.json(potions);
  } catch (error) {
    console.error('Error fetching potions:', error);
    res.status(500).json({ error: 'Failed to fetch potions' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const potion = await storage.getPotion(req.params.id);
    if (!potion) {
      return res.status(404).json({ error: 'Potion not found' });
    }
    res.json(potion);
  } catch (error) {
    console.error('Error fetching potion:', error);
    res.status(500).json({ error: 'Failed to fetch potion' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const validatedUpdates = insertPotionSchema.parse(req.body);
    const updatedPotion = await storage.updatePotion(req.params.id, userId, validatedUpdates);
    res.json(updatedPotion);
  } catch (error) {
    console.error('Error updating potion:', error);
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

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    await storage.deletePotion(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting potion:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete potion' });
  }
});

export default router;
