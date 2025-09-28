import { Router } from "express";
import { storage } from "../storage";
import { insertSavedItemSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const { notebookId, itemType, itemId, itemData } = req.body;
    
    // Validate required fields
    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields: itemType, itemId' });
    }
    
    // If notebookId is provided, validate user owns the notebook
    if (notebookId) {
      const userNotebook = await storage.getNotebook(notebookId, userId);
      if (!userNotebook) {
        return res.status(403).json({ error: 'Notebook not found or access denied' });
      }
    }
    
    const savedItemData = {
      userId,
      notebookId: notebookId || null,
      itemType,
      itemId,
      itemData
    };
    
    const validatedSavedItem = insertSavedItemSchema.parse(savedItemData);
    const savedItem = await storage.saveItem(validatedSavedItem);
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
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const { itemType, itemId } = req.body;
    
    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields: itemType, itemId' });
    }
    
    const deleted = await storage.removeSavedItem(userId, itemType, itemId);
    
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
    // Extract userId from authentication headers for security 
    const authenticatedUserId = req.headers['x-user-id'] as string || 'demo-user';
    const requestedUserId = req.params.userId;
    
    // Validate that authenticated user can only access their own saved items
    if (authenticatedUserId !== requestedUserId) {
      return res.status(403).json({ error: 'Access denied - can only access your own saved items' });
    }
    
    const savedItems = await storage.getUserSavedItems(authenticatedUserId);
    res.json(savedItems);
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

export default router;