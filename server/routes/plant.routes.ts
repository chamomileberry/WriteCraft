import { Router } from "express";
import { storage } from "../storage";
import { insertPlantSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedPlant = insertPlantSchema.parse(req.body);
    const savedPlant = await storage.createPlant(validatedPlant);
    res.json(savedPlant);
  } catch (error) {
    console.error('Error saving plant:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save plant' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const plants = await storage.getUserPlants(userId);
    res.json(plants);
  } catch (error) {
    console.error('Error fetching plants:', error);
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const plant = await storage.getPlant(req.params.id);
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    console.error('Error fetching plant:', error);
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertPlantSchema.parse(req.body);
    const updatedPlant = await storage.updatePlant(req.params.id, validatedUpdates);
    res.json(updatedPlant);
  } catch (error) {
    console.error('Error updating plant:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deletePlant(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

export default router;