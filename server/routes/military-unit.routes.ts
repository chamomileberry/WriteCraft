import { Router } from "express";
import { storage } from "../storage";
import { insertMilitaryUnitSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedMilitaryUnit = insertMilitaryUnitSchema.parse(req.body);
    const savedMilitaryUnit = await storage.createMilitaryUnit(validatedMilitaryUnit);
    res.json(savedMilitaryUnit);
  } catch (error) {
    console.error('Error saving military unit:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save military unit' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const militaryUnits = await storage.getUserMilitaryUnit(userId);
    res.json(militaryUnits);
  } catch (error) {
    console.error('Error fetching military units:', error);
    res.status(500).json({ error: 'Failed to fetch military units' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const militaryUnit = await storage.getMilitaryUnit(req.params.id);
    if (!militaryUnit) {
      return res.status(404).json({ error: 'Military unit not found' });
    }
    res.json(militaryUnit);
  } catch (error) {
    console.error('Error fetching military unit:', error);
    res.status(500).json({ error: 'Failed to fetch military unit' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertMilitaryUnitSchema.parse(req.body);
    const updatedMilitaryUnit = await storage.updateMilitaryUnit(req.params.id, validatedUpdates);
    res.json(updatedMilitaryUnit);
  } catch (error) {
    console.error('Error updating military unit:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteMilitaryUnit(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting military unit:', error);
    res.status(500).json({ error: 'Failed to delete military unit' });
  }
});

export default router;