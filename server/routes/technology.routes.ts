import { Router } from "express";
import { storage } from "../storage";
import { insertTechnologySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedTechnology = insertTechnologySchema.parse(req.body);
    const savedTechnology = await storage.createTechnology(validatedTechnology);
    res.json(savedTechnology);
  } catch (error) {
    console.error('Error saving technology:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save technology' });
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

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
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

router.get("/:id", async (req, res) => {
  try {
    const technology = await storage.getTechnology(req.params.id);
    if (!technology) {
      return res.status(404).json({ error: 'Technology not found' });
    }
    res.json(technology);
  } catch (error) {
    console.error('Error fetching technology:', error);
    res.status(500).json({ error: 'Failed to fetch technology' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertTechnologySchema.partial().parse(req.body);
    const updatedTechnology = await storage.updateTechnology(req.params.id, updates);
    res.json(updatedTechnology);
  } catch (error) {
    console.error('Error updating technology:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update technology' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteTechnology(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting technology:', error);
    res.status(500).json({ error: 'Failed to delete technology' });
  }
});

export default router;