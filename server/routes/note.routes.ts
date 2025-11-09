import { Router } from "express";
import { storage } from "../storage";
import { insertNoteSchema } from "@shared/schema";
import { z } from "zod";
import { writeRateLimiter, readRateLimiter } from "../security/rateLimiters";

const router = Router();

router.post("/", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const noteData = { ...req.body, userId };

    const validatedNote = insertNoteSchema.parse(noteData);
    const savedNote = await storage.createNote(validatedNote);
    res.json(savedNote);
  } catch (error) {
    console.error("Error creating note:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid note data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.get("/", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notes = await storage.getUserNotes(userId);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.get("/:id", readRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
  const note = await storage.getNote(req.params['id'], userId);
    if (!note) {
      console.warn(
  `[Security] Unauthorized note access attempt - userId: ${userId}, noteId: ${req.params['id']}`,
      );
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

router.put("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    const validatedUpdates = insertNoteSchema.partial().parse(req.body);
    const updatedNote = await storage.updateNote(
      req.params['id'],
      userId,
      validatedUpdates,
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid note data", details: error.errors });
    }
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/:id", writeRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
  await storage.deleteNote(req.params['id'], userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      const userId = req.user?.claims?.sub || "unknown";
      const notebookId =
        req.query.notebookId || req.body.notebookId || "unknown";
      console.warn(
        `[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`,
      );
      return res.status(404).json({ error: "Not found" });
    }
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
