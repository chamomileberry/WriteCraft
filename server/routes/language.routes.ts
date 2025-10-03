import { Router } from "express";
import { storage } from "../storage";
import { insertLanguageSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedLanguage = insertLanguageSchema.parse(req.body);
    const savedLanguage = await storage.createLanguage(validatedLanguage);
    res.json(savedLanguage);
  } catch (error) {
    console.error('Error saving language:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save language' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const languages = await storage.getUserLanguages(userId);
    
    // Filter by notebook if notebookId is provided
    let filtered = notebookId 
      ? languages.filter(item => item.notebookId === notebookId)
      : languages;
    
    // Then filter by search text if provided
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

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const languages = await storage.getUserLanguages(userId);
    res.json(languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const language = await storage.getLanguage(req.params.id);
    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertLanguageSchema.partial().parse(req.body);
    const updatedLanguage = await storage.updateLanguage(req.params.id, updates);
    res.json(updatedLanguage);
  } catch (error) {
    console.error('Error updating language:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update language' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteLanguage(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ error: 'Failed to delete language' });
  }
});

export default router;