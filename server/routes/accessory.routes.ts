import { Router } from "express";
import { storage } from "../storage";
import { insertAccessorySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedAccessory = insertAccessorySchema.parse(req.body);
    const savedAccessory = await storage.createAccessory(validatedAccessory);
    res.json(savedAccessory);
  } catch (error) {
    console.error('Error saving accessory:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save accessory' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const accessories = await storage.getUserAccessories(userId);
    res.json(accessories);
  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({ error: 'Failed to fetch accessories' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const accessory = await storage.getAccessory(req.params.id);
    if (!accessory) {
      return res.status(404).json({ error: 'Accessory not found' });
    }
    res.json(accessory);
  } catch (error) {
    console.error('Error fetching accessory:', error);
    res.status(500).json({ error: 'Failed to fetch accessory' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertAccessorySchema.parse(req.body);
    const updatedAccessory = await storage.updateAccessory(req.params.id, validatedUpdates);
    res.json(updatedAccessory);
  } catch (error) {
    console.error('Error updating accessory:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteAccessory(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting accessory:', error);
    res.status(500).json({ error: 'Failed to delete accessory' });
  }
});

export default router;