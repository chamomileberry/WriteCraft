import { Router } from "express";
import { storage } from "../storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";
import { generateArticleForContent } from "../article-generation";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    const generateRequestSchema = z.object({
      locationType: z.string().optional(),
      genre: z.string().optional(),
      notebookId: z.string()
    });
    
    const { locationType, genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      return res.status(403).json({ error: 'Notebook not found or access denied' });
    }
    
    // TODO: Extract generator function from main routes.ts file
    const location = {
      name: `Generated ${locationType || 'location'}`,
      description: `A ${genre || 'mysterious'} ${locationType || 'place'} with unique characteristics`,
      locationType: locationType || 'city',
      genre,
      userId,
      notebookId
    };

    const validatedLocation = insertLocationSchema.parse(location);
    const savedLocation = await storage.createLocation(validatedLocation);
    res.json(savedLocation);
  } catch (error) {
    console.error('Error generating location:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const { notebookId, ...locationData } = req.body;
    
    // Validate notebookId is provided
    if (!notebookId) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      return res.status(403).json({ error: 'Notebook not found or access denied' });
    }
    
    const fullLocationData = { ...locationData, userId, notebookId };
    const validatedLocation = insertLocationSchema.parse(fullLocationData);
    const savedLocation = await storage.createLocation(validatedLocation);
    res.json(savedLocation);
  } catch (error) {
    console.error('Error saving location:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save location' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const locations = await storage.getUserLocations(userId, notebookId);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const location = await storage.getLocation(req.params.id, userId, notebookId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Generate article from structured location data
router.post("/:id/generate-article", async (req, res) => {
  try {
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Use centralized secure article generation service
    const updatedLocation = await generateArticleForContent(
      'locations',
      req.params.id,
      userId,
      notebookId
    );
    
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error generating location article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;