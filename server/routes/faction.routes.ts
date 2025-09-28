import { Router } from "express";
import { storage } from "../storage";
import { insertFactionSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedFaction = insertFactionSchema.parse(req.body);
    const savedFaction = await storage.createFaction(validatedFaction);
    res.json(savedFaction);
  } catch (error) {
    console.error('Error saving faction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save faction' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const factions = await storage.getUserFaction(userId);
    res.json(factions);
  } catch (error) {
    console.error('Error fetching factions:', error);
    res.status(500).json({ error: 'Failed to fetch factions' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const faction = await storage.getFaction(req.params.id);
    if (!faction) {
      return res.status(404).json({ error: 'Faction not found' });
    }
    res.json(faction);
  } catch (error) {
    console.error('Error fetching faction:', error);
    res.status(500).json({ error: 'Failed to fetch faction' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertFactionSchema.parse(req.body);
    const updatedFaction = await storage.updateFaction(req.params.id, validatedUpdates);
    res.json(updatedFaction);
  } catch (error) {
    console.error('Error updating faction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteFaction(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting faction:', error);
    res.status(500).json({ error: 'Failed to delete faction' });
  }
});

export default router;