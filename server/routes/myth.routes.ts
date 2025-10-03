import { Router } from "express";
import { storage } from "../storage";
import { insertMythSchema } from "@shared/schema";
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
    
    const validatedMyth = insertMythSchema.parse(req.body);
    const savedMyth = await storage.createMyth(validatedMyth);
    res.json(savedMyth);
  } catch (error) {
    console.error('Error saving myth:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save myth' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const myths = await storage.getUserMyths(userId, notebookId);
    res.json(myths);
  } catch (error) {
    console.error('Error fetching myths:', error);
    res.status(500).json({ error: 'Failed to fetch myths' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const myth = await storage.getMyth(req.params.id);
    if (!myth) {
      return res.status(404).json({ error: 'Myth not found' });
    }
    res.json(myth);
  } catch (error) {
    console.error('Error fetching myth:', error);
    res.status(500).json({ error: 'Failed to fetch myth' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertMythSchema.parse(req.body);
    const updatedMyth = await storage.updateMyth(req.params.id, userId, validatedUpdates);
    res.json(updatedMyth);
  } catch (error) {
    console.error('Error updating myth:', error);
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
    await storage.deleteMyth(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting myth:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete myth' });
  }
});

export default router;
