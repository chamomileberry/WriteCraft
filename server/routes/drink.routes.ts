import { Router } from "express";
import { storage } from "../storage";
import { insertDrinkSchema } from "@shared/schema";
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
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    const validatedDrink = insertDrinkSchema.parse(req.body);
    const savedDrink = await storage.createDrink(validatedDrink);
    res.json(savedDrink);
  } catch (error) {
    console.error('Error saving drink:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save drink' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const drinks = await storage.getUserDrinks(userId, notebookId);
    res.json(drinks);
  } catch (error) {
    console.error('Error fetching drinks:', error);
    res.status(500).json({ error: 'Failed to fetch drinks' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const drink = await storage.getDrink(req.params.id, userId, notebookId);
    if (!drink) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    res.json(drink);
  } catch (error) {
    console.error('Error fetching drink:', error);
    res.status(500).json({ error: 'Failed to fetch drink' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertDrinkSchema.parse(req.body);
    const updatedDrink = await storage.updateDrink(req.params.id, userId, validatedUpdates);
    res.json(updatedDrink);
  } catch (error) {
    console.error('Error updating drink:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
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
    await storage.deleteDrink(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting drink:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete drink' });
  }
});

export default router;
