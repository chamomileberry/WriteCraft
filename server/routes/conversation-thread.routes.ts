import { Router } from "express";
import { storage } from "../storage";
import { insertConversationThreadSchema } from "@shared/schema";
import { z } from "zod";
import { validateInput } from "../security/middleware";
import { generateThreadTags } from "../ai-generation";

const router = Router();

// Get all conversation threads for a user (with optional filtering)
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId, guideId, isActive, tags } = req.query;
    
    const filters: any = { userId };
    if (projectId) filters.projectId = projectId;
    if (guideId) filters.guideId = guideId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const threads = await storage.getConversationThreads(filters);
    
    // Filter by tags if provided (comma-separated)
    let filteredThreads = threads;
    if (tags) {
      const requestedTags = tags.split(',').map((t: string) => t.trim().toLowerCase());
      filteredThreads = threads.filter(thread => 
        thread.tags && thread.tags.some(tag => 
          requestedTags.includes(tag.toLowerCase())
        )
      );
    }
    
    res.json(filteredThreads);
  } catch (error) {
    console.error('Error fetching conversation threads:', error);
    res.status(500).json({ error: 'Failed to fetch conversation threads' });
  }
});

// Search conversation threads (by title, summary, tags, and message content)
router.get("/search", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { query, projectId, guideId } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const threads = await storage.searchConversationThreads(userId, query, { projectId, guideId });
    res.json(threads);
  } catch (error) {
    console.error('Error searching conversation threads:', error);
    res.status(500).json({ error: 'Failed to search conversation threads' });
  }
});

// Create a new conversation thread
router.post("/", validateInput(insertConversationThreadSchema.omit({ userId: true })), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const threadData = { ...req.body, userId };
    
    const savedThread = await storage.createConversationThread(threadData);
    res.json(savedThread);
  } catch (error) {
    console.error('Error creating conversation thread:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Branch a conversation (create new thread with parent reference)
router.post("/:id/branch", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const parentThreadId = req.params.id;
    const { title } = req.body;
    
    // Verify parent thread exists and belongs to user
    const parentThread = await storage.getConversationThread(parentThreadId, userId);
    if (!parentThread) {
      return res.status(404).json({ error: 'Parent thread not found' });
    }
    
    // Create branched thread
    const branchedThread = await storage.createConversationThread({
      userId,
      projectId: parentThread.projectId || undefined,
      guideId: parentThread.guideId || undefined,
      title: title || `Branch of: ${parentThread.title}`,
      parentThreadId,
      isActive: true,
    });
    
    res.json(branchedThread);
  } catch (error) {
    console.error('Error branching conversation thread:', error);
    res.status(500).json({ error: 'Failed to branch conversation thread' });
  }
});

// Get a specific conversation thread by ID
router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const thread = await storage.getConversationThread(req.params.id, userId);
    if (!thread) {
      return res.status(404).json({ error: 'Conversation thread not found' });
    }
    res.json(thread);
  } catch (error) {
    console.error('Error fetching conversation thread:', error);
    res.status(500).json({ error: 'Failed to fetch conversation thread' });
  }
});

// Update a conversation thread (title, tags, archive status, summary)
router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updates = req.body;
    
    const updatedThread = await storage.updateConversationThread(req.params.id, userId, updates);
    
    if (!updatedThread) {
      return res.status(404).json({ error: 'Conversation thread not found' });
    }
    
    res.json(updatedThread);
  } catch (error) {
    console.error('Error updating conversation thread:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Generate/update AI tags for a thread
router.post("/:id/generate-tags", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const threadId = req.params.id;
    
    // Get thread and its messages
    const thread = await storage.getConversationThread(threadId, userId);
    if (!thread) {
      return res.status(404).json({ error: 'Conversation thread not found' });
    }
    
    const messages = await storage.getChatMessagesByThread(threadId, userId);
    
    // Generate tags using AI
    const tags = await generateThreadTags(messages);
    
    // Update thread with new tags
    const updatedThread = await storage.updateConversationThread(threadId, userId, { tags });
    
    res.json(updatedThread);
  } catch (error) {
    console.error('Error generating thread tags:', error);
    res.status(500).json({ error: 'Failed to generate tags' });
  }
});

// Delete a conversation thread
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteConversationThread(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation thread:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Conversation thread not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
