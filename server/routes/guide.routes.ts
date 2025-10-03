import { Router } from "express";
import { storage } from "../storage";
import { insertGuideSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/", async (req: any, res) => {
  try {
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;
    
    const guides = await storage.getGuides();
    
    let filteredGuides = guides;
    
    if (category) {
      filteredGuides = filteredGuides.filter((guide: any) => guide.category === category);
    }
    
    if (difficulty) {
      filteredGuides = filteredGuides.filter((guide: any) => guide.difficulty === difficulty);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredGuides = filteredGuides.filter((guide: any) =>
        guide.title.toLowerCase().includes(searchTerm) ||
        guide.description?.toLowerCase().includes(searchTerm) ||
        guide.tags?.some((tag: any) => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    res.json(filteredGuides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const guide = await storage.getGuide(req.params.id, userId);
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }
    res.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

router.post("/", async (req: any, res) => {
  try {
    // Validate the request body using the insert schema
    const validatedGuide = insertGuideSchema.parse(req.body);
    const savedGuide = await storage.createGuide(validatedGuide);
    res.json(savedGuide);
  } catch (error) {
    console.error('Error creating guide:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid guide data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    // Validate the request body using the insert schema
    const validatedGuide = insertGuideSchema.parse(req.body);
    const updatedGuide = await storage.updateGuide(req.params.id, userId, validatedGuide);
    res.json(updatedGuide);
  } catch (error) {
    console.error('Error updating guide:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid guide data', details: error.errors });
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
    await storage.deleteGuide(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
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
