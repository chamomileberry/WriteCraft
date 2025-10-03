import { Router } from "express";
import { storage } from "../storage";
import { insertReligionSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedReligion = insertReligionSchema.parse(req.body);
    const savedReligion = await storage.createReligion(validatedReligion);
    res.json(savedReligion);
  } catch (error) {
    console.error('Error saving religion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save religion' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const religions = await storage.getUserReligions(userId);
    
    // Filter by notebook if notebookId is provided
    let filtered = notebookId 
      ? religions.filter(item => item.notebookId === notebookId)
      : religions;
    
    // Then filter by search text if provided
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

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const religions = await storage.getUserReligions(userId);
    res.json(religions);
  } catch (error) {
    console.error('Error fetching religions:', error);
    res.status(500).json({ error: 'Failed to fetch religions' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const religion = await storage.getReligion(req.params.id);
    if (!religion) {
      return res.status(404).json({ error: 'Religion not found' });
    }
    res.json(religion);
  } catch (error) {
    console.error('Error fetching religion:', error);
    res.status(500).json({ error: 'Failed to fetch religion' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertReligionSchema.partial().parse(req.body);
    const updatedReligion = await storage.updateReligion(req.params.id, updates);
    res.json(updatedReligion);
  } catch (error) {
    console.error('Error updating religion:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update religion' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteReligion(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting religion:', error);
    res.status(500).json({ error: 'Failed to delete religion' });
  }
});

export default router;