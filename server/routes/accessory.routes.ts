import { Router } from "express";
import { storage } from "../storage";
import { insertAccessorySchema } from "@shared/schema";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    const validatedAccessory = insertAccessorySchema.parse(req.body);
    const savedAccessory = await storage.createAccessory(validatedAccessory);
    res.json(savedAccessory);
  } catch (error) {
    console.error('Error saving accessory:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save accessory' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const accessories = await storage.getUserAccessories(userId, notebookId);
    res.json(accessories);
  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({ error: 'Failed to fetch accessories' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const accessory = await storage.getAccessory(req.params.id, userId, notebookId);
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    res.json(accessory);
  } catch (error) {
    console.error('Error fetching accessory:', error);
    res.status(500).json({ error: 'Failed to fetch accessory' });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertAccessorySchema.parse(req.body);
    const updatedAccessory = await storage.updateAccessory(req.params.id, userId, validatedUpdates);
    res.json(updatedAccessory);
  } catch (error) {
    console.error('Error updating accessory:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteAccessory(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting accessory:', error);
    res.status(500).json({ error: 'Failed to delete accessory' });
  }
});

export default router;