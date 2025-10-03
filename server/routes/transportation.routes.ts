import { Router } from "express";
import { storage } from "../storage";
import { insertTransportationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req: any, res) => {
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
    
    const validatedTransportation = insertTransportationSchema.parse(req.body);
    const savedTransportation = await storage.createTransportation(validatedTransportation);
    res.json(savedTransportation);
  } catch (error) {
    console.error('Error saving transportation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save transportation' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const transportations = await storage.getUserTransportation(userId, notebookId);
    res.json(transportations);
  } catch (error) {
    console.error('Error fetching transportations:', error);
    res.status(500).json({ error: 'Failed to fetch transportations' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const transportation = await storage.getTransportation(req.params.id, userId, notebookId);
    if (!transportation) {
      return res.status(404).json({ error: 'Transportation not found' });
    }
    res.json(transportation);
  } catch (error) {
    console.error('Error fetching transportation:', error);
    res.status(500).json({ error: 'Failed to fetch transportation' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertTransportationSchema.parse(req.body);
    const updatedTransportation = await storage.updateTransportation(req.params.id, userId, validatedUpdates);
    res.json(updatedTransportation);
  } catch (error) {
    console.error('Error updating transportation:', error);
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
    await storage.deleteTransportation(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transportation:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete transportation' });
  }
});

export default router;
