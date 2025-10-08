import { Router } from "express";
import { storage } from "../storage";
import { insertTimelineEventSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Create a new timeline event
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.body.timelineId;

    if (!timelineId) {
      return res.status(400).json({ error: 'timelineId is required' });
    }

    // Validate that the user owns the timeline this event belongs to
    const timeline = await storage.getTimeline(timelineId, userId, req.body.notebookId);
    if (!timeline) {
      console.warn(`[Security] Unauthorized timeline access attempt - userId: ${userId}, timelineId: ${timelineId}`);
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const eventData = insertTimelineEventSchema.parse(req.body);
    const event = await storage.createTimelineEvent(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating timeline event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create timeline event' });
  }
});

// Get all events for a specific timeline
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.query.timelineId as string;

    if (!timelineId) {
      return res.status(400).json({ error: 'timelineId query parameter is required' });
    }

    // Validate timeline ownership
    const timeline = await storage.getTimeline(timelineId, userId, req.query.notebookId as string);
    if (!timeline) {
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const events = await storage.getTimelineEvents(timelineId, userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    res.status(500).json({ error: 'Failed to fetch timeline events' });
  }
});

// Get a specific event by ID
router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.query.timelineId as string;

    if (!timelineId) {
      return res.status(400).json({ error: 'timelineId query parameter is required' });
    }

    const event = await storage.getTimelineEvent(req.params.id, userId, timelineId);
    
    if (!event) {
      return res.status(404).json({ error: 'Timeline event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching timeline event:', error);
    res.status(500).json({ error: 'Failed to fetch timeline event' });
  }
});

// Update a timeline event
router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertTimelineEventSchema.partial().parse(req.body);
    
    const updatedEvent = await storage.updateTimelineEvent(req.params.id, userId, updates);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating timeline event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update timeline event' });
  }
});

// Delete a timeline event
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.query.timelineId as string;
    
    await storage.deleteTimelineEvent(req.params.id, userId, timelineId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete timeline event' });
  }
});

export default router;
