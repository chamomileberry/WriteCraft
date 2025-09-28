import { Router } from "express";
import { storage } from "../storage";
import { insertWeaponSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedWeapon = insertWeaponSchema.parse(req.body);
    const savedWeapon = await storage.createWeapon(validatedWeapon);
    res.json(savedWeapon);
  } catch (error) {
    console.error('Error saving weapon:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save weapon' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const weapons = await storage.getUserWeapons(userId);
    
    if (search) {
      const filtered = weapons.filter(weapon =>
        weapon.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(weapons);
    }
  } catch (error) {
    console.error('Error fetching weapons:', error);
    res.status(500).json({ error: 'Failed to fetch weapons' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const weapons = await storage.getUserWeapons(userId);
    res.json(weapons);
  } catch (error) {
    console.error('Error fetching weapons:', error);
    res.status(500).json({ error: 'Failed to fetch weapons' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const weapon = await storage.getWeapon(req.params.id);
    if (!weapon) {
      return res.status(404).json({ error: 'Weapon not found' });
    }
    res.json(weapon);
  } catch (error) {
    console.error('Error fetching weapon:', error);
    res.status(500).json({ error: 'Failed to fetch weapon' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertWeaponSchema.partial().parse(req.body);
    const updatedWeapon = await storage.updateWeapon(req.params.id, updates);
    res.json(updatedWeapon);
  } catch (error) {
    console.error('Error updating weapon:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update weapon' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteWeapon(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting weapon:', error);
    res.status(500).json({ error: 'Failed to delete weapon' });
  }
});

export default router;