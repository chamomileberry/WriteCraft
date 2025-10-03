import { Router } from "express";
import { storage } from "../storage";
import { insertDanceSchema } from "@shared/schema";
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
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const validatedDance = insertDanceSchema.parse(req.body);
    const savedDance = await storage.createDance(validatedDance);
    res.json(savedDance);
  } catch (error) {
    console.error('Error saving dance:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save dance' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const dances = await storage.getUserDances(userId, notebookId);
    res.json(dances);
  } catch (error) {
    console.error('Error fetching dances:', error);
    res.status(500).json({ error: 'Failed to fetch dances' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const dance = await storage.getDance(req.params.id);
    if (!dance) {
      return res.status(404).json({ error: 'Dance not found' });
    }
    res.json(dance);
  } catch (error) {
    console.error('Error fetching dance:', error);
    res.status(500).json({ error: 'Failed to fetch dance' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertDanceSchema.parse(req.body);
    const updatedDance = await storage.updateDance(req.params.id, userId, validatedUpdates);
    res.json(updatedDance);
  } catch (error) {
    console.error('Error updating dance:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteDance(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting dance:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete dance' });
  }
});

export default router;
