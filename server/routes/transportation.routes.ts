import { Router } from "express";
import { storage } from "../storage";
import { insertTransportationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedTransportation = insertTransportationSchema.parse(req.body);
    const savedTransportation = await storage.createTransportation(validatedTransportation);
    res.json(savedTransportation);
  } catch (error) {
    console.error('Error saving transportation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save transportation' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const transportations = await storage.getUserTransportations(userId, notebookId);
    res.json(transportations);
  } catch (error) {
    console.error('Error fetching transportations:', error);
    res.status(500).json({ error: 'Failed to fetch transportations' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const transportation = await storage.getTransportation(req.params.id);
    if (!transportation) {
      return res.status(404).json({ error: 'Transportation not found' });
    }
    res.json(transportation);
  } catch (error) {
    console.error('Error fetching transportation:', error);
    res.status(500).json({ error: 'Failed to fetch transportation' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertTransportationSchema.parse(req.body);
    const updatedTransportation = await storage.updateTransportation(req.params.id, validatedUpdates);
    res.json(updatedTransportation);
  } catch (error) {
    console.error('Error updating transportation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteTransportation(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transportation:', error);
    res.status(500).json({ error: 'Failed to delete transportation' });
  }
});

export default router;