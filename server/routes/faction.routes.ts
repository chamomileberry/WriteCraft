import { Router } from "express";
import { storage } from "../storage";
import { insertFactionSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req: any, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.user.claims.sub;
    const { notebookId, ...factionData } = req.body;
    
    // Validate notebookId is provided
    if (!notebookId) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const fullFactionData = { ...factionData, userId, notebookId };
    const validatedFaction = insertFactionSchema.parse(fullFactionData);
    const savedFaction = await storage.createFaction(validatedFaction);
    res.json(savedFaction);
  } catch (error) {
    console.error('Error saving faction:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save faction' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const factions = await storage.getUserFaction(userId, notebookId);
    res.json(factions);
  } catch (error) {
    console.error('Error fetching factions:', error);
    res.status(500).json({ error: 'Failed to fetch factions' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const faction = await storage.getFaction(req.params.id, userId, notebookId);
    if (!faction) {
      return res.status(404).json({ error: 'Faction not found' });
    }
    res.json(faction);
  } catch (error) {
    console.error('Error fetching faction:', error);
    res.status(500).json({ error: 'Failed to fetch faction' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const validatedUpdates = insertFactionSchema.parse(req.body);
    const updatedFaction = await storage.updateFaction(req.params.id, userId, validatedUpdates, notebookId);
    res.json(updatedFaction);
  } catch (error) {
    console.error('Error updating faction:', error);
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

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    await storage.deleteFaction(req.params.id, userId, notebookId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting faction:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete faction' });
  }
});

export default router;
