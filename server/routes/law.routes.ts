import { Router } from "express";
import { storage } from "../storage";
import { insertLawSchema } from "@shared/schema";
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
    
    const validatedLaw = insertLawSchema.parse(req.body);
    const savedLaw = await storage.createLaw(validatedLaw);
    res.json(savedLaw);
  } catch (error) {
    console.error('Error saving law:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save law' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const laws = await storage.getUserLaws(userId, notebookId);
    res.json(laws);
  } catch (error) {
    console.error('Error fetching laws:', error);
    res.status(500).json({ error: 'Failed to fetch laws' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const law = await storage.getLaw(req.params.id);
    if (!law) {
      return res.status(404).json({ error: 'Law not found' });
    }
    if (law.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this law' });
    }
    res.json(law);
  } catch (error) {
    console.error('Error fetching law:', error);
    res.status(500).json({ error: 'Failed to fetch law' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertLawSchema.parse(req.body);
    const updatedLaw = await storage.updateLaw(req.params.id, userId, validatedUpdates);
    res.json(updatedLaw);
  } catch (error) {
    console.error('Error updating law:', error);
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
    await storage.deleteLaw(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting law:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete law' });
  }
});

export default router;
