import { Router } from "express";
import { storage } from "../storage";
import { insertMythSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedMyth = insertMythSchema.parse(req.body);
    const savedMyth = await storage.createMyth(validatedMyth);
    res.json(savedMyth);
  } catch (error) {
    console.error('Error saving myth:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save myth' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const myths = await storage.getUserMyth(userId);
    res.json(myths);
  } catch (error) {
    console.error('Error fetching myths:', error);
    res.status(500).json({ error: 'Failed to fetch myths' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const myth = await storage.getMyth(req.params.id);
    if (!myth) {
      return res.status(404).json({ error: 'Myth not found' });
    }
    res.json(myth);
  } catch (error) {
    console.error('Error fetching myth:', error);
    res.status(500).json({ error: 'Failed to fetch myth' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertMythSchema.parse(req.body);
    const updatedMyth = await storage.updateMyth(req.params.id, validatedUpdates);
    res.json(updatedMyth);
  } catch (error) {
    console.error('Error updating myth:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteMyth(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting myth:', error);
    res.status(500).json({ error: 'Failed to delete myth' });
  }
});

export default router;