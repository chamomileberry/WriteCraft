import { useWorkspaceStore, PanelDescriptor, WorkspaceLayout, EditorActions } from '@/stores/workspaceStore';
import { shallow } from 'zustand/shallow';

/**
 * Custom hooks for Workspace Store
 * 
 * These hooks provide a clean, organized interface for accessing workspace state.
 * Benefits:
 * - Cleaner component code
 * - Consistent selectors across the app
 * - Easier to refactor store internals
 * - Better testability
 */

// ============================================================================
// STATE SELECTORS
// ============================================================================

/**
 * Get the current workspace layout
 */
export function useWorkspaceLayout(): WorkspaceLayout {
  return useWorkspaceStore((state) => state.currentLayout);
}

/**
 * Get all panels in the workspace
 */
export function useWorkspacePanels(): PanelDescriptor[] {
  return useWorkspaceStore((state) => state.currentLayout.panels);
}

/**
 * Get the active tab ID
 */
export function useActiveTabId(): string | undefined {
  return useWorkspaceStore((state) => state.currentLayout.activeTabId);
}

/**
 * Get whether split mode is enabled
 */
export function useSplitMode(): boolean {
  return useWorkspaceStore((state) => state.currentLayout.splitMode);
}

/**
 * Get panels in a specific region
 */
export function useTabsInRegion(regionId: 'main' | 'split'): PanelDescriptor[] {
  return useWorkspaceStore((state) => state.getTabsInRegion(regionId));
}

/**
 * Get floating panels
 */
export function useFloatingPanels(): PanelDescriptor[] {
  return useWorkspaceStore((state) => state.getFloatingPanels());
}

/**
 * Get docked panels in a specific slot
 */
export function useDockedPanels(slot: string): PanelDescriptor[] {
  return useWorkspaceStore((state) => state.getDockedPanels(slot));
}

/**
 * Get the active tab in a region
 */
export function useActiveTab(regionId?: 'main' | 'split'): PanelDescriptor | undefined {
  return useWorkspaceStore((state) => state.getActiveTab(regionId));
}

/**
 * Check if a panel is open
 */
export function useIsPanelOpen(type: string, entityId?: string): boolean {
  return useWorkspaceStore((state) => state.isPanelOpen(type, entityId));
}

/**
 * Find a specific panel
 */
export function useFindPanel(type: string, entityId?: string): PanelDescriptor | undefined {
  return useWorkspaceStore((state) => state.findPanel(type, entityId));
}

// ============================================================================
// EDITOR CONTEXT
// ============================================================================

/**
 * Get the current editor context
 */
export function useEditorContext() {
  return useWorkspaceStore((state) => state.editorContext);
}

/**
 * Get editor actions for cross-component communication
 */
export function useEditorActions(): EditorActions | null {
  return useWorkspaceStore((state) => state.editorActions);
}

/**
 * Check if currently in manuscript editor
 */
export function useIsInManuscriptEditor(): boolean {
  return useWorkspaceStore((state) => state.isInManuscriptEditor());
}

// ============================================================================
// MOBILE STATE
// ============================================================================

/**
 * Get mobile drawer state
 */
export function useIsMobileDrawerOpen(): boolean {
  return useWorkspaceStore((state) => state.isMobileDrawerOpen);
}

/**
 * Check if quick note is open
 */
export function useIsQuickNoteOpen(): boolean {
  return useWorkspaceStore((state) => state.isQuickNoteOpen());
}

// ============================================================================
// PANEL MANAGEMENT ACTIONS
// ============================================================================

/**
 * Get all panel management actions
 * Use this when you need multiple actions in a component
 */
export function usePanelActions() {
  return useWorkspaceStore((state) => ({
    addPanel: state.addPanel,
    removePanel: state.removePanel,
    updatePanel: state.updatePanel,
    focusPanel: state.focusPanel,
    minimizePanel: state.minimizePanel,
    restorePanel: state.restorePanel,
  }), shallow);
}

/**
 * Add a new panel to the workspace
 */
export function useAddPanel() {
  return useWorkspaceStore((state) => state.addPanel);
}

/**
 * Remove a panel from the workspace
 */
export function useRemovePanel() {
  return useWorkspaceStore((state) => state.removePanel);
}

/**
 * Update a panel in the workspace
 */
export function useUpdatePanel() {
  return useWorkspaceStore((state) => state.updatePanel);
}

/**
 * Focus a specific panel
 */
export function useFocusPanel() {
  return useWorkspaceStore((state) => state.focusPanel);
}

/**
 * Minimize a panel
 */
export function useMinimizePanel() {
  return useWorkspaceStore((state) => state.minimizePanel);
}

/**
 * Restore a minimized panel
 */
export function useRestorePanel() {
  return useWorkspaceStore((state) => state.restorePanel);
}

// ============================================================================
// TAB SYSTEM ACTIONS
// ============================================================================

/**
 * Get all tab system actions
 */
export function useTabActions() {
  return useWorkspaceStore((state) => ({
    attachToTabBar: state.attachToTabBar,
    detachToFloating: state.detachToFloating,
    assignToSplit: state.assignToSplit,
    setActiveTab: state.setActiveTab,
    toggleSplitMode: state.toggleSplitMode,
    reorderTabs: state.reorderTabs,
  }), shallow);
}

/**
 * Attach a panel to the tab bar
 */
export function useAttachToTabBar() {
  return useWorkspaceStore((state) => state.attachToTabBar);
}

/**
 * Detach a panel to floating mode
 */
export function useDetachToFloating() {
  return useWorkspaceStore((state) => state.detachToFloating);
}

/**
 * Assign a panel to split region
 */
export function useAssignToSplit() {
  return useWorkspaceStore((state) => state.assignToSplit);
}

/**
 * Set the active tab
 */
export function useSetActiveTab() {
  return useWorkspaceStore((state) => state.setActiveTab);
}

/**
 * Toggle split screen mode
 */
export function useToggleSplitMode() {
  return useWorkspaceStore((state) => state.toggleSplitMode);
}

/**
 * Reorder tabs in a region
 */
export function useReorderTabs() {
  return useWorkspaceStore((state) => state.reorderTabs);
}

// ============================================================================
// DOCKING ACTIONS
// ============================================================================

/**
 * Get docking actions
 */
export function useDockingActions() {
  return useWorkspaceStore((state) => ({
    dockPanel: state.dockPanel,
    undockPanel: state.undockPanel,
  }), shallow);
}

/**
 * Dock a panel to the sidebar
 */
export function useDockPanel() {
  return useWorkspaceStore((state) => state.dockPanel);
}

/**
 * Undock a panel from the sidebar
 */
export function useUndockPanel() {
  return useWorkspaceStore((state) => state.undockPanel);
}

// ============================================================================
// QUICK NOTE ACTIONS
// ============================================================================

/**
 * Get quick note actions
 */
export function useQuickNoteActions() {
  return useWorkspaceStore((state) => ({
    toggleQuickNote: state.toggleQuickNote,
    openQuickNote: state.openQuickNote,
    closeQuickNote: state.closeQuickNote,
  }), shallow);
}

/**
 * Toggle quick note panel
 */
export function useToggleQuickNote() {
  return useWorkspaceStore((state) => state.toggleQuickNote);
}

/**
 * Open quick note panel
 */
export function useOpenQuickNote() {
  return useWorkspaceStore((state) => state.openQuickNote);
}

/**
 * Close quick note panel
 */
export function useCloseQuickNote() {
  return useWorkspaceStore((state) => state.closeQuickNote);
}

// ============================================================================
// EDITOR CONTEXT ACTIONS
// ============================================================================

/**
 * Get editor context actions
 */
export function useEditorContextActions() {
  return useWorkspaceStore((state) => ({
    updateEditorContext: state.updateEditorContext,
    clearEditorContext: state.clearEditorContext,
    registerEditorActions: state.registerEditorActions,
    executeEditorAction: state.executeEditorAction,
  }), shallow);
}

/**
 * Update editor context
 */
export function useUpdateEditorContext() {
  return useWorkspaceStore((state) => state.updateEditorContext);
}

/**
 * Clear editor context
 */
export function useClearEditorContext() {
  return useWorkspaceStore((state) => state.clearEditorContext);
}

/**
 * Register editor actions
 */
export function useRegisterEditorActions() {
  return useWorkspaceStore((state) => state.registerEditorActions);
}

/**
 * Execute an editor action
 */
export function useExecuteEditorAction() {
  return useWorkspaceStore((state) => state.executeEditorAction);
}

// ============================================================================
// MOBILE DRAWER ACTIONS
// ============================================================================

/**
 * Get mobile drawer actions
 */
export function useMobileDrawerActions() {
  return useWorkspaceStore((state) => ({
    toggleMobileDrawer: state.toggleMobileDrawer,
    openMobileDrawer: state.openMobileDrawer,
    closeMobileDrawer: state.closeMobileDrawer,
  }), shallow);
}

/**
 * Toggle mobile drawer
 */
export function useToggleMobileDrawer() {
  return useWorkspaceStore((state) => state.toggleMobileDrawer);
}

/**
 * Open mobile drawer
 */
export function useOpenMobileDrawer() {
  return useWorkspaceStore((state) => state.openMobileDrawer);
}

/**
 * Close mobile drawer
 */
export function useCloseMobileDrawer() {
  return useWorkspaceStore((state) => state.closeMobileDrawer);
}

// ============================================================================
// LAYOUT ACTIONS
// ============================================================================

/**
 * Get layout management actions
 */
export function useLayoutActions() {
  return useWorkspaceStore((state) => ({
    saveLayout: state.saveLayout,
    resetLayout: state.resetLayout,
  }), shallow);
}

/**
 * Save the current layout
 */
export function useSaveLayout() {
  return useWorkspaceStore((state) => state.saveLayout);
}

/**
 * Reset layout to default
 */
export function useResetLayout() {
  return useWorkspaceStore((state) => state.resetLayout);
}
