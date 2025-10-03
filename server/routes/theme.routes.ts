import { Router } from "express";
import { storage } from "../storage";
import { insertThemeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      userId: z.string().nullable().optional()
    });
    
    const { genre, userId } = generateRequestSchema.parse(req.body);
    
    // TODO: Extract generator function from main routes.ts file
    const theme = {
      title: `Generated ${genre || 'universal'} theme`,
      description: `A meaningful theme exploring ${genre || 'human nature'}`,
      genre: genre === 'any' ? null : genre,
      userId: userId || null
    };

    const validatedTheme = insertThemeSchema.parse(theme);
    const savedTheme = await storage.createTheme(validatedTheme);
    res.json(savedTheme);
  } catch (error) {
    console.error('Error generating theme:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const validatedTheme = insertThemeSchema.parse(req.body);
    const savedTheme = await storage.createTheme(validatedTheme);
    res.json(savedTheme);
  } catch (error) {
    console.error('Error saving theme:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save theme' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const themes = await storage.getUserThemes(userId, notebookId);
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const theme = await storage.getTheme(req.params.id);
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

export default router;