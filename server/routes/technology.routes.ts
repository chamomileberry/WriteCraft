import { Router } from "express";
import { storage } from "../storage";
import { insertTechnologySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const validatedTechnology = insertTechnologySchema.parse(req.body);
    const savedTechnology = await storage.createTechnology(validatedTechnology);
    res.json(savedTechnology);
  } catch (error) {
    console.error('Error saving technology:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save technology' });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const technologies = await storage.getUserTechnologies(userId, notebookId);
    
    if (search) {
      const filtered = technologies.filter(technology =>
        technology.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(technologies);
    }
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ error: 'Failed to fetch technologies' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const technologies = await storage.getUserTechnologies(userId, notebookId);
    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ error: 'Failed to fetch technologies' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const technology = await storage.getTechnology(req.params.id, userId, notebookId);
    if (!technology) {
      return res.status(404).json({ error: 'Technology not found' });
    }
    res.json(technology);
  } catch (error) {
    console.error('Error fetching technology:', error);
    res.status(500).json({ error: 'Failed to fetch technology' });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertTechnologySchema.partial().parse(req.body);
    const updatedTechnology = await storage.updateTechnology(req.params.id, userId, updates);
    res.json(updatedTechnology);
  } catch (error) {
    console.error('Error updating technology:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update technology' });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteTechnology(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting technology:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete technology' });
  }
});

export default router;
