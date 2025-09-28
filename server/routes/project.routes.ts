import { Router } from "express";
import { storage } from "../storage";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const projects = await storage.getUserProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const projectData = { ...req.body, userId };
    
    const validatedProject = insertProjectSchema.parse(projectData);
    const savedProject = await storage.createProject(validatedProject);
    res.json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid project data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.headers['x-user-id'] as string || 'guest';
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await storage.searchProjects(userId, query);
    res.json(results);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const project = await storage.getProject(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const updateData = { ...req.body, userId };
    
    const validatedUpdates = insertProjectSchema.partial().parse(updateData);
    const updatedProject = await storage.updateProject(req.params.id, userId, validatedUpdates);
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid project data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    await storage.deleteProject(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;