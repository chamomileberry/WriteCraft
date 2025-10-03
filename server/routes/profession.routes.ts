import { Router } from "express";
import { storage } from "../storage";
import { insertProfessionSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    // Extract notebookId from request body - it's required for professions
    const { notebookId, ...professionData } = req.body;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId is required' });
    }
    
    // Validate notebook ownership before allowing write
    const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
    if (!ownsNotebook) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
    }
    
    const validatedProfession = insertProfessionSchema.parse({ 
      ...professionData, 
      userId, 
      notebookId 
    });
    
    const savedProfession = await storage.createProfession(validatedProfession);
    res.json(savedProfession);
  } catch (error) {
    console.error('Error saving profession:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save profession' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const professions = await storage.getUserProfessions(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = professions;
    if (search) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching professions:', error);
    res.status(500).json({ error: 'Failed to fetch professions' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const profession = await storage.getProfession(req.params.id);
    if (!profession) {
      return res.status(404).json({ error: 'Profession not found' });
    }
    res.json(profession);
  } catch (error) {
    console.error('Error fetching profession:', error);
    res.status(500).json({ error: 'Failed to fetch profession' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const professionData = { ...req.body, userId };
    
    const validatedUpdates = insertProfessionSchema.partial().parse(professionData);
    const updatedProfession = await storage.updateProfession(req.params.id, userId, validatedUpdates);
    res.json(updatedProfession);
  } catch (error) {
    console.error('Error updating profession:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update profession' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    await storage.deleteProfession(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting profession:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete profession' });
  }
});

export default router;
