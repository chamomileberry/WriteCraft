import { Router } from "express";
import { storage } from "../storage";
import { insertNotebookSchema, updateNotebookSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all notebooks for a user
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebooks = await storage.getUserNotebooks(userId);
    res.json(notebooks);
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
});

// Create a new notebook
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookData = { ...req.body, userId };
    
    const validatedNotebook = insertNotebookSchema.parse(notebookData);
    const savedNotebook = await storage.createNotebook(validatedNotebook);
    res.json(savedNotebook);
  } catch (error) {
    console.error('Error creating notebook:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid notebook data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Get a specific notebook by ID
router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebook = await storage.getNotebook(req.params.id, userId);
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    res.json(notebook);
  } catch (error) {
    console.error('Error fetching notebook:', error);
    res.status(500).json({ error: 'Failed to fetch notebook' });
  }
});

// Update a notebook
router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updateData = { ...req.body, userId };
    
    const validatedUpdates = updateNotebookSchema.parse(updateData);
    const updatedNotebook = await storage.updateNotebook(req.params.id, userId, validatedUpdates);
    
    if (!updatedNotebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(updatedNotebook);
  } catch (error) {
    console.error('Error updating notebook:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid notebook data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Delete a notebook
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteNotebook(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notebook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
