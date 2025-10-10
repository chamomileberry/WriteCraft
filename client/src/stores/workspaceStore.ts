import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';

export interface EditorActions {
  insertContent: (content: string) => void;
  replaceContent: (content: string) => void;
  replaceSelection: (content: string) => void;
  selectAll: () => void;
  insertAtCursor: (content: string) => void;
}

export interface PanelDescriptor {
  id: string;
  type: 'characterDetail' | 'contentDetail' | 'searchResults' | 'manuscriptOutline' | 'notes' | 'manuscript' | 'quickNote' | 'writingAssistant';
  title: string;
  entityId?: string;
  contentType?: string;  // For generic content detail panels (weapons, locations, etc.)
  notebookId?: string;  // For characters and other notebook-scoped entities
  data?: any;
  metadata?: { noteId?: string; [key: string]: any };  // Additional metadata for panels
  // Tab system
  mode: 'tabbed' | 'floating' | 'split' | 'docked';
  regionId: 'main' | 'split' | 'docked' | 'floating';
  tabIndex?: number;
  // Docking system
  dockSlot?: string; // For docked panels, specifies which slot (e.g., 'sidebar-top', 'sidebar-middle', 'sidebar-bottom')
  // Position and size for floating panels
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  // Minimize state for panels
  minimized?: boolean;
}

export interface WorkspaceLayout {
  panels: PanelDescriptor[];
  activeTabId?: string; // Currently active tab
  splitMode: boolean; // Whether split screen is enabled
  regions: {
    main: string[]; // Panel IDs in main region tabs
    split: string[]; // Panel IDs in split region tabs
    docked: string[]; // Panel IDs in docked sidebar region
    floating: string[]; // Panel IDs in floating region
  };
}

interface WorkspaceState {
  // Current workspace layout
  currentLayout: WorkspaceLayout;

  // Available panel types registry
  panelRegistry: Record<string, {
    component: string;
    defaultTitle: string;
    icon?: string;
  }>;

  // Mobile drawer state
  isMobileDrawerOpen: boolean;

  // Editor context for AI Writing Assistant
  editorContext: {
    content: string; // Current editor content as plain text
    htmlContent: string; // Current editor content as HTML
    title: string; // Document title (manuscript/guide name)
    type: 'manuscript' | 'guide' | 'section' | 'character' | null; // Type of document being edited
    entityId: string | null; // ID of the document being edited
    notebookId: string | null; // ID of the notebook (for character/worldbuilding context)
  };

  // Editor actions for cross-component communication
  editorActions: EditorActions | null;

  // Actions
  addPanel: (panel: PanelDescriptor) => void;
  removePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<PanelDescriptor>) => void;
  focusPanel: (panelId: string) => void;
  saveLayout: (layout: any) => void;
  resetLayout: () => void;

  // Tab system
  attachToTabBar: (panelId: string, regionId?: 'main' | 'split') => void;
  detachToFloating: (panelId: string, position?: { x: number; y: number }) => void;
  assignToSplit: (panelId: string) => void;
  setActiveTab: (panelId: string, regionId?: 'main' | 'split') => void;
  toggleSplitMode: () => void;
  reorderTabs: (regionId: 'main' | 'split', fromIndex: number, toIndex: number) => void;

  // Panel management
  isPanelOpen: (type: string, entityId?: string) => boolean;
  findPanel: (type: string, entityId?: string) => PanelDescriptor | undefined;
  getTabsInRegion: (regionId: 'main' | 'split') => PanelDescriptor[];
  getFloatingPanels: () => PanelDescriptor[];
  getActiveTab: (regionId?: 'main' | 'split') => PanelDescriptor | undefined;

  // Quick note methods
  toggleQuickNote: () => void;
  openQuickNote: (noteId?: string, savedNoteData?: any) => void;
  closeQuickNote: () => void;
  isQuickNoteOpen: () => boolean;
  minimizePanel: (panelId: string) => void;
  restorePanel: (panelId: string) => void;
  isInManuscriptEditor: () => boolean;

  // Docking system
  getDockedPanels: (slot: string) => PanelDescriptor[];
  dockPanel: (panelId: string, slot: string) => void;
  undockPanel: (panelId: string) => void;

  // Editor context for AI Writing Assistant
  updateEditorContext: (context: Partial<WorkspaceState['editorContext']>) => void;
  clearEditorContext: () => void;
  getEditorContext: () => WorkspaceState['editorContext'];

  // Editor actions for cross-component communication
  registerEditorActions: (actions: EditorActions) => void;
  executeEditorAction: (action: string, ...args: any[]) => boolean;

  // Mobile drawer actions
  toggleMobileDrawer: () => void;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

const defaultLayout: WorkspaceLayout = {
  panels: [],
  activeTabId: undefined,
  splitMode: false,
  regions: {
    main: [],
    split: [],
    docked: [],
    floating: []
  }
};

const defaultPanelRegistry = {
  characterDetail: {
    component: 'CharacterDetailPanel',
    defaultTitle: 'Character Details',
    icon: 'User'
  },
  searchResults: {
    component: 'SearchResultsPanel', 
    defaultTitle: 'Search Results',
    icon: 'Search'
  },
  manuscriptOutline: {
    component: 'ManuscriptOutlinePanel',
    defaultTitle: 'Outline',
    icon: 'List'
  },
  notes: {
    component: 'NotesPanel',
    defaultTitle: 'Notes',
    icon: 'StickyNote'
  },
  quickNote: {
    component: 'QuickNotePanel',
    defaultTitle: 'Quick Note',
    icon: 'StickyNote'
  },
  writingAssistant: {
    component: 'WritingAssistantPanel',
    defaultTitle: 'Writing Assistant',
    icon: 'Sparkles'
  }
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      currentLayout: defaultLayout,
      panelRegistry: defaultPanelRegistry,
      isMobileDrawerOpen: false,
      editorContext: {
        content: '',
        htmlContent: '',
        title: '',
        type: null,
        entityId: null,
        notebookId: null
      },
      editorActions: null,

      addPanel: (panel: PanelDescriptor) => {
        set((state) => {
          // Ensure regions structure exists (handle old persisted states)
          const safeRegions = state.currentLayout.regions || { main: [], split: [], docked: [], floating: [] };
          const safeMainRegion = safeRegions.main || [];
          const safeDockedRegion = safeRegions.docked || [];

          // Check if panel already exists for this entity
          const existingPanel = state.currentLayout.panels.find(
            p => p.type === panel.type && p.entityId === panel.entityId
          );

          if (existingPanel) {
            // Focus existing panel instead of creating duplicate
            get().setActiveTab(existingPanel.id, existingPanel.regionId === 'split' ? 'split' : 'main');
            return state;
          }

          // Set default tab state for new panels - start as tabbed in main region unless explicitly floating or docked
          const newPanel: PanelDescriptor = {
            ...panel,
            mode: panel.mode || 'tabbed', // Preserve explicit mode or default to tabbed
            regionId: panel.mode === 'floating' ? 'floating' : 
                     panel.mode === 'docked' ? 'docked' : 'main', // Use appropriate region for panel mode
            tabIndex: (panel.mode === 'floating' || panel.mode === 'docked') ? undefined : safeMainRegion.length,
            position: panel.position || { x: 400, y: 100 },
            size: panel.size || { width: 350, height: 500 }
          };

          const updatedRegions = {
            ...safeRegions,
            main: newPanel.mode === 'floating' || newPanel.mode === 'docked' ? safeMainRegion : [...safeMainRegion, newPanel.id],
            docked: newPanel.mode === 'docked' ? [...safeDockedRegion, newPanel.id] : safeDockedRegion
          };

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: [...state.currentLayout.panels, newPanel],
              regions: updatedRegions,
              // Only set activeTabId for tabbed panels
              activeTabId: (newPanel.mode === 'tabbed') ? newPanel.id : state.currentLayout.activeTabId
            }
          };
        });
      },

      removePanel: (panelId: string) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          // Remove from regions
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId),
            docked: (state.currentLayout.regions.docked || []).filter(id => id !== panelId),
            floating: (state.currentLayout.regions.floating || []).filter(id => id !== panelId)
          };

          // Only update active tab if removing a tabbed panel that was the active tab
          let newActiveTabId = state.currentLayout.activeTabId;
          if (newActiveTabId === panelId && (panel.mode === 'tabbed')) {
            const regionPanels = panel.regionId === 'split' ? updatedRegions.split : updatedRegions.main;
            newActiveTabId = regionPanels.length > 0 ? regionPanels[0] : undefined;
          }

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: state.currentLayout.panels.filter(p => p.id !== panelId),
              regions: updatedRegions,
              activeTabId: newActiveTabId
            }
          };
        });
      },

      updatePanel: (panelId: string, updates: Partial<PanelDescriptor>) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          // If changing mode or regionId, update regions accordingly
          let updatedRegions = state.currentLayout.regions;
          if (updates.mode || updates.regionId) {
            const newMode = updates.mode || panel.mode;
            const newRegionId = updates.regionId || panel.regionId;

            // Remove from current region
            updatedRegions = {
              main: state.currentLayout.regions.main.filter(id => id !== panelId),
              split: state.currentLayout.regions.split.filter(id => id !== panelId),
              docked: (state.currentLayout.regions.docked || []).filter(id => id !== panelId),
              floating: (state.currentLayout.regions.floating || []).filter(id => id !== panelId)
            };

            // Add to new region if it's not floating (floating panels don't belong to regions)
            if (newMode !== 'floating') {
              const targetRegion = newRegionId as keyof typeof updatedRegions;
              if (updatedRegions[targetRegion]) {
                updatedRegions[targetRegion] = [...updatedRegions[targetRegion], panelId];
              }
            }
          }

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: state.currentLayout.panels.map(p => 
                p.id === panelId ? { ...p, ...updates } : p
              ),
              regions: updatedRegions
            }
          };
        });
      },

      focusPanel: (panelId: string) => {
        const panel = get().currentLayout.panels.find(p => p.id === panelId);
        if (panel) {
          // Handle tabbed panels in main/split regions
          if (panel.mode === 'tabbed') {
            get().setActiveTab(panelId, panel.regionId === 'split' ? 'split' : 'main');
          }
          // Docked and floating panels are always visible, no need for tab activation
          // But we can ensure they're not minimized
          if (panel.minimized) {
            get().updatePanel(panelId, { minimized: false });
          }
        }
      },

      saveLayout: (layout: any) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            layout
          }
        }));
      },

      resetLayout: () => {
        set({ currentLayout: defaultLayout });
      },

      isPanelOpen: (type: string, entityId?: string) => {
        const panels = get().currentLayout.panels;
        return panels.some(p => p.type === type && (!entityId || p.entityId === entityId));
      },

      findPanel: (type: string, entityId?: string) => {
        const panels = get().currentLayout.panels;
        return panels.find(p => p.type === type && (!entityId || p.entityId === entityId));
      },

      // Tab system implementation
      attachToTabBar: (panelId: string, regionId: 'main' | 'split' = 'main') => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          // Remove from floating and add to tabs
          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'tabbed' as const, 
              regionId: regionId as 'main' | 'split' | 'floating', 
              tabIndex: state.currentLayout.regions[regionId].length 
            } : p
          );

          // Remove panel from all regions first, then add to target region  
          const cleanedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId),
            docked: (state.currentLayout.regions.docked || []).filter(id => id !== panelId),
            floating: (state.currentLayout.regions.floating || []).filter(id => id !== panelId)
          };

          const updatedRegions = {
            ...cleanedRegions,
            [regionId]: [...cleanedRegions[regionId], panelId]
          };

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions,
              activeTabId: panelId
            }
          };
        });
      },

      detachToFloating: (panelId: string, position?: { x: number; y: number }) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          // Remove from regions and make floating
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: state.currentLayout.regions.split.filter(id => id !== panelId),
            docked: (state.currentLayout.regions.docked || []).filter(id => id !== panelId),
            floating: (state.currentLayout.regions.floating || []).filter(id => id !== panelId)
          };

          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'floating' as const, 
              regionId: 'floating' as const,
              position: position || p.position || { x: 400, y: 100 }
            } : p
          );

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions
            }
          };
        });
      },

      assignToSplit: (panelId: string) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          // Remove from main region and add to split
          const updatedRegions = {
            main: state.currentLayout.regions.main.filter(id => id !== panelId),
            split: [...state.currentLayout.regions.split, panelId],
            docked: state.currentLayout.regions.docked || [],
            floating: state.currentLayout.regions.floating || []
          };

          const updatedPanels = state.currentLayout.panels.map(p => 
            p.id === panelId ? { 
              ...p, 
              mode: 'tabbed' as const, // Keep as tabbed, just in different region
              regionId: 'split' as const,
              tabIndex: state.currentLayout.regions.split.length 
            } : p
          );

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: updatedPanels,
              regions: updatedRegions,
              splitMode: true, // Always enable split mode when assigning to split
              activeTabId: panelId
            }
          };
        });
      },

      setActiveTab: (panelId: string, regionId: 'main' | 'split' = 'main') => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            activeTabId: panelId === 'manuscript' ? undefined : panelId
          }
        }));
      },

      toggleSplitMode: () => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            splitMode: !state.currentLayout.splitMode
          }
        }));
      },

      reorderTabs: (regionId: 'main' | 'split', fromIndex: number, toIndex: number) => {
        set((state) => {
          const regionPanels = [...state.currentLayout.regions[regionId]];
          const [movedPanel] = regionPanels.splice(fromIndex, 1);
          regionPanels.splice(toIndex, 0, movedPanel);

          return {
            currentLayout: {
              ...state.currentLayout,
              regions: {
                ...state.currentLayout.regions,
                [regionId]: regionPanels
              }
            }
          };
        });
      },

      getTabsInRegion: (regionId: 'main' | 'split') => {
        const state = get();
        // Safety check for undefined regions
        if (!state.currentLayout.regions) {
          console.warn('Workspace regions undefined, using empty array');
          return [];
        }
        const panelIds = state.currentLayout.regions[regionId] || [];
        return panelIds.map(id => 
          state.currentLayout.panels.find(p => p.id === id)!
        ).filter(Boolean);
      },

      getFloatingPanels: () => {
        const state = get();
        return state.currentLayout.panels.filter(p => p.mode === 'floating' && !p.minimized);
      },

      getActiveTab: (regionId: 'main' | 'split' = 'main') => {
        const state = get();
        if (!state.currentLayout.activeTabId) return undefined;

        const activePanel = state.currentLayout.panels.find(p => p.id === state.currentLayout.activeTabId);
        if (!activePanel) return undefined;

        // Return active tab only if it's in the specified region
        return activePanel.regionId === regionId ? activePanel : undefined;
      },

      // Quick note methods
      toggleQuickNote: () => {
        const state = get();
        const quickNote = state.currentLayout.panels.find(p => p.type === 'quickNote');

        if (quickNote) {
          if (quickNote.minimized) {
            // If minimized, restore it
            get().restorePanel(quickNote.id);
          } else {
            // If visible, close it
            get().closeQuickNote();
          }
        } else {
          // If not open, open it
          get().openQuickNote();
        }
      },

      openQuickNote: (noteId?: string, savedNoteData?: any) => {
        const state = get();
        const existingQuickNote = state.currentLayout.panels.find(p => p.type === 'quickNote');

        if (!existingQuickNote) {
          // Create new quick note panel as floating
          // Calculate mobile-friendly position
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const panelWidth = isMobile ? Math.min(window.innerWidth - 20, 300) : 300;
          const panelHeight = isMobile ? Math.min(window.innerHeight - 100, 400) : 400;
          const xPosition = isMobile ? 10 : Math.max(10, window.innerWidth - 350);
          const yPosition = isMobile ? 70 : 100; // Account for header on mobile

          const quickNotePanel: PanelDescriptor = {
            id: `quick-note-${nanoid()}`,
            type: 'quickNote',
            title: savedNoteData?.title || 'Quick Note',
            mode: 'floating',
            regionId: 'floating',
            position: { x: xPosition, y: yPosition },
            size: { width: panelWidth, height: panelHeight },
            metadata: noteId ? { noteId, savedNoteData } : undefined
          };

          get().addPanel(quickNotePanel);
        } else {
          // If opening a different saved note, update the panel metadata
          if (noteId && existingQuickNote.metadata?.noteId !== noteId) {
            get().updatePanel(existingQuickNote.id, { 
              metadata: { noteId, savedNoteData },
              title: savedNoteData?.title || 'Loading...'
            });
          }
          
          // If minimized, restore it first
          if (existingQuickNote.minimized) {
            get().restorePanel(existingQuickNote.id);
          }
          // Focus existing panel
          get().focusPanel(existingQuickNote.id);
        }
      },

      closeQuickNote: () => {
        const state = get();
        const quickNotePanel = state.currentLayout.panels.find(p => p.type === 'quickNote');

        if (quickNotePanel) {
          get().removePanel(quickNotePanel.id);
        }
      },

      isQuickNoteOpen: () => {
        const state = get();
        return state.currentLayout.panels.some(p => p.type === 'quickNote');
      },

      minimizePanel: (panelId: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p => 
              p.id === panelId ? { ...p, minimized: true } : p
            )
          }
        }));
      },

      restorePanel: (panelId: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p => 
              p.id === panelId ? { ...p, minimized: false } : p
            )
          }
        }));
      },

      isInManuscriptEditor: () => {
        // Check if current URL contains manuscript editor paths
        return window.location.pathname.includes('/manuscripts/') && 
               window.location.pathname.includes('/edit');
      },

      // Docking system implementation
      getDockedPanels: (slot: string) => {
        const state = get();
        return state.currentLayout.panels.filter(p => 
          p.mode === 'docked' && p.dockSlot === slot
        );
      },

      dockPanel: (panelId: string, slot: string) => {
        set((state) => ({
          currentLayout: {
            ...state.currentLayout,
            panels: state.currentLayout.panels.map(p =>
              p.id === panelId
                ? { ...p, mode: 'docked', regionId: 'docked', dockSlot: slot }
                : p
            ),
            // Add to docked region if not already there
            regions: {
              ...state.currentLayout.regions,
              docked: state.currentLayout.regions.docked.includes(panelId)
                ? state.currentLayout.regions.docked
                : [...state.currentLayout.regions.docked, panelId],
              // Remove from other regions
              main: state.currentLayout.regions.main.filter(id => id !== panelId),
              split: state.currentLayout.regions.split.filter(id => id !== panelId),
              floating: state.currentLayout.regions.floating.filter(id => id !== panelId)
            }
          }
        }));
      },

      undockPanel: (panelId: string) => {
        set((state) => {
          const panel = state.currentLayout.panels.find(p => p.id === panelId);
          if (!panel) return state;

          return {
            currentLayout: {
              ...state.currentLayout,
              panels: state.currentLayout.panels.map(p =>
                p.id === panelId
                  ? { ...p, mode: 'tabbed', regionId: 'main', dockSlot: undefined }
                  : p
              ),
              // Move to main region
              regions: {
                ...state.currentLayout.regions,
                main: [...state.currentLayout.regions.main, panelId],
                docked: state.currentLayout.regions.docked.filter(id => id !== panelId),
                split: state.currentLayout.regions.split.filter(id => id !== panelId),
                floating: state.currentLayout.regions.floating.filter(id => id !== panelId)
              }
            }
          };
        });
      },

      // Editor context methods for AI Writing Assistant
      updateEditorContext: (context: Partial<WorkspaceState['editorContext']>) => {
        set((state) => ({
          editorContext: {
            ...state.editorContext,
            ...context
          }
        }));
      },

      clearEditorContext: () => {
        set({
          editorContext: {
            content: '',
            htmlContent: '',
            title: '',
            type: null,
            entityId: null,
            notebookId: null
          }
        });
      },

      getEditorContext: () => {
        return get().editorContext;
      },

      registerEditorActions: (actions: EditorActions) => {
        set({ editorActions: actions });
      },

      executeEditorAction: (action: string, ...args: any[]): boolean => {
        const editorActions = get().editorActions;
        if (!editorActions) {
          console.warn('No editor actions registered');
          return false;
        }

        if (action in editorActions) {
          try {
            (editorActions as any)[action](...args);
            return true;
          } catch (error) {
            console.error(`Failed to execute editor action ${action}:`, error);
            return false;
          }
        } else {
          console.warn(`Unknown editor action: ${action}`);
          return false;
        }
      },

      // Mobile drawer actions
      toggleMobileDrawer: () => {
        set((state) => ({
          isMobileDrawerOpen: !state.isMobileDrawerOpen
        }));
      },

      openMobileDrawer: () => {
        set({ isMobileDrawerOpen: true });
      },

      closeMobileDrawer: () => {
        set({ isMobileDrawerOpen: false });
      }
    }),
    {
      name: 'writecraft-workspace',
      // Only persist layout and panels, not editor context (it's transient)
      partialize: (state) => ({
        currentLayout: state.currentLayout
      })
    }
  )
);