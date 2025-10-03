import { Router } from "express";
import { storage } from "../storage";
import { insertEthnicitySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedEthnicity = insertEthnicitySchema.parse(req.body);
    const savedEthnicity = await storage.createEthnicity(validatedEthnicity);
    res.json(savedEthnicity);
  } catch (error) {
    console.error('Error saving ethnicity:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save ethnicity' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const ethnicities = await storage.getUserEthnicities(userId, notebookId);
    res.json(ethnicities);
  } catch (error) {
    console.error('Error fetching ethnicities:', error);
    res.status(500).json({ error: 'Failed to fetch ethnicities' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ethnicity = await storage.getEthnicity(req.params.id);
    if (!ethnicity) {
      return res.status(404).json({ error: 'Ethnicity not found' });
    }
    res.json(ethnicity);
  } catch (error) {
    console.error('Error fetching ethnicity:', error);
    res.status(500).json({ error: 'Failed to fetch ethnicity' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertEthnicitySchema.parse(req.body);
    const updatedEthnicity = await storage.updateEthnicity(req.params.id, validatedUpdates);
    res.json(updatedEthnicity);
  } catch (error) {
    console.error('Error updating ethnicity:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteEthnicity(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ethnicity:', error);
    res.status(500).json({ error: 'Failed to delete ethnicity' });
  }
});

export default router;