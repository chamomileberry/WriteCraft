import { Router } from "express";
import { storage } from "../storage";
import { insertGuideSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Helper function to check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const search = req.query.search as string;
    
    const userIsAdmin = await isAdmin(userId);
    const guides = await storage.getGuides();
    
    let filteredGuides = guides;
    
    // Non-admin users only see published guides
    if (!userIsAdmin) {
      filteredGuides = filteredGuides.filter((guide: any) => guide.published);
    }
    
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
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Endpoint to check if current user is admin (MUST be before /:id route)
router.get("/auth/is-admin", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    res.json({ isAdmin: userIsAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    const guide = await storage.getGuide(req.params.id);
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }
    
    // Non-admin users can only view published guides
    if (!userIsAdmin && !guide.published) {
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
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    // Only admins can create guides
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to create guide - userId: ${userId}`);
      return res.status(403).json({ error: 'Only administrators can create guides' });
    }
    
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
    const userIsAdmin = await isAdmin(userId);
    
    // Only admins can update guides
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to update guide - userId: ${userId}, guideId: ${req.params.id}`);
      return res.status(403).json({ error: 'Only administrators can edit guides' });
    }
    
    // Validate the request body using the insert schema
    const validatedGuide = insertGuideSchema.parse(req.body);
    const updatedGuide = await storage.updateGuide(req.params.id, validatedGuide);
    res.json(updatedGuide);
  } catch (error) {
    console.error('Error updating guide:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid guide data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    // Only admins can delete guides
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to delete guide - userId: ${userId}, guideId: ${req.params.id}`);
      return res.status(403).json({ error: 'Only administrators can delete guides' });
    }
    
    await storage.deleteGuide(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
