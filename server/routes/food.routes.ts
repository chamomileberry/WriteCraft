import { Router } from "express";
import { storage } from "../storage";
import { insertFoodSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedFood = insertFoodSchema.parse(req.body);
    const savedFood = await storage.createFood(validatedFood);
    res.json(savedFood);
  } catch (error) {
    console.error('Error saving food:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save food' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const foods = await storage.getUserFoods(userId);
    
    if (search) {
      const filtered = foods.filter(food =>
        food.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(foods);
    }
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const foods = await storage.getUserFoods(userId);
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ error: 'Failed to fetch foods' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const food = await storage.getFood(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json(food);
  } catch (error) {
    console.error('Error fetching food:', error);
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertFoodSchema.partial().parse(req.body);
    const updatedFood = await storage.updateFood(req.params.id, updates);
    res.json(updatedFood);
  } catch (error) {
    console.error('Error updating food:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update food' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteFood(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting food:', error);
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

export default router;