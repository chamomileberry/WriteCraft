import { Router } from "express";
import { storage } from "../storage";
import { insertTimelineSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedTimeline = insertTimelineSchema.parse(req.body);
    const savedTimeline = await storage.createTimeline(validatedTimeline);
    res.json(savedTimeline);
  } catch (error) {
    console.error('Error saving timeline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save timeline' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
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

router.get("/:id", async (req, res) => {
  try {
    const timeline = await storage.getTimeline(req.params.id);
    if (!timeline) {
      return res.status(404).json({ error: 'Timeline not found' });
    }
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertTimelineSchema.parse(req.body);
    const updatedTimeline = await storage.updateTimeline(req.params.id, validatedUpdates);
    res.json(updatedTimeline);
  } catch (error) {
    console.error('Error updating timeline:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteTimeline(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline:', error);
    res.status(500).json({ error: 'Failed to delete timeline' });
  }
});

export default router;