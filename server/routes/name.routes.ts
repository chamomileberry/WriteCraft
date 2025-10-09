import { Router } from "express";
import { storage } from "../storage";
import { insertNameSchema } from "@shared/schema";
import { z } from "zod";
import { generateNameWithAI } from "../ai-generation";

const router = Router();

router.post("/generate", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const generateRequestSchema = z.object({
      nameType: z.string(),
      culture: z.string(),
      origin: z.string().optional(),
      meaning: z.string().optional(),
      genre: z.string().optional(),
      notebookId: z.string().optional(),
    });
    
    const { nameType, culture, origin, meaning, genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Generate names using AI
    const aiGeneratedNames = await generateNameWithAI({
      nameType,
      culture,
      origin,
      meaning,
      genre,
    });
    
    // Map AI generated names to database format
    const generatedNames = aiGeneratedNames.map((aiName) => ({
      name: aiName.name,
      meaning: aiName.meaning,
      origin: aiName.origin,
      nameType,
      culture,
      notebookId,
      userId,
    }));

    // Create individual names using createName
    const createdNames = [];
    for (const nameData of generatedNames) {
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
    const userId = req.user.claims.sub;
    
    // Handle both single name and array of names (for bulk save)
    const { names, nameType, culture, notebookId } = req.body;
    
    if (names && Array.isArray(names)) {
      // Bulk save to saved_items collection
      const savedItems = [];
      for (const name of names) {
        try {
          const savedItem = await storage.saveItem({
            userId,
            itemType: 'name',
            itemId: name.id,
            notebookId,
            itemData: name
          });
          savedItems.push(savedItem);
        } catch (saveError) {
          console.error('Error saving name to collection:', saveError);
        }
      }
      return res.json({ success: true, count: savedItems.length });
    }
    
    // Single name save (create new name record)
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
