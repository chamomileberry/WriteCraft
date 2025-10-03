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
    // Handle unique constraint violation (duplicate saved item)
    if (error instanceof Error && 'code' in error && (error as any).code === '23505') {
      return res.status(409).json({ 
        error: 'This item is already saved in this notebook',
        code: 'DUPLICATE_SAVED_ITEM'
      });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    // Extract userId from authentication headers for security (ignore client payload)
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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
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

// Sync endpoint to update itemData for all saved_items with current content
router.post("/sync/:userId", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const requestedUserId = req.params.userId;
    
    // Validate that authenticated user can only sync their own saved items
    if (userId !== requestedUserId) {
      return res.status(403).json({ error: 'Access denied - can only sync your own saved items' });
    }
    
    // Get all saved items for this user
    const savedItems = await storage.getUserSavedItems(userId);
    
    const results = {
      total: savedItems.length,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // For each saved item, fetch current data and update itemData
    for (const savedItem of savedItems) {
      try {
        let currentData = null;
        
        console.log(`[Sync] Processing ${savedItem.itemType} ${savedItem.itemId}`);
        
        // Fetch current data based on item type
        switch (savedItem.itemType) {
          case 'character':
            currentData = await storage.getCharacter(savedItem.itemId, userId, savedItem.notebookId);
            break;
          case 'plant':
            currentData = await storage.getPlant(savedItem.itemId, userId, savedItem.notebookId);
            break;
          case 'weapon':
            currentData = await storage.getWeapon(savedItem.itemId);
            break;
          case 'armor':
            currentData = await storage.getArmor(savedItem.itemId);
            break;
          case 'location':
            currentData = await storage.getLocation(savedItem.itemId, userId, savedItem.notebookId);
            break;
          case 'creature':
            currentData = await storage.getCreature(savedItem.itemId);
            break;
          case 'faction':
            currentData = await storage.getFaction(savedItem.itemId, userId, savedItem.notebookId);
            break;
          case 'culture':
            currentData = await storage.getCulture(savedItem.itemId, userId, savedItem.notebookId);
            break;
          case 'religion':
            currentData = await storage.getReligion(savedItem.itemId);
            break;
          case 'language':
            currentData = await storage.getLanguage(savedItem.itemId);
            break;
          case 'technology':
            currentData = await storage.getTechnology(savedItem.itemId);
            break;
          case 'profession':
            currentData = await storage.getProfession(savedItem.itemId);
            break;
          case 'species':
            currentData = await storage.getSpecies(savedItem.itemId);
            break;
          default:
            // Skip unknown types
            continue;
        }
        
        console.log(`[Sync] Fetched data for ${savedItem.itemType} ${savedItem.itemId}:`, currentData ? 'found' : 'not found');
        
        if (currentData) {
          // Update the itemData
          await storage.updateSavedItemData(savedItem.id, userId, currentData);
          console.log(`[Sync] Updated itemData for saved item ${savedItem.id}`);
          results.updated++;
        } else {
          results.errors.push(`Item not found: ${savedItem.itemType} ${savedItem.itemId}`);
          results.failed++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to sync ${savedItem.itemType} ${savedItem.itemId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error syncing saved items:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
