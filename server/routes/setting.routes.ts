import { Router } from "express";
import { storage } from "../storage";
import { insertSettingSchema } from "@shared/schema";
import { z } from "zod";
import { generateSettingWithAI } from "../ai-generation";
import { validateInput } from "../security/middleware";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";

const router = Router();

// Setting generator routes
router.post("/generate", trackAIUsage('setting_generation'), async (req: any, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      settingType: z.string().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const userId = req.user.claims.sub;
    const { genre, settingType, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    // Use AI generation instead of random generation
    const aiResult = await generateSettingWithAI({ genre, settingType });
    const aiSetting = aiResult.result;
    
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
      userId: userId || null,
      notebookId: notebookId || null
    };

    // Validate the generated setting data before saving
    const validatedSetting = insertSettingSchema.parse(setting);
    const savedSetting = await storage.createSetting(validatedSetting);
    
    // Attach usage metadata for tracking
    if (aiResult.usage) {
      attachUsageMetadata(res, aiResult.usage, aiResult.model);
    }
    
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

router.post("/", validateInput(insertSettingSchema.omit({ userId: true })), async (req: any, res) => {
  try {
    // Extract userId from header for security
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    const settingData = { ...req.body, userId };
    const savedSetting = await storage.createSetting(settingData);
    res.json(savedSetting);
  } catch (error) {
    console.error('Error creating setting:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
    
    const settings = await storage.getUserSettings(userId, notebookId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const setting = await storage.getSetting(req.params.id, userId, notebookId);
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
