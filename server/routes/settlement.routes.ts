import { Router } from "express";
import { storage } from "../storage";
import { insertSettlementSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedSettlement = insertSettlementSchema.parse(req.body);
    const savedSettlement = await storage.createSettlement(validatedSettlement);
    res.json(savedSettlement);
  } catch (error) {
    console.error('Error saving settlement:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save settlement' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const settlements = await storage.getUserSettlements(userId, notebookId);
    res.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: 'Failed to fetch settlements' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const settlement = await storage.getSettlement(req.params.id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }
    res.json(settlement);
  } catch (error) {
    console.error('Error fetching settlement:', error);
    res.status(500).json({ error: 'Failed to fetch settlement' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertSettlementSchema.parse(req.body);
    const updatedSettlement = await storage.updateSettlement(req.params.id, validatedUpdates);
    res.json(updatedSettlement);
  } catch (error) {
    console.error('Error updating settlement:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteSettlement(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting settlement:', error);
    res.status(500).json({ error: 'Failed to delete settlement' });
  }
});

export default router;