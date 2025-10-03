import { Router } from "express";
import { storage } from "../storage";
import { insertClothingSchema } from "@shared/schema";
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
    
    const validatedClothing = insertClothingSchema.parse(req.body);
    const savedClothing = await storage.createClothing(validatedClothing);
    res.json(savedClothing);
  } catch (error) {
    console.error('Error saving clothing:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save clothing' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const clothings = await storage.getUserClothing(userId, notebookId);
    res.json(clothings);
  } catch (error) {
    console.error('Error fetching clothings:', error);
    res.status(500).json({ error: 'Failed to fetch clothings' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const clothing = await storage.getClothing(req.params.id);
    if (!clothing) {
      return res.status(404).json({ error: 'Clothing not found' });
    }
    res.json(clothing);
  } catch (error) {
    console.error('Error fetching clothing:', error);
    res.status(500).json({ error: 'Failed to fetch clothing' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertClothingSchema.parse(req.body);
    const updatedClothing = await storage.updateClothing(req.params.id, validatedUpdates);
    res.json(updatedClothing);
  } catch (error) {
    console.error('Error updating clothing:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteClothing(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting clothing:', error);
    res.status(500).json({ error: 'Failed to delete clothing' });
  }
});

export default router;