import { Router } from "express";
import { storage } from "../storage";
import { insertPolicySchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validatedPolicy = insertPolicySchema.parse(req.body);
    const savedPolicy = await storage.createPolicy(validatedPolicy);
    res.json(savedPolicy);
  } catch (error) {
    console.error('Error saving policy:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save policy' });
  }
});

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const policies = await storage.getUserPolicy(userId);
    res.json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const policy = await storage.getPolicy(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ error: 'Failed to fetch policy' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const validatedUpdates = insertPolicySchema.parse(req.body);
    const updatedPolicy = await storage.updatePolicy(req.params.id, validatedUpdates);
    res.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating policy:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await storage.deletePolicy(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
});

export default router;