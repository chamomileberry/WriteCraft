import { Router } from "express";
import { storage } from "../storage";
import { insertNoteSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const noteData = { ...req.body, userId };
    
    const validatedNote = insertNoteSchema.parse(noteData);
    const savedNote = await storage.createNote(validatedNote);
    res.json(savedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid note data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notes = await storage.getUserNotes(userId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const note = await storage.getNote(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    const validatedUpdates = insertNoteSchema.partial().parse(req.body);
    const updatedNote = await storage.updateNote(req.params.id, userId, validatedUpdates);
    
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid note data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    await storage.deleteNote(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;