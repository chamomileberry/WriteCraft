import { Router } from "express";
import { storage } from "../storage";
import { insertNaturalLawSchema } from "@shared/schema";
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
    
    const validatedNaturalLaw = insertNaturalLawSchema.parse(req.body);
    const savedNaturalLaw = await storage.createNaturalLaw(validatedNaturalLaw);
    res.json(savedNaturalLaw);
  } catch (error) {
    console.error('Error saving natural law:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save natural law' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const naturalLaws = await storage.getUserNaturalLaws(userId, notebookId);
    res.json(naturalLaws);
  } catch (error) {
    console.error('Error fetching natural laws:', error);
    res.status(500).json({ error: 'Failed to fetch natural laws' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const naturalLaw = await storage.getNaturalLaw(req.params.id);
    if (!naturalLaw) {
      return res.status(404).json({ error: 'Natural law not found' });
    }
    res.json(naturalLaw);
  } catch (error) {
    console.error('Error fetching natural law:', error);
    res.status(500).json({ error: 'Failed to fetch natural law' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertNaturalLawSchema.parse(req.body);
    const updatedNaturalLaw = await storage.updateNaturalLaw(req.params.id, userId, validatedUpdates);
    res.json(updatedNaturalLaw);
  } catch (error) {
    console.error('Error updating natural law:', error);
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
    await storage.deleteNaturalLaw(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting natural law:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete natural law' });
  }
});

export default router;
