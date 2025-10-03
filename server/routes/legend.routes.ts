import { Router } from "express";
import { storage } from "../storage";
import { insertLegendSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedLegend = insertLegendSchema.parse(req.body);
    const savedLegend = await storage.createLegend(validatedLegend);
    res.json(savedLegend);
  } catch (error) {
    console.error('Error saving legend:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save legend' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const legends = await storage.getUserLegends(userId, notebookId);
    res.json(legends);
  } catch (error) {
    console.error('Error fetching legends:', error);
    res.status(500).json({ error: 'Failed to fetch legends' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const legend = await storage.getLegend(req.params.id);
    if (!legend) {
      return res.status(404).json({ error: 'Legend not found' });
    }
    res.json(legend);
  } catch (error) {
    console.error('Error fetching legend:', error);
    res.status(500).json({ error: 'Failed to fetch legend' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertLegendSchema.parse(req.body);
    const updatedLegend = await storage.updateLegend(req.params.id, validatedUpdates);
    res.json(updatedLegend);
  } catch (error) {
    console.error('Error updating legend:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteLegend(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting legend:', error);
    res.status(500).json({ error: 'Failed to delete legend' });
  }
});

export default router;