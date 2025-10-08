import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { bannedPhrases, insertBannedPhraseSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../security/middleware";

const router = Router();

// Apply admin-only middleware to all routes
router.use(requireAdmin);

// GET /api/banned-phrases - Get all banned phrases
router.get("/", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const activeOnly = req.query.activeOnly === 'true';
    
    let query = db.select().from(bannedPhrases);
    
    if (category) {
      query = query.where(eq(bannedPhrases.category, category)) as any;
    }
    
    if (activeOnly) {
      query = query.where(eq(bannedPhrases.isActive, true)) as any;
    }
    
    const phrases = await query.orderBy(desc(bannedPhrases.createdAt));
    
    res.json(phrases);
  } catch (error) {
    console.error("Error fetching banned phrases:", error);
    res.status(500).json({ error: "Failed to fetch banned phrases" });
  }
});

// POST /api/banned-phrases - Create a new banned phrase
router.post("/", async (req, res) => {
  try {
    const validatedData = insertBannedPhraseSchema.parse(req.body);
    
    const [newPhrase] = await db
      .insert(bannedPhrases)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newPhrase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating banned phrase:", error);
    res.status(500).json({ error: "Failed to create banned phrase" });
  }
});

// PATCH /api/banned-phrases/:id - Update a banned phrase
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateSchema = insertBannedPhraseSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    const [updatedPhrase] = await db
      .update(bannedPhrases)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(bannedPhrases.id, id))
      .returning();
    
    if (!updatedPhrase) {
      return res.status(404).json({ error: "Banned phrase not found" });
    }
    
    res.json(updatedPhrase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error updating banned phrase:", error);
    res.status(500).json({ error: "Failed to update banned phrase" });
  }
});

// DELETE /api/banned-phrases/:id - Delete a banned phrase
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedPhrase] = await db
      .delete(bannedPhrases)
      .where(eq(bannedPhrases.id, id))
      .returning();
    
    if (!deletedPhrase) {
      return res.status(404).json({ error: "Banned phrase not found" });
    }
    
    res.json({ message: "Banned phrase deleted successfully" });
  } catch (error) {
    console.error("Error deleting banned phrase:", error);
    res.status(500).json({ error: "Failed to delete banned phrase" });
  }
});

export default router;
