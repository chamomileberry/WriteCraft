import { Router } from "express";
import { storage } from "../storage";
import { insertDescriptionSchema } from "@shared/schema";
import { z } from "zod";
import { generateDescriptionWithAI } from "../ai-generation";
import { trackAIUsage, attachUsageMetadata } from "../middleware/aiUsageMiddleware";
import { readRateLimiter, writeRateLimiter, aiRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/generate", aiRateLimiter, trackAIUsage('description_generation'), async (req: any, res) => {
  try {
    const { descriptionType, genre, userId, notebookId } = req.body;
    
    const aiResult = await generateDescriptionWithAI({
      descriptionType,
      genre
    });
    
    // Attach usage metadata for tracking
    if (aiResult.usage) {
      attachUsageMetadata(res, aiResult.usage, aiResult.model);
    }

    res.json(aiResult.result);
  } catch (error) {
    console.error('Error generating description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const validatedDescription = insertDescriptionSchema.parse(req.body);
    const savedDescription = await storage.createDescription(validatedDescription);
    res.json(savedDescription);
  } catch (error) {
    console.error('Error saving description:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save description' });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const descriptions = await storage.getUserDescriptions(userId, notebookId);
    res.json(descriptions);
  } catch (error) {
    console.error('Error fetching descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch descriptions' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const description = await storage.getDescription(req.params.id, userId, notebookId);
    if (!description) {
      return res.status(404).json({ error: 'Description not found' });
    }
    res.json(description);
  } catch (error) {
    console.error('Error fetching description:', error);
    res.status(500).json({ error: 'Failed to fetch description' });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertDescriptionSchema.parse(req.body);
    const updatedDescription = await storage.updateDescription(req.params.id, userId, validatedUpdates);
    res.json(updatedDescription);
  } catch (error) {
    console.error('Error updating description:', error);
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

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteDescription(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting description:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete description' });
  }
});

export default router;
