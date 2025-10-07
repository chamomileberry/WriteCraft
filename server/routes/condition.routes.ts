import { Router } from "express";
import { storage } from "../storage";
import { insertConditionSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { conditions } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req: any, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    const conditionData = { ...req.body, userId };
    
    const validatedCondition = insertConditionSchema.parse(conditionData);
    const savedCondition = await storage.createCondition(validatedCondition);
    res.json(savedCondition);
  } catch (error) {
    console.error('Error saving condition:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save condition' });
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
    
    const conditions = await storage.getUserConditions(userId, notebookId);
    
    // Filter by search text if provided
    let filtered = conditions;
    if (search) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const conditions = await storage.getUserConditions(userId, notebookId);
    res.json(conditions);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Fetch condition by ID only
    const [condition] = await db.select().from(conditions).where(eq(conditions.id, req.params.id));
    
    // Validate ownership - return 404 if not found or doesn't belong to user
    if (!condition || condition.userId !== userId) {
      return res.status(404).json({ error: 'Condition not found' });
    }
    
    res.json(condition);
  } catch (error) {
    console.error('Error fetching condition:', error);
    res.status(500).json({ error: 'Failed to fetch condition' });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = insertConditionSchema.partial().parse(req.body);
    const updatedCondition = await storage.updateCondition(req.params.id, userId, updates);
    res.json(updatedCondition);
  } catch (error) {
    console.error('Error updating condition:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update condition' });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteCondition(req.params.id, userId);
    res.json({ message: 'Condition deleted successfully' });
  } catch (error) {
    console.error('Error deleting condition:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized deletion attempt - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete condition' });
  }
});

export default router;
