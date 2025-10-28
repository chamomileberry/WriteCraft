import { apiRequest } from '@/lib/queryClient';

/**
 * Centralized API functions for WriteCraft
 * 
 * This file provides a clean, organized interface for all API calls throughout the application.
 * Benefits:
 * - Single source of truth for API endpoints
 * - Easier to test and maintain
 * - Type-safe API calls
 * - Consistent error handling
 */

// ============================================================================
// AUTH
// ============================================================================

export const authApi = {
  getUser: async () => {
    const res = await fetch('/api/auth/user', { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  },

  login: () => {
    window.location.href = '/api/login';
  },

  logout: async () => {
    const res = await apiRequest('POST', '/api/logout',);
    return res.json();
  },

  updateProfile: async (updates: { displayName?: string; avatarUrl?: string }) => {
    const res = await apiRequest('PUT', '/api/auth/user', updates);
    return res.json();
  },
};

// ============================================================================
// NOTEBOOKS
// ============================================================================

export const notebooksApi = {
  list: async () => {
    const res = await fetch('/api/notebooks', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch notebooks');
    return res.json();
  },

  create: async (data: { name: string; description?: string; imageUrl?: string }) => {
    const res = await apiRequest('POST', '/api/notebooks', data);
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/notebooks/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch notebook');
    return res.json();
  },

  update: async (id: string, updates: { name?: string; description?: string; imageUrl?: string }) => {
    const res = await apiRequest('PUT', `/api/notebooks/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/notebooks/${id}`);
    return res.json();
  },
};

// ============================================================================
// CHARACTERS
// ============================================================================

export const charactersApi = {
  list: async (notebookId: string) => {
    const res = await fetch(`/api/characters?notebookId=${notebookId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch characters');
    return res.json();
  },

  get: async (id: string, notebookId?: string) => {
    const url = notebookId 
      ? `/api/characters/${id}?notebookId=${notebookId}`
      : `/api/characters/${id}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch character');
    return res.json();
  },

  create: async (data: any) => {
    const res = await apiRequest('POST', '/api/characters', data);
    return res.json();
  },

  update: async (id: string, updates: any) => {
    const res = await apiRequest('PUT', `/api/characters/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/characters/${id}`);
    return res.json();
  },

  generate: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-character', params);
    return res.json();
  },

  autocomplete: async (field: string, query: string, notebookId?: string) => {
    const url = notebookId
      ? `/api/characters/autocomplete/${field}?q=${encodeURIComponent(query)}&notebookId=${notebookId}`
      : `/api/characters/autocomplete/${field}?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return [];
    return res.json();
  },

  consolidate: {
    getIncomplete: async (notebookId: string) => {
      const res = await fetch(`/api/characters/consolidate/incomplete?notebookId=${notebookId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch incomplete characters');
      return res.json();
    },

    getDuplicates: async (notebookId: string, threshold: number = 85) => {
      const res = await fetch(`/api/characters/consolidate/duplicates?notebookId=${notebookId}&threshold=${threshold}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch duplicate characters');
      return res.json();
    },

    getStats: async (notebookId: string) => {
      const res = await fetch(`/api/characters/consolidate/stats?notebookId=${notebookId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },

    mergeCharacters: async (sourceId: string, targetId: string) => {
      const res = await apiRequest('POST', '/api/characters/consolidate/merge', { sourceId, targetId });
      return res.json();
    },

    deleteCharacter: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/characters/${id}`);
      return res.json();
    },
  },
};

// ============================================================================
// PROJECTS
// ============================================================================

export const projectsApi = {
  list: async () => {
    const res = await fetch('/api/projects', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  search: async (query: string) => {
    const res = await fetch(`/api/projects/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to search projects');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  create: async (data: { title: string; description?: string; genre?: string }) => {
    const res = await apiRequest('POST', '/api/projects', data);
    return res.json();
  },

  update: async (id: string, updates: { title?: string; description?: string; genre?: string }) => {
    const res = await apiRequest('PUT', `/api/projects/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/projects/${id}`);
    return res.json();
  },

  sections: {
    list: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}/sections`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },

    get: async (projectId: string, sectionId: string) => {
      const res = await fetch(`/api/projects/${projectId}/sections/${sectionId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch section');
      return res.json();
    },

    create: async (projectId: string, data: { title: string; parentId?: string; order?: number }) => {
      const res = await apiRequest('POST', `/api/projects/${projectId}/sections`, data);
      return res.json();
    },

    update: async (projectId: string, sectionId: string, updates: { title?: string; content?: string; parentId?: string; order?: number }) => {
      const res = await apiRequest('PUT', `/api/projects/${projectId}/sections/${sectionId}`, updates);
      return res.json();
    },

    delete: async (projectId: string, sectionId: string) => {
      const res = await apiRequest('DELETE', `/api/projects/${projectId}/sections/${sectionId}`);
      return res.json();
    },

    reorder: async (projectId: string, updates: Array<{ id: string; order: number; parentId: string | null }>) => {
      const res = await apiRequest('PUT', `/api/projects/${projectId}/sections/reorder`, { updates });
      return res.json();
    },
  },
};

// ============================================================================
// SAVED ITEMS (Generic content storage)
// ============================================================================

export const savedItemsApi = {
  list: async (userId?: string, notebookId?: string, type?: string) => {
    let url = '/api/saved-items';
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (notebookId) params.append('notebookId', notebookId);
    if (type) params.append('type', type);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch saved items');
    return res.json();
  },

  listByNotebook: async (notebookId: string, type?: string) => {
    let url = `/api/saved-items/notebook/${notebookId}`;
    if (type) url += `?type=${type}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch saved items');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/saved-items/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch item');
    return res.json();
  },

  create: async (data: { userId: string; itemType: string; itemId: string; notebookId?: string; itemData?: any }) => {
    const res = await apiRequest('POST', '/api/saved-items', data);
    return res.json();
  },

  update: async (id: string, updates: any) => {
    const res = await apiRequest('PUT', `/api/saved-items/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/saved-items/${id}`);
    return res.json();
  },

  deleteByItemId: async (itemId: string) => {
    const res = await apiRequest('DELETE', `/api/saved-items/item/${itemId}`);
    return res.json();
  },
};

// ============================================================================
// GUIDES
// ============================================================================

export const guidesApi = {
  list: async (category?: string, searchTerm?: string) => {
    let url = '/api/guides';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (searchTerm) params.append('search', searchTerm);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch guides');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/guides/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch guide');
    return res.json();
  },

  create: async (data: { title: string; category: string; content: string; description?: string }) => {
    const res = await apiRequest('POST', '/api/guides', data);
    return res.json();
  },

  update: async (id: string, updates: { title?: string; category?: string; content?: string; description?: string }) => {
    const res = await apiRequest('PUT', `/api/guides/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/guides/${id}`);
    return res.json();
  },
};

// ============================================================================
// GENERATORS
// ============================================================================

export const generatorsApi = {
  character: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-character', params);
    return res.json();
  },

  name: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-name', params);
    return res.json();
  },

  plot: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-plot', params);
    return res.json();
  },

  setting: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-setting', params);
    return res.json();
  },

  creature: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-creature', params);
    return res.json();
  },

  conflict: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-conflict', params);
    return res.json();
  },

  theme: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-theme', params);
    return res.json();
  },

  mood: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-mood', params);
    return res.json();
  },

  description: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-description', params);
    return res.json();
  },

  plant: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-plant', params);
    return res.json();
  },

  prompt: async (params: any) => {
    const res = await apiRequest('POST', '/api/ai/generate-prompt', params);
    return res.json();
  },
};

// ============================================================================
// AI WRITING ASSISTANT
// ============================================================================

export const writingAssistantApi = {
  analyze: async (params: { text: string; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/analyze', params);
    return res.json();
  },

  rephrase: async (params: { text: string; style?: string; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/rephrase', params);
    return res.json();
  },

  proofread: async (params: { text: string; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/proofread', params);
    return res.json();
  },

  synonyms: async (params: { word: string; context?: string }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/synonyms', params);
    return res.json();
  },

  definition: async (params: { word: string }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/definition', params);
    return res.json();
  },

  questions: async (params: { text: string; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/questions', params);
    return res.json();
  },

  improve: async (params: { text: string; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/improve', params);
    return res.json();
  },

  chat: async (params: { message: string; conversationHistory?: any[]; context?: any }) => {
    const res = await apiRequest('POST', '/api/writing-assistant/chat', params);
    return res.json();
  },
};

// ============================================================================
// AI FIELD ASSIST (Context-aware field suggestions)
// ============================================================================

export const aiFieldAssistApi = {
  suggest: async (params: { field: string; context: any; notebookId?: string }) => {
    const res = await apiRequest('POST', '/api/ai/field-assist', params);
    return res.json();
  },
};

// ============================================================================
// UPLOAD
// ============================================================================

export const uploadApi = {
  initiateImageUpload: async (filename: string, contentType: string) => {
    const res = await apiRequest('POST', '/api/upload/image', { filename, contentType });
    return res.json();
  },

  uploadToPresignedUrl: async (presignedUrl: string, file: File) => {
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res;
  },

  finalizeUpload: async (objectPath: string) => {
    const res = await apiRequest('POST', '/api/upload/finalize', { objectPath });
    return res.json();
  },
};

// ============================================================================
// SEARCH
// ============================================================================

export const searchApi = {
  global: async (query: string) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
  },
};

// ============================================================================
// PINNED CONTENT
// ============================================================================

export const pinnedContentApi = {
  list: async () => {
    const res = await fetch('/api/pinned-content', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch pinned content');
    return res.json();
  },

  create: async (data: { contentType: string; contentId: string; title: string; subtitle?: string }) => {
    const res = await apiRequest('POST', '/api/pinned-content', data);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/pinned-content/${id}`);
    return res.json();
  },
};

// ============================================================================
// NOTES (Hierarchical note system)
// ============================================================================

export const notesApi = {
  list: async (userId?: string, type?: string, documentId?: string) => {
    let url = '/api/notes';
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (type) params.append('type', type);
    if (documentId) params.append('documentId', documentId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch note');
    return res.json();
  },

  create: async (data: { title: string; content?: string; type: string; parentId?: string; documentId?: string }) => {
    const res = await apiRequest('POST', '/api/notes', data);
    return res.json();
  },

  update: async (id: string, updates: any) => {
    const res = await apiRequest('PUT', `/api/notes/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/notes/${id}`);
    return res.json();
  },
};

// ============================================================================
// QUICK NOTES (Temporary workspace notes)
// ============================================================================

export const quickNotesApi = {
  list: async () => {
    const res = await fetch('/api/quick-note', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quick notes');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`/api/quick-note/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch quick note');
    return res.json();
  },

  create: async (data: { title?: string; content: string }) => {
    const res = await apiRequest('POST', '/api/quick-note', data);
    return res.json();
  },

  update: async (id: string, updates: { title?: string; content: string }) => {
    const res = await apiRequest('PUT', `/api/quick-note/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/quick-note/${id}`);
    return res.json();
  },
};

// ============================================================================
// CHAT MESSAGES (Writing Assistant history)
// ============================================================================

export const chatMessagesApi = {
  list: async (conversationId?: string) => {
    let url = '/api/chat-messages';
    if (conversationId) url += `?conversationId=${conversationId}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch chat messages');
    return res.json();
  },

  create: async (data: { conversationId: string; role: string; content: string }) => {
    const res = await apiRequest('POST', '/api/chat-messages', data);
    return res.json();
  },

  delete: async (conversationId: string) => {
    const res = await apiRequest('DELETE', `/api/chat-messages?conversationId=${conversationId}`);
    return res.json();
  },
};

// ============================================================================
// COLLABORATION
// ============================================================================

export const collaborationApi = {
  shares: {
    list: async (resourceType: string, resourceId: string) => {
      const res = await fetch(`/api/shares/${resourceType}/${resourceId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shares');
      return res.json();
    },

    create: async (data: { resourceType: string; resourceId: string; sharedWithEmail: string; permission: string }) => {
      const res = await apiRequest('POST', '/api/shares', data);
      return res.json();
    },

    update: async (id: string, permission: string) => {
      const res = await apiRequest('PUT', `/api/shares/${id}`, { permission });
      return res.json();
    },

    delete: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/shares/${id}`);
      return res.json();
    },

    getSharedWithMe: async () => {
      const res = await fetch('/api/shares/shared-with-me', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shared resources');
      return res.json();
    },
  },
};

// ============================================================================
// IMPORT (World Anvil)
// ============================================================================

export const importApi = {
  upload: async (formData: FormData) => {
    const res = await fetch('/api/import/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to upload import file');
    return res.json();
  },

  status: async (jobId: string) => {
    const res = await fetch(`/api/import/status/${jobId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch import status');
    return res.json();
  },

  history: async () => {
    const res = await fetch('/api/import/history', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch import history');
    return res.json();
  },
};

// ============================================================================
// STOCK IMAGES & AI IMAGES
// ============================================================================

export const imagesApi = {
  pexels: {
    search: async (query: string, perPage: number = 15) => {
      const res = await fetch(`/api/pexels/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to search images');
      return res.json();
    },
  },

  stockImages: {
    search: async (query: string, count: number = 9) => {
      const res = await fetch(`/api/stock-images/search?query=${encodeURIComponent(query)}&count=${count}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to search stock images');
      return res.json();
    },
  },

  dalle: {
    generate: async (prompt: string, size: string = '1024x1024') => {
      const res = await apiRequest('POST', '/api/dalle/generate', { prompt, size });
      return res.json();
    },
  },
};

// ============================================================================
// ADMIN
// ============================================================================

export const adminApi = {
  bannedPhrases: {
    list: async (category?: string, search?: string, active?: boolean) => {
      let url = '/api/admin/banned-phrases';
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (active !== undefined) params.append('active', active.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch banned phrases');
      return res.json();
    },

    create: async (data: { phrase: string; category: string; isActive?: boolean }) => {
      const res = await apiRequest('POST', '/api/admin/banned-phrases', data);
      return res.json();
    },

    update: async (id: string, updates: { phrase?: string; category?: string; isActive?: boolean }) => {
      const res = await apiRequest('PUT', `/api/admin/banned-phrases/${id}`, updates);
      return res.json();
    },

    delete: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/admin/banned-phrases/${id}`);
      return res.json();
    },
  },
};

// ============================================================================
// FAMILY TREE
// ============================================================================

export const familyTreeApi = {
  get: async (notebookId: string) => {
    const res = await fetch(`/api/family-tree/${notebookId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch family tree');
    return res.json();
  },

  save: async (notebookId: string, data: any) => {
    const res = await apiRequest('POST', `/api/family-tree/${notebookId}`, data);
    return res.json();
  },
};

// ============================================================================
// FOLDERS (Hierarchical organization)
// ============================================================================

export const foldersApi = {
  list: async (userId?: string, type?: string, documentId?: string) => {
    let url = '/api/folders';
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (type) params.append('type', type);
    if (documentId) params.append('documentId', documentId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch folders');
    return res.json();
  },

  create: async (data: { name: string; type: string; parentId?: string; documentId?: string }) => {
    const res = await apiRequest('POST', '/api/folders', data);
    return res.json();
  },

  update: async (id: string, updates: any) => {
    const res = await apiRequest('PUT', `/api/folders/${id}`, updates);
    return res.json();
  },

  delete: async (id: string) => {
    const res = await apiRequest('DELETE', `/api/folders/${id}`);
    return res.json();
  },
};
