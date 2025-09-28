import { Router } from "express";
import { storage } from "../storage";
import { insertFolderSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const folderData = { ...req.body, userId };
    
    const validatedFolder = insertFolderSchema.parse(folderData);
    const savedFolder = await storage.createFolder(validatedFolder);
    res.json(savedFolder);
  } catch (error) {
    console.error('Error creating folder:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid folder data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const folders = await storage.getUserFolders(userId);
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const folder = await storage.getFolder(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ error: 'Failed to fetch folder' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const folderData = { ...req.body, userId };
    
    const validatedUpdates = insertFolderSchema.partial().parse(folderData);
    const updatedFolder = await storage.updateFolder(req.params.id, validatedUpdates);
    
    if (!updatedFolder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    res.json(updatedFolder);
  } catch (error) {
    console.error('Error updating folder:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid folder data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteFolder(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;