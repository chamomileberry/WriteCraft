import { Router } from "express";
import { storage } from "../storage";
import { insertSpeciesSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const speciesData = { ...req.body, userId };
    
    const validatedSpecies = insertSpeciesSchema.parse(speciesData);
    const savedSpecies = await storage.createSpecies(validatedSpecies);
    res.json(savedSpecies);
  } catch (error) {
    console.error('Error saving species:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save species' });
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
    
    const species = await storage.getUserSpecies(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = species;
    if (search) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const species = await storage.getUserSpecies(userId, notebookId);
    res.json(species);
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const species = await storage.getSpecies(req.params.id);
    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }
    res.json(species);
  } catch (error) {
    console.error('Error fetching species:', error);
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertSpeciesSchema.partial().parse(req.body);
    const updatedSpecies = await storage.updateSpecies(req.params.id, updates);
    res.json(updatedSpecies);
  } catch (error) {
    console.error('Error updating species:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update species' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteSpecies(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting species:', error);
    res.status(500).json({ error: 'Failed to delete species' });
  }
});

export default router;