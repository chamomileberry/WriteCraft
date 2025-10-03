import { Router } from "express";
import { storage } from "../storage";
import { insertMaterialSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedMaterial = insertMaterialSchema.parse(req.body);
    const savedMaterial = await storage.createMaterial(validatedMaterial);
    res.json(savedMaterial);
  } catch (error) {
    console.error('Error saving material:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save material' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const materials = await storage.getUserMaterials(userId, notebookId);
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const material = await storage.getMaterial(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertMaterialSchema.parse(req.body);
    const updatedMaterial = await storage.updateMaterial(req.params.id, validatedUpdates);
    res.json(updatedMaterial);
  } catch (error) {
    console.error('Error updating material:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteMaterial(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;