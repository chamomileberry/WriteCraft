import { Router } from "express";
import { storage } from "../storage";
import { insertSocietySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedSociety = insertSocietySchema.parse(req.body);
    const savedSociety = await storage.createSociety(validatedSociety);
    res.json(savedSociety);
  } catch (error) {
    console.error('Error saving society:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save society' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const societies = await storage.getUserSocieties(userId, notebookId);
    res.json(societies);
  } catch (error) {
    console.error('Error fetching societies:', error);
    res.status(500).json({ error: 'Failed to fetch societies' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const society = await storage.getSociety(req.params.id);
    if (!society) {
      return res.status(404).json({ error: 'Society not found' });
    }
    res.json(society);
  } catch (error) {
    console.error('Error fetching society:', error);
    res.status(500).json({ error: 'Failed to fetch society' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertSocietySchema.parse(req.body);
    const updatedSociety = await storage.updateSociety(req.params.id, validatedUpdates);
    res.json(updatedSociety);
  } catch (error) {
    console.error('Error updating society:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteSociety(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting society:', error);
    res.status(500).json({ error: 'Failed to delete society' });
  }
});

export default router;