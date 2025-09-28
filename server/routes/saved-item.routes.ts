import { Router } from "express";
import { storage } from "../storage";
import { insertSavedItemSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const savedItemData = insertSavedItemSchema.parse(req.body);
    const savedItem = await storage.createSavedItem(savedItemData);
    res.json(savedItem);
  } catch (error) {
    console.error('Error creating saved item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid saved item data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { userId, itemType, itemId } = req.body;
    
    if (!userId || !itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields: userId, itemType, itemId' });
    }
    
    const deleted = await storage.deleteSavedItem(userId, itemType, itemId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Saved item not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const savedItems = await storage.getSavedItems(userId);
    res.json(savedItems);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

export default router;