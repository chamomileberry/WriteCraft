import { Router } from "express";
import { storage } from "../storage";
import { insertRitualSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedRitual = insertRitualSchema.parse(req.body);
    const savedRitual = await storage.createRitual(validatedRitual);
    res.json(savedRitual);
  } catch (error) {
    console.error('Error saving ritual:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save ritual' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const rituals = await storage.getUserRitual(userId);
    res.json(rituals);
  } catch (error) {
    console.error('Error fetching rituals:', error);
    res.status(500).json({ error: 'Failed to fetch rituals' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ritual = await storage.getRitual(req.params.id);
    if (!ritual) {
      return res.status(404).json({ error: 'Ritual not found' });
    }
    res.json(ritual);
  } catch (error) {
    console.error('Error fetching ritual:', error);
    res.status(500).json({ error: 'Failed to fetch ritual' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertRitualSchema.parse(req.body);
    const updatedRitual = await storage.updateRitual(req.params.id, validatedUpdates);
    res.json(updatedRitual);
  } catch (error) {
    console.error('Error updating ritual:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteRitual(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ritual:', error);
    res.status(500).json({ error: 'Failed to delete ritual' });
  }
});

export default router;