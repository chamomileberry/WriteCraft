import { Router } from "express";
import { storage } from "../storage";
import { insertMapSchema } from "@shared/schema";
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
    
    const validatedMap = insertMapSchema.parse(req.body);
    const savedMap = await storage.createMap(validatedMap);
    res.json(savedMap);
  } catch (error) {
    console.error('Error saving map:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save map' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const maps = await storage.getUserMaps(userId, notebookId);
    res.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ error: 'Failed to fetch maps' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const map = await storage.getMap(req.params.id);
    if (!map) {
      return res.status(404).json({ error: 'Map not found' });
    }
    res.json(map);
  } catch (error) {
    console.error('Error fetching map:', error);
    res.status(500).json({ error: 'Failed to fetch map' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertMapSchema.parse(req.body);
    const updatedMap = await storage.updateMap(req.params.id, validatedUpdates);
    res.json(updatedMap);
  } catch (error) {
    console.error('Error updating map:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteMap(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting map:', error);
    res.status(500).json({ error: 'Failed to delete map' });
  }
});

export default router;