import { Router } from "express";
import { storage } from "../storage";
import { insertPlotSchema } from "@shared/schema";
import { z } from "zod";
import { aiRateLimiter, readRateLimiter, writeRateLimiter } from "../security/rateLimiters";

const router = Router();

// Plot generator routes
router.post("/generate", aiRateLimiter, async (req: any, res) => {
  try {
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      storyStructure: z.string().optional(),
      notebookId: z.string().nullable().optional()
    });
    
    const userId = req.user.claims.sub;
    const { genre, storyStructure, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    // Generate random plot data (using helper functions from main routes for now)
    const plot = {
      setup: "A compelling story setup that introduces the protagonist and their world",
      incitingIncident: "An unexpected event disrupts the protagonist's normal world and sets the story in motion",
      firstPlotPoint: "The protagonist commits to their journey and crosses into a new world or situation",
      midpoint: "A major revelation or setback occurs, raising the stakes and changing the protagonist's approach",
      secondPlotPoint: "All seems lost as the protagonist faces their darkest moment",
      climax: "The final confrontation where the protagonist must use everything they've learned",
      resolution: "The aftermath where loose ends are tied up and the new normal is established",
      theme: "A compelling thematic element that ties the story together",
      conflict: "The central conflict that drives the narrative forward",
      genre: genre || null,
      storyStructure: storyStructure || null,
      userId: userId || null,
      notebookId: notebookId || null
    };

    // Validate the generated plot data before saving
    const validatedPlot = insertPlotSchema.parse(plot);
    const savedPlot = await storage.createPlot(validatedPlot);
    res.json(savedPlot);
  } catch (error) {
    console.error('Error generating plot:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/user/:userId?", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const plots = await storage.getUserPlots(userId, notebookId);
    res.json(plots);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ error: 'Failed to fetch plots' });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const plot = await storage.getPlot(req.params.id, userId, notebookId);
    if (!plot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    res.json(plot);
  } catch (error) {
    console.error('Error fetching plot:', error);
    res.status(500).json({ error: 'Failed to fetch plot' });
  }
});

router.patch("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const plotId = req.params.id;
    const notebookId = req.body.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId is required' });
    }
    
    // Validate notebook ownership before allowing write
    const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
    if (!ownsNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Validate plot exists and belongs to user
    const existingPlot = await storage.getPlot(plotId, userId, notebookId);
    if (!existingPlot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    // Validate and update plot
    const updateData = insertPlotSchema.partial().parse(req.body);
    const updatedPlot = await storage.updatePlot(plotId, updateData);
    res.json(updatedPlot);
  } catch (error) {
    console.error('Error updating plot:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const plotId = req.params.id;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Validate notebook ownership before allowing write
    const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
    if (!ownsNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Validate plot exists and belongs to user
    const existingPlot = await storage.getPlot(plotId, userId, notebookId);
    if (!existingPlot) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    await storage.deletePlot(plotId);
    res.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    console.error('Error deleting plot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
