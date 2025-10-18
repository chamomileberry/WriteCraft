import { Router } from "express";
import { storage } from "../storage";
import { insertGuideCategorySchema } from "@shared/schema";
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

// Get all categories (with hierarchy)
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    const categories = await storage.getGuideCategories();
    
    // All users can view categories, but only admins can see unpublished guides in them
    res.json(categories);
  } catch (error) {
    console.error('Error fetching guide categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new category (admin only)
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to create category - userId: ${userId}`);
      return res.status(403).json({ error: 'Only administrators can create categories' });
    }
    
    const validatedCategory = insertGuideCategorySchema.parse({
      ...req.body,
      userId
    });
    const savedCategory = await storage.createGuideCategory(validatedCategory);
    res.json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category (admin only)
router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to update category - userId: ${userId}`);
      return res.status(403).json({ error: 'Only administrators can update categories' });
    }
    
    const validatedCategory = insertGuideCategorySchema.partial().parse(req.body);
    const updatedCategory = await storage.updateGuideCategory(req.params.id, validatedCategory);
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category (admin only)
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to delete category - userId: ${userId}`);
      return res.status(403).json({ error: 'Only administrators can delete categories' });
    }
    
    await storage.deleteGuideCategory(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Reorder categories (admin only)
router.post("/reorder", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userIsAdmin = await isAdmin(userId);
    
    if (!userIsAdmin) {
      console.warn(`[Security] Non-admin user attempted to reorder categories - userId: ${userId}`);
      return res.status(403).json({ error: 'Only administrators can reorder categories' });
    }
    
    const { categoryOrders } = req.body;
    
    if (!Array.isArray(categoryOrders)) {
      return res.status(400).json({ error: 'categoryOrders must be an array' });
    }
    
    await storage.reorderGuideCategories(categoryOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

export default router;
