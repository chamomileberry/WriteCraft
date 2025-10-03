import { Router } from "express";
import { storage } from "../storage";
import { insertFamilyTreeSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedFamilyTree = insertFamilyTreeSchema.parse(req.body);
    const savedFamilyTree = await storage.createFamilyTree(validatedFamilyTree);
    res.json(savedFamilyTree);
  } catch (error) {
    console.error('Error saving family tree:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save family tree' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const familyTrees = await storage.getUserFamilyTrees(userId);
    
    // Filter by notebook if notebookId is provided
    let filtered = notebookId 
      ? familyTrees.filter((item: any) => item.notebookId === notebookId)
      : familyTrees;
    
    // Then filter by search text if provided
    if (search) {
      filtered = filtered.filter((item: any) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching family trees:', error);
    res.status(500).json({ error: 'Failed to fetch family trees' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const familyTrees = await storage.getUserFamilyTrees(userId);
    res.json(familyTrees);
  } catch (error) {
    console.error('Error fetching family trees:', error);
    res.status(500).json({ error: 'Failed to fetch family trees' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const familyTree = await storage.getFamilyTree(req.params.id);
    if (!familyTree) {
      return res.status(404).json({ error: 'Family tree not found' });
    }
    res.json(familyTree);
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ error: 'Failed to fetch family tree' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertFamilyTreeSchema.parse(req.body);
    const updatedFamilyTree = await storage.updateFamilyTree(req.params.id, validatedUpdates);
    res.json(updatedFamilyTree);
  } catch (error) {
    console.error('Error updating family tree:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteFamilyTree(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting family tree:', error);
    res.status(500).json({ error: 'Failed to delete family tree' });
  }
});

export default router;