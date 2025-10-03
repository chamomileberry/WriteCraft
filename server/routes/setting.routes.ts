import { Router } from "express";
import { storage } from "../storage";
import { insertSettingSchema } from "@shared/schema";
import { z } from "zod";
import { generateSettingWithAI } from "../ai-generation";

const router = Router();

// Setting generator routes
router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      settingType: z.string().optional(),
      userId: z.string().nullable().optional()
    });
    
    const { genre, settingType, userId } = generateRequestSchema.parse(req.body);
    
    // Use AI generation instead of random generation
    const aiSetting = await generateSettingWithAI({ genre, settingType });
    
    const setting = {
      name: aiSetting.name,
      location: aiSetting.location,
      timePeriod: aiSetting.timePeriod,
      population: aiSetting.population,
      climate: aiSetting.climate,
      description: aiSetting.description,
      atmosphere: aiSetting.atmosphere,
      culturalElements: aiSetting.culturalElements,
      notableFeatures: aiSetting.notableFeatures,
      genre: genre || null,
      settingType: settingType || null,
      userId: userId || null
    };

    // Validate the generated setting data before saving
    const validatedSetting = insertSettingSchema.parse(setting);
    const savedSetting = await storage.createSetting(validatedSetting);
    res.json(savedSetting);
  } catch (error) {
    console.error('Error generating setting:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    // Extract userId from header for security
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const settingData = { ...req.body, userId };
    
    // Validate the request body using the insert schema
    const validatedSetting = insertSettingSchema.parse(settingData);
    const savedSetting = await storage.createSetting(validatedSetting);
    res.json(savedSetting);
  } catch (error) {
    console.error('Error creating setting:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid setting data', details: error.errors });
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
    
    const settings = await storage.getUserSettings(userId, notebookId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const setting = await storage.getSetting(req.params.id);
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

export default router;