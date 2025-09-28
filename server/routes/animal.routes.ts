import { Router } from "express";
import { storage } from "../storage";
import { insertAnimalSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedAnimal = insertAnimalSchema.parse(req.body);
    const savedAnimal = await storage.createAnimal(validatedAnimal);
    res.json(savedAnimal);
  } catch (error) {
    console.error('Error saving animal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save animal' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const animals = await storage.getUserAnimal(userId);
    res.json(animals);
  } catch (error) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ error: 'Failed to fetch animals' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const animal = await storage.getAnimal(req.params.id);
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    res.json(animal);
  } catch (error) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ error: 'Failed to fetch animal' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertAnimalSchema.parse(req.body);
    const updatedAnimal = await storage.updateAnimal(req.params.id, validatedUpdates);
    res.json(updatedAnimal);
  } catch (error) {
    console.error('Error updating animal:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteAnimal(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ error: 'Failed to delete animal' });
  }
});

export default router;