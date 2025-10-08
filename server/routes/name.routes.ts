import { Router } from "express";
import { storage } from "../storage";
import { insertNameSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const generateRequestSchema = z.object({
      nameType: z.string(),
      culture: z.string(),
    });
    
    const { nameType, culture } = generateRequestSchema.parse(req.body);
    
    // TODO: Implement AI-based name generation
    // Currently using placeholder names - needs proper generator implementation
    const placeholderNames = [
      { prefix: 'Aether', suffix: 'wyn' },
      { prefix: 'Zeph', suffix: 'iron' },
      { prefix: 'Lyra', suffix: 'belle' },
      { prefix: 'Thal', suffix: 'dor' },
      { prefix: 'Ember', suffix: 'light' },
      { prefix: 'Kael', suffix: 'storm' },
      { prefix: 'Syl', suffix: 'andra' },
      { prefix: 'Mor', suffix: 'gath' },
    ];
    
    const generatedNames = placeholderNames.slice(0, 6).map((placeholder, idx) => ({
      name: `${placeholder.prefix}${placeholder.suffix}`,
      meaning: `${culture ? culture + ' ' : ''}${nameType} name ${idx + 1}`,
      nameType,
      culture: culture || 'generic',
      userId: userId || null
    }));
    
    const namesList = generatedNames;

    // Create individual names using createName
    const createdNames = [];
    for (const nameData of namesList) {
      try {
        const validatedName = insertNameSchema.parse(nameData);
        const savedName = await storage.createName(validatedName);
        createdNames.push(savedName);
      } catch (nameError) {
        console.error('Error creating individual name:', nameError);
        // Continue with other names even if one fails
      }
    }

    res.json(createdNames);
  } catch (error) {
    console.error('Error generating names:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const validatedName = insertNameSchema.parse(req.body);
    const savedName = await storage.createName(validatedName);
    res.json(savedName);
  } catch (error) {
    console.error('Error saving name:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save name' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const names = await storage.getUserNames(userId, notebookId);
    res.json(names);
  } catch (error) {
    console.error('Error fetching names:', error);
    res.status(500).json({ error: 'Failed to fetch names' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const name = await storage.getName(req.params.id, userId, notebookId);
    if (!name) {
      return res.status(404).json({ error: 'Name not found' });
    }
    res.json(name);
  } catch (error) {
    console.error('Error fetching name:', error);
    res.status(500).json({ error: 'Failed to fetch name' });
  }
});

export default router;
