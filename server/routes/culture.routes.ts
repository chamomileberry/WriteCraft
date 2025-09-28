import { Router } from "express";
import { storage } from "../storage";
import { insertCultureSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedCulture = insertCultureSchema.parse(req.body);
    const savedCulture = await storage.createCulture(validatedCulture);
    res.json(savedCulture);
  } catch (error) {
    console.error('Error saving culture:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save culture' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const cultures = await storage.getUserCultures(userId);
    
    if (search) {
      const filtered = cultures.filter(culture =>
        culture.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(cultures);
    }
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ error: 'Failed to fetch cultures' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const cultures = await storage.getUserCultures(userId);
    res.json(cultures);
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ error: 'Failed to fetch cultures' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const culture = await storage.getCulture(req.params.id);
    if (!culture) {
      return res.status(404).json({ error: 'Culture not found' });
    }
    res.json(culture);
  } catch (error) {
    console.error('Error fetching culture:', error);
    res.status(500).json({ error: 'Failed to fetch culture' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertCultureSchema.partial().parse(req.body);
    const updatedCulture = await storage.updateCulture(req.params.id, updates);
    res.json(updatedCulture);
  } catch (error) {
    console.error('Error updating culture:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update culture' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteCulture(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting culture:', error);
    res.status(500).json({ error: 'Failed to delete culture' });
  }
});

export default router;