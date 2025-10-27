import { Router } from "express";
import { storage } from "../storage";
import { insertNotebookSchema, updateNotebookSchema } from "@shared/schema";
import { z } from "zod";
import { validateInput } from "../security/middleware";
import { requireFeature } from "../middleware/featureGate";

const router = Router();

// Get all notebooks for a user
router.get("/", async (req: any, res) => {
  try {
    console.log('[notebook.routes] GET / - Fetching notebooks', {
      userId: req.user?.claims?.sub,
      isAuthenticated: !!req.user,
      sessionID: req.sessionID,
      path: req.path,
      method: req.method,
      headers: {
        cookie: req.headers.cookie ? 'present' : 'missing',
        referer: req.headers.referer
      }
    });
    
    const userId = req.user.claims.sub;
    const notebooks = await storage.getUserNotebooks(userId);
    
    console.log('[notebook.routes] Successfully fetched notebooks:', {
      userId,
      count: notebooks.length,
      notebookIds: notebooks.map((n: any) => n.id)
    });
    
    res.json(notebooks);
  } catch (error) {
    console.error('[notebook.routes] Error fetching notebooks:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized notebook operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to fetch notebooks' });
  }
});

// Create a new notebook
router.post("/", requireFeature('create_notebook'), validateInput(insertNotebookSchema.omit({ userId: true })), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookData = { ...req.body, userId };
    
    const savedNotebook = await storage.createNotebook(notebookData);
    res.json(savedNotebook);
  } catch (error) {
    console.error('Error creating notebook:', error);
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
router.put("/:id", validateInput(updateNotebookSchema), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updateData = { ...req.body, userId };
    
    const updatedNotebook = await storage.updateNotebook(req.params.id, userId, updateData);
    
    if (!updatedNotebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(updatedNotebook);
  } catch (error) {
    console.error('Error updating notebook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.params.id || 'unknown';
      console.warn(`[Security] Unauthorized notebook operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
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
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('Notebook not found'))) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized notebook deletion attempt - userId: ${userId}, notebookId: ${req.params.id}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
