import { Router } from "express";
import { storage } from "../storage";
import { insertCeremonySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedCeremony = insertCeremonySchema.parse(req.body);
    const savedCeremony = await storage.createCeremony(validatedCeremony);
    res.json(savedCeremony);
  } catch (error) {
    console.error('Error saving ceremony:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save ceremony' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const ceremonies = await storage.getUserCeremony(userId);
    res.json(ceremonies);
  } catch (error) {
    console.error('Error fetching ceremonies:', error);
    res.status(500).json({ error: 'Failed to fetch ceremonies' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ceremony = await storage.getCeremony(req.params.id);
    if (!ceremony) {
      return res.status(404).json({ error: 'Ceremony not found' });
    }
    res.json(ceremony);
  } catch (error) {
    console.error('Error fetching ceremony:', error);
    res.status(500).json({ error: 'Failed to fetch ceremony' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertCeremonySchema.parse(req.body);
    const updatedCeremony = await storage.updateCeremony(req.params.id, validatedUpdates);
    res.json(updatedCeremony);
  } catch (error) {
    console.error('Error updating ceremony:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteCeremony(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ceremony:', error);
    res.status(500).json({ error: 'Failed to delete ceremony' });
  }
});

export default router;