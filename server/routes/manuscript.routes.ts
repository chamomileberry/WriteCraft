import { Router } from "express";
import { storage } from "../storage";
import { insertManuscriptSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const manuscripts = await storage.getManuscripts(userId);
    res.json(manuscripts);
  } catch (error) {
    console.error('Error fetching manuscripts:', error);
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const manuscriptData = { ...req.body, userId };
    
    const validatedManuscript = insertManuscriptSchema.parse(manuscriptData);
    const savedManuscript = await storage.createManuscript(validatedManuscript);
    res.json(savedManuscript);
  } catch (error) {
    console.error('Error creating manuscript:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid manuscript data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.headers['x-user-id'] as string || 'guest';
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await storage.searchManuscripts(query, userId);
    res.json(results);
  } catch (error) {
    console.error('Error searching manuscripts:', error);
    res.status(500).json({ error: 'Failed to search manuscripts' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const manuscript = await storage.getManuscript(req.params.id);
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    res.json(manuscript);
  } catch (error) {
    console.error('Error fetching manuscript:', error);
    res.status(500).json({ error: 'Failed to fetch manuscript' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const updateData = { ...req.body, userId };
    
    const validatedUpdates = insertManuscriptSchema.partial().parse(updateData);
    const updatedManuscript = await storage.updateManuscript(req.params.id, validatedUpdates);
    
    if (!updatedManuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    
    res.json(updatedManuscript);
  } catch (error) {
    console.error('Error updating manuscript:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid manuscript data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteManuscript(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting manuscript:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;