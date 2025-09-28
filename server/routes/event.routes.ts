import { Router } from "express";
import { storage } from "../storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedEvent = insertEventSchema.parse(req.body);
    const savedEvent = await storage.createEvent(validatedEvent);
    res.json(savedEvent);
  } catch (error) {
    console.error('Error saving event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save event' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const events = await storage.getUserEvent(userId);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await storage.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertEventSchema.parse(req.body);
    const updatedEvent = await storage.updateEvent(req.params.id, validatedUpdates);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;