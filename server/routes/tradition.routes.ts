import { Router } from "express";
import { storage } from "../storage";
import { insertTraditionSchema } from "@shared/schema";
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
    
    const validatedTradition = insertTraditionSchema.parse(req.body);
    const savedTradition = await storage.createTradition(validatedTradition);
    res.json(savedTradition);
  } catch (error) {
    console.error('Error saving tradition:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save tradition' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const traditions = await storage.getUserTraditions(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = traditions;
    if (search) {
      filtered = filtered.filter((tradition: any) =>
        tradition.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching traditions:', error);
    res.status(500).json({ error: 'Failed to fetch traditions' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const traditions = await storage.getUserTraditions(userId, notebookId);
    res.json(traditions);
  } catch (error) {
    console.error('Error fetching traditions:', error);
    res.status(500).json({ error: 'Failed to fetch traditions' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tradition = await storage.getTradition(req.params.id);
    if (!tradition) {
      return res.status(404).json({ error: 'Tradition not found' });
    }
    res.json(tradition);
  } catch (error) {
    console.error('Error fetching tradition:', error);
    res.status(500).json({ error: 'Failed to fetch tradition' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const validatedUpdates = insertTraditionSchema.parse(req.body);
    const updatedTradition = await storage.updateTradition(req.params.id, userId, validatedUpdates);
    res.json(updatedTradition);
  } catch (error) {
    console.error('Error updating tradition:', error);
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
    await storage.deleteTradition(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tradition:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete tradition' });
  }
});

export default router;
