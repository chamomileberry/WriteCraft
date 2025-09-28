import { Router } from "express";
import { storage } from "../storage";
import { insertOrganizationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const { notebookId, ...organizationData } = req.body;
    
    // Validate notebookId is provided
    if (!notebookId) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      return res.status(403).json({ error: 'Notebook not found or access denied' });
    }
    
    const fullOrganizationData = { ...organizationData, userId, notebookId };
    const validatedOrganization = insertOrganizationSchema.parse(fullOrganizationData);
    const savedOrganization = await storage.createOrganization(validatedOrganization);
    res.json(savedOrganization);
  } catch (error) {
    console.error('Error saving organization:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save organization' });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const organizations = await storage.getUserOrganizations(userId, notebookId);
    
    if (search) {
      // Filter organizations by name (case-insensitive)
      const filtered = organizations.filter(organization =>
        organization.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(organizations);
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const organizations = await storage.getUserOrganizations(userId, notebookId);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const organization = await storage.getOrganization(req.params.id, userId, notebookId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const updates = insertOrganizationSchema.partial().parse(req.body);
    const updatedOrganization = await storage.updateOrganization(req.params.id, userId, updates, notebookId);
    res.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'demo-user';
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    await storage.deleteOrganization(req.params.id, userId, notebookId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

export default router;