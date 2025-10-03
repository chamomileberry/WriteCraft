import { Router } from "express";
import { storage } from "../storage";
import { insertCultureSchema } from "@shared/schema";
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
    
    const cultureData = { ...req.body, userId };
    const validatedCulture = insertCultureSchema.parse(cultureData);
    const savedCulture = await storage.createCulture(validatedCulture);
    res.json(savedCulture);
  } catch (error) {
    console.error('Error saving culture:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save culture' });
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
    
    const cultures = await storage.getUserCultures(userId, notebookId);
    
    if (search) {
      const filtered = cultures.filter(culture =>
        culture.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(cultures);
    }
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ error: 'Failed to fetch cultures' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const cultures = await storage.getUserCultures(userId, notebookId);
    res.json(cultures);
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ error: 'Failed to fetch cultures' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const culture = await storage.getCulture(req.params.id, userId, notebookId);
    if (!culture) {
      return res.status(404).json({ error: 'Culture not found' });
    }
    res.json(culture);
  } catch (error) {
    console.error('Error fetching culture:', error);
    res.status(500).json({ error: 'Failed to fetch culture' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const updates = insertCultureSchema.partial().parse(req.body);
    const updatedCulture = await storage.updateCulture(req.params.id, userId, updates, notebookId);
    res.json(updatedCulture);
  } catch (error) {
    console.error('Error updating culture:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update culture' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    await storage.deleteCulture(req.params.id, userId, notebookId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting culture:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete culture' });
  }
});

export default router;
