import { Router } from "express";
import { storage } from "../storage";
import { insertCreatureSchema } from "@shared/schema";
import { z } from "zod";
import { generateCreatureWithAI } from "../ai-generation";
import { validateInput } from "../security/middleware";

const router = Router();

// Creature generator routes
router.post("/generate", async (req: any, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      creatureType: z.string().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const userId = req.user.claims.sub;
    const { genre, creatureType, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
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
      userId: userId,
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
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const creature = await storage.getCreature(req.params.id, userId, notebookId);
    if (!creature) {
      return res.status(404).json({ error: 'Creature not found' });
    }
    res.json(creature);
  } catch (error) {
    console.error('Error fetching creature:', error);
    res.status(500).json({ error: 'Failed to fetch creature' });
  }
});

router.patch("/:id", validateInput(insertCreatureSchema.omit({ userId: true }).partial()), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const updatedCreature = await storage.updateCreature(req.params.id, userId, req.body);
    res.json(updatedCreature);
  } catch (error) {
    console.error('Error updating creature:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
