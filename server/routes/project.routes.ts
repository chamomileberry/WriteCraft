import { Router } from "express";
import { storage } from "../storage";
import { insertProjectSchema, insertProjectSectionSchema, type ProjectSection, type ProjectSectionWithChildren } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Helper to build tree structure from flat list
function buildTree(sections: ProjectSection[]): ProjectSectionWithChildren[] {
  const map = new Map<string, ProjectSectionWithChildren>();
  const roots: ProjectSectionWithChildren[] = [];

  // First pass: create map
  sections.forEach(section => {
    map.set(section.id, { ...section, children: [] });
  });

  // Second pass: build tree
  sections.forEach(section => {
    const node = map.get(section.id)!;
    if (section.parentId) {
      const parent = map.get(section.parentId);
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort by position
  const sortByPosition = (nodes: ProjectSectionWithChildren[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortByPosition(node.children);
      }
    });
  };

  sortByPosition(roots);
  return roots;
}

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

// Project Section routes
router.get("/:projectId/sections", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId } = req.params;
    const { flat } = req.query;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sections = await storage.getProjectSections(projectId);

    // Return tree structure by default, flat list if ?flat=true
    if (flat === 'true') {
      res.json(sections);
    } else {
      const tree = buildTree(sections);
      res.json(tree);
    }
  } catch (error) {
    console.error('Error fetching project sections:', error);
    res.status(500).json({ error: 'Failed to fetch project sections' });
  }
});

router.post("/:projectId/sections", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId } = req.params;
    const { parentId, type } = req.body;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate type
    if (type !== 'folder' && type !== 'page') {
      return res.status(400).json({ error: 'Type must be folder or page' });
    }

    // Validate nesting: pages cannot have children
    if (parentId) {
      const parent = await storage.getProjectSection(parentId, projectId);
      if (parent && parent.type === 'page') {
        return res.status(400).json({ error: 'Cannot nest sections under a page' });
      }
    }

    const sectionData = { ...req.body, projectId };
    const validatedSection = insertProjectSectionSchema.parse(sectionData);
    const savedSection = await storage.createProjectSection(validatedSection);
    res.json(savedSection);
  } catch (error) {
    console.error('Error creating project section:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid section data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.get("/:projectId/sections/:sectionId", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const section = await storage.getProjectSection(sectionId, projectId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching project section:', error);
    res.status(500).json({ error: 'Failed to fetch project section' });
  }
});

router.put("/:projectId/sections/:sectionId", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const validatedUpdates = insertProjectSectionSchema.partial().parse(req.body);
    const updatedSection = await storage.updateProjectSection(sectionId, projectId, validatedUpdates);

    if (!updatedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating project section:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid section data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:projectId/sections/:sectionId", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await storage.deleteProjectSection(sectionId, projectId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/:projectId/sections/reorder", async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string || 'guest';
    const { projectId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { sectionOrders } = req.body;

    if (!Array.isArray(sectionOrders)) {
      return res.status(400).json({ error: 'sectionOrders must be an array' });
    }

    await storage.reorderProjectSections(projectId, sectionOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering project sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;