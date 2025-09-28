import { Router } from "express";
import { storage } from "../storage";
import { insertDocumentSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedDocument = insertDocumentSchema.parse(req.body);
    const savedDocument = await storage.createDocument(validatedDocument);
    res.json(savedDocument);
  } catch (error) {
    console.error('Error saving document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save document' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const documents = await storage.getUserDocuments(userId);
    
    if (search) {
      const filtered = documents.filter(document =>
        document.title?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const documents = await storage.getUserDocuments(userId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const document = await storage.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const updates = insertDocumentSchema.partial().parse(req.body);
    const updatedDocument = await storage.updateDocument(req.params.id, updates);
    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update document' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deleteDocument(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;