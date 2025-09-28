import { Router } from "express";
import { storage } from "../storage";
import { insertSpellSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedSpell = insertSpellSchema.parse(req.body);
    const savedSpell = await storage.createSpell(validatedSpell);
    res.json(savedSpell);
  } catch (error) {
    console.error('Error saving spell:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save spell' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const spells = await storage.getUserSpell(userId);
    res.json(spells);
  } catch (error) {
    console.error('Error fetching spells:', error);
    res.status(500).json({ error: 'Failed to fetch spells' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spell = await storage.getSpell(req.params.id);
    if (!spell) {
      return res.status(404).json({ error: 'Spell not found' });
    }
    res.json(spell);
  } catch (error) {
    console.error('Error fetching spell:', error);
    res.status(500).json({ error: 'Failed to fetch spell' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertSpellSchema.parse(req.body);
    const updatedSpell = await storage.updateSpell(req.params.id, validatedUpdates);
    res.json(updatedSpell);
  } catch (error) {
    console.error('Error updating spell:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteSpell(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting spell:', error);
    res.status(500).json({ error: 'Failed to delete spell' });
  }
});

export default router;