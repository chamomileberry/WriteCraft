import { Router } from "express";
import { storage } from "../storage";
import { insertReligionSchema } from "@shared/schema";
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
    
    const validatedReligion = insertReligionSchema.parse(req.body);
    const savedReligion = await storage.createReligion(validatedReligion);
    res.json(savedReligion);
  } catch (error) {
    console.error('Error saving religion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save religion' });
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
    
    const religions = await storage.getUserReligions(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = religions;
    if (search) {
      filtered = filtered.filter(religion =>
        religion.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching religions:', error);
    res.status(500).json({ error: 'Failed to fetch religions' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const religions = await storage.getUserReligions(userId, notebookId);
    res.json(religions);
  } catch (error) {
    console.error('Error fetching religions:', error);
    res.status(500).json({ error: 'Failed to fetch religions' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const religion = await storage.getReligion(req.params.id);
    if (!religion) {
      return res.status(404).json({ error: 'Religion not found' });
    }
    if (religion.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this religion' });
    }
    res.json(religion);
  } catch (error) {
    console.error('Error fetching religion:', error);
    res.status(500).json({ error: 'Failed to fetch religion' });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertReligionSchema.partial().parse(req.body);
    const updatedReligion = await storage.updateReligion(req.params.id, userId, updates);
    res.json(updatedReligion);
  } catch (error) {
    console.error('Error updating religion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update religion' });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteReligion(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting religion:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete religion' });
  }
});

export default router;
