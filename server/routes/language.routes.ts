import { Router } from "express";
import { storage } from "../storage";
import { insertLanguageSchema } from "@shared/schema";
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
    
    const validatedLanguage = insertLanguageSchema.parse(req.body);
    const savedLanguage = await storage.createLanguage(validatedLanguage);
    res.json(savedLanguage);
  } catch (error) {
    console.error('Error saving language:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save language' });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const languages = await storage.getUserLanguages(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = languages;
    if (search) {
      filtered = filtered.filter(language =>
        language.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const languages = await storage.getUserLanguages(userId, notebookId);
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const language = await storage.getLanguage(req.params.id, userId, notebookId);
    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertLanguageSchema.partial().parse(req.body);
    const updatedLanguage = await storage.updateLanguage(req.params.id, userId, updates);
    res.json(updatedLanguage);
  } catch (error) {
    console.error('Error updating language:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update language' });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteLanguage(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting language:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete language' });
  }
});

export default router;
