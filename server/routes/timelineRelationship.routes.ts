import { Router } from "express";
import { storage } from "../storage";
import { insertTimelineRelationshipSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Create a new relationship between timeline events
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.body.timelineId;

    if (!timelineId) {
      return res.status(400).json({ error: 'timelineId is required' });
    }

    // Validate that the user owns the timeline
    const timeline = await storage.getTimeline(timelineId, userId, req.body.notebookId);
    if (!timeline) {
      console.warn(`[Security] Unauthorized timeline access attempt - userId: ${userId}, timelineId: ${timelineId}`);
      return res.status(404).json({ error: 'Timeline not found' });
    }

    const relationshipData = insertTimelineRelationshipSchema.parse(req.body);
    const relationship = await storage.createTimelineRelationship(relationshipData);
    res.status(201).json(relationship);
  } catch (error) {
    console.error('Error creating timeline relationship:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create timeline relationship' });
  }
});

// Get all relationships for a specific timeline
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

    const relationships = await storage.getTimelineRelationships(timelineId, userId);
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching timeline relationships:', error);
    res.status(500).json({ error: 'Failed to fetch timeline relationships' });
  }
});

// Update a timeline relationship
router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertTimelineRelationshipSchema.partial().parse(req.body);
    
    const updatedRelationship = await storage.updateTimelineRelationship(req.params.id, userId, updates);
    res.json(updatedRelationship);
  } catch (error) {
    console.error('Error updating timeline relationship:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update timeline relationship' });
  }
});

// Delete a timeline relationship
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const timelineId = req.query.timelineId as string;
    
    await storage.deleteTimelineRelationship(req.params.id, userId, timelineId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting timeline relationship:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete timeline relationship' });
  }
});

export default router;
