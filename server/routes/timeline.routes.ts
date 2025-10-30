import { Router } from "express";
import { storage } from "../storage";
import { insertTimelineSchema } from "@shared/schema";
import { z } from "zod";
import { writeRateLimiter, readRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
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
    
    // Validate request body (without userId - it comes from session)
    const validatedData = insertTimelineSchema.omit({ userId: true }).parse(req.body);
    
    // Inject userId from session
    const timelineData = {
      ...validatedData,
      userId
    };
    
    const savedTimeline = await storage.createTimeline(timelineData);
    res.json(savedTimeline);
  } catch (error) {
    console.error('Error saving timeline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save timeline' });
  }
});

// GET /api/timelines - Get all user timelines across all notebooks
router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // First, get all user notebooks
    const notebooks = await storage.getUserNotebooks(userId);
    
    // Then get timelines from all notebooks
    const allTimelines = [];
    for (const notebook of notebooks) {
      const timelines = await storage.getUserTimelines(userId, notebook.id);
      allTimelines.push(...timelines);
    }
    
    res.json(allTimelines);
  } catch (error) {
    console.error('Error fetching all timelines:', error);
    res.status(500).json({ error: 'Failed to fetch timelines' });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const timelines = await storage.getUserTimelines(userId, notebookId);
    res.json(timelines);
  } catch (error) {
    console.error('Error fetching timelines:', error);
    res.status(500).json({ error: 'Failed to fetch timelines' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const timeline = await storage.getTimeline(req.params.id, userId, notebookId);
    if (!timeline) {
      return res.status(404).json({ error: 'Timeline not found' });
    }
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.patch("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertTimelineSchema.partial().parse(req.body);
    
    const updatedTimeline = await storage.updateTimeline(req.params.id, userId, updates);
    res.json(updatedTimeline);
  } catch (error) {
    console.error('Error updating timeline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update timeline' });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteTimeline(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete timeline' });
  }
});

export default router;
