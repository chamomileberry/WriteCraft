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

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const savedItemId = req.params.id;
    const { itemData } = req.body;
    
    if (!itemData) {
      return res.status(400).json({ error: 'Missing required field: itemData' });
    }
    
    // Update the saved item's itemData
    const updatedItem = await storage.updateSavedItemData(savedItemId, userId, itemData);
    
    if (!updatedItem) {
      return res.status(404).json({ error: 'Saved item not found or access denied' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating saved item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const { itemType, itemId, notebookId } = req.body;
    
    console.log('[DELETE] Attempting to delete saved item:', {
      userId,
      itemType,
      itemId,
      notebookId,
      fullBody: req.body
    });
    
    if (!itemType || !itemId) {
      return res.status(400).json({ error: 'Missing required fields: itemType, itemId' });
    }
    
    // If notebookId is provided, validate user owns the notebook
    if (notebookId) {
      const userNotebook = await storage.getNotebook(notebookId, userId);
      if (!userNotebook) {
        return res.status(403).json({ error: 'Notebook not found or access denied' });
      }
      
      // Delete with notebook validation to prevent cross-notebook deletions
      console.log('[DELETE] Calling unsaveItemFromNotebook with:', { userId, itemType, itemId, notebookId });
      await storage.unsaveItemFromNotebook(userId, itemType, itemId, notebookId);
      console.log('[DELETE] Delete completed successfully');
    } else {
      // Legacy delete without notebook scoping
      console.log('[DELETE] Calling unsaveItem with:', { userId, itemType, itemId });
      await storage.unsaveItem(userId, itemType, itemId);
      console.log('[DELETE] Delete completed successfully');
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
    const notebookId = req.query.notebookId as string;
    
    // Validate that authenticated user can only access their own saved items
    if (authenticatedUserId !== requestedUserId) {
      return res.status(403).json({ error: 'Access denied - can only access your own saved items' });
    }
    
    // If notebookId is provided, validate user owns the notebook
    if (notebookId) {
      const userNotebook = await storage.getNotebook(notebookId, authenticatedUserId);
      if (!userNotebook) {
        return res.status(403).json({ error: 'Notebook not found or access denied' });
      }
      
      // Get saved items for specific notebook
      const savedItems = await storage.getUserSavedItemsByNotebook(authenticatedUserId, notebookId);
      res.json(savedItems);
    } else {
      // Get all saved items (legacy support)
      const savedItems = await storage.getUserSavedItems(authenticatedUserId);
      res.json(savedItems);
    }
  } catch (error) {
    console.error('Error fetching saved items:', error);
    res.status(500).json({ error: 'Failed to fetch saved items' });
  }
});

export default router;