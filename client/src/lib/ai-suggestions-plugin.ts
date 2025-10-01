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

// Inject CSS animations for AI suggestions
if (typeof document !== 'undefined' && !document.getElementById('ai-suggestion-styles')) {
  const style = document.createElement('style');
  style.id = 'ai-suggestion-styles';
  style.textContent = `
    @keyframes aiSuggestionFadeIn {
      from {
        opacity: 0;
        transform: translateY(-2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dark .ai-suggestion-actions {
      background: rgba(30, 41, 59, 0.95) !important;
      border-color: rgba(71, 85, 105, 0.6) !important;
    }

    .dark .ai-reject-btn {
      background: rgba(71, 85, 105, 0.3) !important;
      color: #94A3B8 !important;
      border-color: rgba(71, 85, 105, 0.4) !important;
    }

    .dark .ai-reject-btn:hover {
      background: rgba(239, 68, 68, 0.2) !important;
      color: #FCA5A5 !important;
      border-color: rgba(239, 68, 68, 0.4) !important;
    }
  `;
  document.head.appendChild(style);
}

function createSuggestionDecorations(doc: any, suggestions: AISuggestion[]): DecorationSet {
  const decorations: any[] = [];

  suggestions.forEach(suggestion => {
    if (suggestion.status !== 'pending') return;

    // Modern inline decoration for deletions - soft purple with elegant dotted underline
    decorations.push(
      Decoration.inline(
        suggestion.deleteRange.from,
        suggestion.deleteRange.to,
        {
          class: 'ai-suggestion-deletion',
          style: `
            opacity: 0.6;
            text-decoration: underline dotted 2px;
            text-decoration-color: #A78BFA;
            background: linear-gradient(to bottom, transparent 50%, rgba(167, 139, 250, 0.08) 50%);
            transition: all 0.2s ease;
          `.replace(/\s+/g, ' ').trim()
        }
      )
    );

    // Modern widget for suggested text - soft blue with gentle glow
    const suggestedTextWidget = document.createElement('span');
    suggestedTextWidget.className = 'ai-suggestion-addition';
    suggestedTextWidget.textContent = suggestion.suggestedText;
    suggestedTextWidget.style.cssText = `
      color: #3B82F6;
      background: linear-gradient(135deg, rgba(96, 165, 250, 0.12), rgba(147, 197, 253, 0.12));
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
      box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.2);
      animation: aiSuggestionFadeIn 0.3s ease-out;
      transition: all 0.2s ease;
    `.replace(/\s+/g, ' ').trim();

    decorations.push(
      Decoration.widget(suggestion.deleteRange.to, () => suggestedTextWidget, { side: 1 })
    );

    // Modern floating action card with type badge
    const actionCard = document.createElement('span');
    actionCard.className = 'ai-suggestion-actions';
    actionCard.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 8px;
      padding: 4px 6px;
      background: white;
      border: 1px solid rgba(203, 213, 225, 0.6);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
      animation: aiSuggestionFadeIn 0.3s ease-out;
      vertical-align: middle;
    `.replace(/\s+/g, ' ').trim();

    // Type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = 'ai-suggestion-type-badge';
    const typeLabel = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1);
    typeBadge.textContent = typeLabel;
    typeBadge.style.cssText = `
      font-size: 10px;
      font-weight: 600;
      color: #7C3AED;
      background: rgba(124, 58, 237, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: capitalize;
      letter-spacing: 0.3px;
    `.replace(/\s+/g, ' ').trim();

    // Accept button with icon
    const acceptBtn = document.createElement('button');
    acceptBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    acceptBtn.className = 'ai-accept-btn';
    acceptBtn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #3B82F6, #2563EB);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
    `.replace(/\s+/g, ' ').trim();
    acceptBtn.setAttribute('data-suggestion-id', suggestion.id);
    acceptBtn.setAttribute('data-action', 'accept');
    acceptBtn.setAttribute('aria-label', 'Accept suggestion');
    acceptBtn.setAttribute('title', 'Accept');
    
    // Add hover effect
    acceptBtn.onmouseenter = () => {
      acceptBtn.style.transform = 'scale(1.05)';
      acceptBtn.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.4)';
    };
    acceptBtn.onmouseleave = () => {
      acceptBtn.style.transform = 'scale(1)';
      acceptBtn.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.3)';
    };

    // Dismiss button with icon
    const rejectBtn = document.createElement('button');
    rejectBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    rejectBtn.className = 'ai-reject-btn';
    rejectBtn.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(148, 163, 184, 0.1);
      color: #64748B;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    `.replace(/\s+/g, ' ').trim();
    rejectBtn.setAttribute('data-suggestion-id', suggestion.id);
    rejectBtn.setAttribute('data-action', 'reject');
    rejectBtn.setAttribute('aria-label', 'Dismiss suggestion');
    rejectBtn.setAttribute('title', 'Dismiss');
    
    // Add hover effect
    rejectBtn.onmouseenter = () => {
      rejectBtn.style.background = 'rgba(239, 68, 68, 0.1)';
      rejectBtn.style.color = '#EF4444';
      rejectBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      rejectBtn.style.transform = 'scale(1.05)';
    };
    rejectBtn.onmouseleave = () => {
      rejectBtn.style.background = 'rgba(148, 163, 184, 0.1)';
      rejectBtn.style.color = '#64748B';
      rejectBtn.style.borderColor = 'rgba(148, 163, 184, 0.2)';
      rejectBtn.style.transform = 'scale(1)';
    };

    actionCard.append(typeBadge, acceptBtn, rejectBtn);

    decorations.push(
      Decoration.widget(suggestion.deleteRange.to, () => actionCard, { side: 1 })
    );
  });

  return DecorationSet.create(doc, decorations);
}

const aiSuggestionProseMirrorPlugin = new Plugin<AISuggestionPluginState>({
  key: aiSuggestionPluginKey,

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
