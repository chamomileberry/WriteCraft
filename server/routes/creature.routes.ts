import { Router } from "express";
import { storage } from "../storage";
import { insertCreatureSchema } from "@shared/schema";
import { z } from "zod";
import { generateCreatureWithAI } from "../ai-generation";

const router = Router();

// Creature generator routes
router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      creatureType: z.string().optional(),
      userId: z.string().nullable().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const { genre, creatureType, userId, notebookId } = generateRequestSchema.parse(req.body);
    
    // Use AI generation for creatures
    const aiCreature = await generateCreatureWithAI({ genre, creatureType });
    
    const creature = {
      name: aiCreature.name,
      creatureType: aiCreature.creatureType,
      habitat: aiCreature.habitat,
      behavior: aiCreature.behavior,
      abilities: aiCreature.abilities,
      physicalDescription: aiCreature.physicalDescription,
      culturalSignificance: aiCreature.culturalSignificance,
      userId: userId || null,
      notebookId: notebookId || null
    };

    // Validate the generated creature data before saving
    const validatedCreature = insertCreatureSchema.parse(creature);
    const savedCreature = await storage.createCreature(validatedCreature);
    res.json(savedCreature);
  } catch (error) {
    console.error('Error generating creature:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const creatures = await storage.getUserCreatures(userId, notebookId);
    res.json(creatures);
  } catch (error) {
    console.error('Error fetching creatures:', error);
    res.status(500).json({ error: 'Failed to fetch creatures' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const creature = await storage.getCreature(req.params.id);
    if (!creature) {
      return res.status(404).json({ error: 'Creature not found' });
    }
    res.json(creature);
  } catch (error) {
    console.error('Error fetching creature:', error);
    res.status(500).json({ error: 'Failed to fetch creature' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // Extract userId from header for security
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    // Validate the request body
    const validatedUpdates = insertCreatureSchema.partial().parse(req.body);
    
    // Ensure userId is preserved
    const updatesWithUserId = { ...validatedUpdates, userId };
    
    const updatedCreature = await storage.updateCreature(req.params.id, updatesWithUserId);
    res.json(updatedCreature);
  } catch (error) {
    console.error('Error updating creature:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;