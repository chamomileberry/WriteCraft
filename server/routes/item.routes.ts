import { Router } from "express";
import { storage } from "../storage";
import { insertItemSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      itemType: z.string().optional(),
      genre: z.string().optional(),
      userId: z.string().nullable().optional()
    });
    
    const { itemType, genre, userId } = generateRequestSchema.parse(req.body);
    
    // TODO: Extract generator function from main routes.ts file
    const item = {
      name: `Generated ${itemType || 'item'}`,
      description: `A ${genre || 'mysterious'} ${itemType || 'object'} with special properties`,
      itemType: itemType || 'artifact',
      genre,
      userId: userId || null
    };

    const validatedItem = insertItemSchema.parse(item);
    const savedItem = await storage.createItem(validatedItem);
    res.json(savedItem);
  } catch (error) {
    console.error('Error generating item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    const validatedItem = insertItemSchema.parse(req.body);
    const savedItem = await storage.createItem(validatedItem);
    res.json(savedItem);
  } catch (error) {
    console.error('Error saving item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save item' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const items = await storage.getUserItems(userId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await storage.getItem(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

export default router;