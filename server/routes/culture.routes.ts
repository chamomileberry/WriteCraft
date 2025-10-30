import { Router } from "express";
import { storage } from "../storage";
import { insertCultureSchema } from "@shared/schema";
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
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save culture' });
  }
});

router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
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

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
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

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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

router.patch("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update culture' });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    await storage.deleteCulture(req.params.id, userId, notebookId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting culture:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete culture' });
  }
});

export default router;
