import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface AISuggestion {
  id: string;
  type: 'grammar' | 'style' | 'clarity' | 'conciseness';
  deleteRange: { from: number; to: number };
  originalText: string;
  suggestedText: string;
  status: 'pending' | 'accepted' | 'rejected' | 'invalid';
  timestamp: number;
}

export interface AISuggestionPluginState {
  suggestions: AISuggestion[];
  decorations: DecorationSet;
}

export const aiSuggestionPluginKey = new PluginKey<AISuggestionPluginState>('aiSuggestions');

// Inject CSS for Canvas-style AI suggestion popups
if (typeof document !== 'undefined' && !document.getElementById('ai-suggestion-styles')) {
  const style = document.createElement('style');
  style.id = 'ai-suggestion-styles';
  style.textContent = `
    @keyframes aiPopupFadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ai-suggestion-highlight {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(139, 92, 246, 0.12));
      border-radius: 3px;
      box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.25);
      transition: all 0.2s ease;
    }

    .dark .ai-suggestion-highlight {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.15));
      box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
    }

    .ai-canvas-popup {
      position: absolute;
      z-index: 99999;
      animation: aiPopupFadeIn 0.3s ease-out;
      pointer-events: none;
    }

    .ai-canvas-popup-card {
      pointer-events: auto;
    }

    .dark .ai-canvas-popup-card {
      background: rgba(30, 41, 59, 0.98) !important;
      border-color: rgba(71, 85, 105, 0.6) !important;
    }

    .dark .ai-canvas-original-text {
      color: #94A3B8 !important;
      background: rgba(71, 85, 105, 0.2) !important;
    }

    .dark .ai-canvas-suggested-text {
      color: #A78BFA !important;
      background: rgba(167, 139, 250, 0.15) !important;
    }

    .dark .ai-canvas-dismiss-btn {
      background: rgba(71, 85, 105, 0.3) !important;
      color: #94A3B8 !important;
      border-color: rgba(71, 85, 105, 0.4) !important;
    }

    .dark .ai-canvas-dismiss-btn:hover {
      background: rgba(239, 68, 68, 0.2) !important;
      color: #FCA5A5 !important;
      border-color: rgba(239, 68, 68, 0.4) !important;
    }
  `;
  document.head.appendChild(style);
}

// Store the editor view globally for positioning calculations
let globalEditorView: any = null;

function createSuggestionDecorations(doc: any, suggestions: AISuggestion[]): DecorationSet {
  const decorations: any[] = [];

  // Only show the first pending suggestion (Canvas-style: one at a time)
  const activeSuggestion = suggestions.find(s => s.status === 'pending');
  
  if (!activeSuggestion) {
    return DecorationSet.empty;
  }

  // Add subtle highlight to the affected text with data attribute for positioning
  decorations.push(
    Decoration.inline(
      activeSuggestion.deleteRange.from,
      activeSuggestion.deleteRange.to,
      {
        class: 'ai-suggestion-highlight',
        'data-suggestion-id': activeSuggestion.id,
        'data-suggestion-anchor': 'true'
      }
    )
  );

  // Create Canvas-style floating popup card
  const popupContainer = document.createElement('div');
  popupContainer.className = 'ai-canvas-popup-container';
  popupContainer.setAttribute('data-suggestion-popup', activeSuggestion.id);
  
  // The actual popup card - use fixed positioning for better control
  const card = document.createElement('div');
  card.className = 'ai-canvas-popup-card';
  
  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  
  // Initial positioning - will be adjusted dynamically
  card.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    min-width: ${isMobile ? '280px' : '320px'};
    max-width: ${isMobile ? '90vw' : '400px'};
    background: white;
    border: 1px solid rgba(203, 213, 225, 0.6);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
    z-index: 99999;
    pointer-events: auto;
    animation: aiPopupFadeIn 0.3s ease-out;
  `.replace(/\s+/g, ' ').trim();

  // Type badge
  const typeBadge = document.createElement('div');
  typeBadge.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #7C3AED;
    background: rgba(124, 58, 237, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `.replace(/\s+/g, ' ').trim();
  
  const typeIcon = document.createElement('span');
  typeIcon.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
    </svg>
  `;
  typeIcon.style.cssText = 'display: inline-flex;';
  
  const typeLabel = activeSuggestion.type.charAt(0).toUpperCase() + activeSuggestion.type.slice(1);
  const typeText = document.createElement('span');
  typeText.textContent = typeLabel;
  
  typeBadge.append(typeIcon, typeText);

  // Original text (muted)
  const originalDiv = document.createElement('div');
  originalDiv.className = 'ai-canvas-original-text';
  originalDiv.style.cssText = `
    font-size: 13px;
    color: #64748B;
    background: rgba(148, 163, 184, 0.08);
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    line-height: 1.5;
    max-height: 80px;
    overflow: auto;
  `.replace(/\s+/g, ' ').trim();
  originalDiv.textContent = activeSuggestion.originalText;

  // Arrow separator
  const arrowDiv = document.createElement('div');
  arrowDiv.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0;
  `.replace(/\s+/g, ' ').trim();
  arrowDiv.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #7C3AED;">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <polyline points="19 12 12 19 5 12"></polyline>
    </svg>
  `;

  // Suggested text (highlighted)
  const suggestedDiv = document.createElement('div');
  suggestedDiv.className = 'ai-canvas-suggested-text';
  suggestedDiv.style.cssText = `
    font-size: 13px;
    color: #8B5CF6;
    background: rgba(139, 92, 246, 0.08);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1.5px solid rgba(139, 92, 246, 0.2);
    margin-bottom: 16px;
    line-height: 1.5;
    font-weight: 500;
    max-height: 80px;
    overflow: auto;
  `.replace(/\s+/g, ' ').trim();
  suggestedDiv.textContent = activeSuggestion.suggestedText;

  // Action buttons container
  const actionsDiv = document.createElement('div');
  actionsDiv.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `.replace(/\s+/g, ' ').trim();

  // Dismiss button
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'ai-canvas-dismiss-btn';
  dismissBtn.textContent = 'Dismiss';
  dismissBtn.style.cssText = `
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: rgba(148, 163, 184, 0.1);
    color: #64748B;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  `.replace(/\s+/g, ' ').trim();
  dismissBtn.setAttribute('data-suggestion-id', activeSuggestion.id);
  dismissBtn.setAttribute('data-action', 'reject');
  dismissBtn.setAttribute('aria-label', 'Dismiss suggestion');
  
  dismissBtn.onmouseenter = () => {
    dismissBtn.style.background = 'rgba(239, 68, 68, 0.1)';
    dismissBtn.style.color = '#EF4444';
    dismissBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    dismissBtn.style.transform = 'translateY(-1px)';
  };
  dismissBtn.onmouseleave = () => {
    dismissBtn.style.background = 'rgba(148, 163, 184, 0.1)';
    dismissBtn.style.color = '#64748B';
    dismissBtn.style.borderColor = 'rgba(148, 163, 184, 0.2)';
    dismissBtn.style.transform = 'translateY(0)';
  };

  // Accept button
  const acceptBtn = document.createElement('button');
  acceptBtn.className = 'ai-canvas-accept-btn';
  acceptBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>Accept</span>
  `;
  acceptBtn.style.cssText = `
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: linear-gradient(135deg, #A78BFA, #8B5CF6);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
  `.replace(/\s+/g, ' ').trim();
  acceptBtn.setAttribute('data-suggestion-id', activeSuggestion.id);
  acceptBtn.setAttribute('data-action', 'accept');
  acceptBtn.setAttribute('aria-label', 'Accept suggestion');
  
  acceptBtn.onmouseenter = () => {
    acceptBtn.style.transform = 'translateY(-1px)';
    acceptBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.35)';
  };
  acceptBtn.onmouseleave = () => {
    acceptBtn.style.transform = 'translateY(0)';
    acceptBtn.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.25)';
  };

  actionsDiv.append(dismissBtn, acceptBtn);
  card.append(typeBadge, originalDiv, arrowDiv, suggestedDiv, actionsDiv);
  popupContainer.appendChild(card);

  // Function to dynamically adjust positioning based on ProseMirror coordinates
  const adjustPosition = () => {
    if (!globalEditorView) return;
    
    try {
      // Use ProseMirror's coordsAtPos to get the exact screen position of the suggestion
      const startCoords = globalEditorView.coordsAtPos(activeSuggestion.deleteRange.from);
      const endCoords = globalEditorView.coordsAtPos(activeSuggestion.deleteRange.to);
      
      if (!startCoords || !endCoords) return;
      
      // Create a rect representing the suggestion range
      const anchorRect = {
        top: startCoords.top,
        bottom: endCoords.bottom,
        left: startCoords.left,
        right: endCoords.right,
        width: endCoords.right - startCoords.left,
        height: endCoords.bottom - startCoords.top
      };
      
      const cardRect = card.getBoundingClientRect();
      
      // Dynamically measure toolbar height by finding header elements
      let actualToolbarHeight = 0;
      const header = document.querySelector('header');
      if (header) {
        actualToolbarHeight = header.getBoundingClientRect().bottom;
      }
      
      // Calculate available space above and below the highlighted text
      const spaceAbove = anchorRect.top - actualToolbarHeight;
      const spaceBelow = window.innerHeight - anchorRect.bottom;
      const cardHeight = cardRect.height;
      const cardWidth = cardRect.width;
      
      // Determine if we should show above or below the highlighted text
      const shouldShowAbove = spaceAbove > cardHeight + 10;
      const shouldShowBelow = !shouldShowAbove && spaceBelow > cardHeight + 10;
      
      // Calculate vertical position (fixed positioning relative to viewport)
      let topPosition;
      if (shouldShowAbove) {
        // Position above the highlighted text
        topPosition = anchorRect.top - cardHeight - 10;
      } else if (shouldShowBelow) {
        // Position below the highlighted text
        topPosition = anchorRect.bottom + 10;
      } else {
        // If not enough space, align with top of highlighted text but ensure visible
        topPosition = Math.max(actualToolbarHeight + 10, Math.min(anchorRect.top, window.innerHeight - cardHeight - 10));
      }
      
      // Calculate horizontal position (center over highlighted text)
      const anchorCenter = anchorRect.left + (anchorRect.width / 2);
      let leftPosition = anchorCenter - (cardWidth / 2);
      
      // Ensure horizontal positioning stays within viewport
      const marginFromEdge = isMobile ? 10 : 20;
      const maxLeft = window.innerWidth - cardWidth - marginFromEdge;
      const minLeft = marginFromEdge;
      
      leftPosition = Math.max(minLeft, Math.min(leftPosition, maxLeft));
      
      // Apply the calculated position (using fixed positioning)
      card.style.top = `${topPosition}px`;
      card.style.left = `${leftPosition}px`;
    } catch (err) {
      console.warn('Failed to position AI suggestion popup:', err);
    }
  };

  // Initial positioning adjustment - wait for DOM to be ready
  setTimeout(adjustPosition, 10);

  // Re-adjust on scroll and resize to handle layout changes
  // Throttle position adjustments to prevent excessive calls
  let adjustmentTimeout: number | null = null;
  const throttledAdjustPosition = () => {
    if (adjustmentTimeout) return; // Skip if already scheduled
    
    adjustmentTimeout = window.setTimeout(() => {
      adjustPosition();
      adjustmentTimeout = null;
    }, 16); // ~60fps
  };

  let resizeObserver: ResizeObserver | null = null;
  
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(throttledAdjustPosition);
    resizeObserver.observe(document.body);
  }
  
  window.addEventListener('scroll', throttledAdjustPosition, true);
  window.addEventListener('resize', throttledAdjustPosition);

  // Cleanup observers when card is removed
  const cleanupObservers = () => {
    if (adjustmentTimeout) {
      clearTimeout(adjustmentTimeout);
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener('scroll', throttledAdjustPosition, true);
    window.removeEventListener('resize', throttledAdjustPosition);
  };

  // Store cleanup function on the card for potential future use
  (card as any)._cleanup = cleanupObservers;

  // Add the popup container to the document body for fixed positioning
  document.body.appendChild(popupContainer);
  
  // Clean up when decoration is removed
  const originalCleanup = (card as any)._cleanup;
  (popupContainer as any)._cleanup = () => {
    originalCleanup?.();
    if (popupContainer.parentNode) {
      popupContainer.parentNode.removeChild(popupContainer);
    }
  };

  return DecorationSet.create(doc, decorations);
}

const aiSuggestionProseMirrorPlugin = new Plugin<AISuggestionPluginState>({
  key: aiSuggestionPluginKey,

  view(editorView) {
    // Store the editor view globally for positioning calculations
    globalEditorView = editorView;
    
    return {
      destroy() {
        globalEditorView = null;
      }
    };
  },

  state: {
    init(_, { doc }) {
      return {
        suggestions: [],
        decorations: DecorationSet.empty
      };
    },

    apply(tr, pluginState) {
      // Map existing decorations through document changes
      let decorations = pluginState.decorations.map(tr.mapping, tr.doc);

      // Map existing suggestions through this transaction
      const updatedSuggestions = pluginState.suggestions.map(suggestion => {
        const mappedFrom = tr.mapping.map(suggestion.deleteRange.from, -1);
        const mappedTo = tr.mapping.map(suggestion.deleteRange.to, 1);

        // Check if suggestion is still valid
        if (mappedFrom >= mappedTo && suggestion.deleteRange.from !== suggestion.deleteRange.to) {
          return { ...suggestion, status: 'invalid' as const };
        }

        return {
          ...suggestion,
          deleteRange: { from: mappedFrom, to: mappedTo }
        };
      }).filter(s => s.status !== 'invalid');

      // Check for new suggestions in transaction metadata
      const newSuggestion = tr.getMeta(aiSuggestionPluginKey);
      const updatedSuggestionsMeta = tr.getMeta('updateSuggestions');

      let finalSuggestions = updatedSuggestions;

      if (newSuggestion) {
        finalSuggestions = [...updatedSuggestions, newSuggestion];
      }

      if (updatedSuggestionsMeta) {
        finalSuggestions = updatedSuggestionsMeta;
      }

      // Recreate decorations if suggestions changed
      if (newSuggestion || updatedSuggestionsMeta) {
        decorations = createSuggestionDecorations(tr.doc, finalSuggestions);
      }

      return {
        suggestions: finalSuggestions,
        decorations
      };
    }
  },

  props: {
    decorations(state) {
      return aiSuggestionPluginKey.getState(state)?.decorations;
    },

    handleDOMEvents: {
      click(view, event) {
        const target = event.target as HTMLElement;
        const button = target.closest('[data-suggestion-id]') as HTMLElement;

        if (!button) return false;

        const suggestionId = button.getAttribute('data-suggestion-id');
        const action = button.getAttribute('data-action');

        if (!suggestionId || !action) return false;

        event.preventDefault();
        event.stopPropagation();

        const pluginState = aiSuggestionPluginKey.getState(view.state);
        if (!pluginState) return true;

        const suggestion = pluginState.suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return true;

        if (action === 'accept') {
          // Apply the suggestion
          const tr = view.state.tr;
          tr.replaceWith(
            suggestion.deleteRange.from,
            suggestion.deleteRange.to,
            view.state.schema.text(suggestion.suggestedText)
          );

          // Update suggestions to remove this one
          const updatedSuggestions = pluginState.suggestions.filter(s => s.id !== suggestionId);
          tr.setMeta('updateSuggestions', updatedSuggestions);

          view.dispatch(tr);
        } else if (action === 'reject') {
          // Just remove the suggestion
          const tr = view.state.tr;
          const updatedSuggestions = pluginState.suggestions.filter(s => s.id !== suggestionId);
          tr.setMeta('updateSuggestions', updatedSuggestions);
          view.dispatch(tr);
        }

        return true;
      }
    }
  }
});

export const AISuggestionsExtension = Extension.create({
  name: 'aiSuggestions',

  addProseMirrorPlugins() {
    return [aiSuggestionProseMirrorPlugin];
  },
});
