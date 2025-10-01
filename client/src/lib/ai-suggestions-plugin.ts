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

function createSuggestionDecorations(doc: any, suggestions: AISuggestion[]): DecorationSet {
  const decorations: any[] = [];

  suggestions.forEach(suggestion => {
    if (suggestion.status !== 'pending') return;

    // Inline decoration for the deletion (original text with strikethrough)
    decorations.push(
      Decoration.inline(
        suggestion.deleteRange.from,
        suggestion.deleteRange.to,
        {
          class: 'ai-suggestion-deletion',
          style: 'color: #D13438; text-decoration: line-through; background: rgba(255, 244, 244, 0.5);'
        }
      )
    );

    // Widget decoration for the suggested text
    const suggestedTextWidget = document.createElement('span');
    suggestedTextWidget.className = 'ai-suggestion-addition';
    suggestedTextWidget.textContent = suggestion.suggestedText;
    suggestedTextWidget.style.cssText = 'color: #0F7C3E; background: rgba(240, 249, 244, 0.8); padding: 0 2px; border-radius: 2px;';

    decorations.push(
      Decoration.widget(suggestion.deleteRange.to, () => suggestedTextWidget, { side: 1 })
    );

    // Widget decoration for accept/reject buttons
    const actionWidget = document.createElement('span');
    actionWidget.className = 'ai-suggestion-actions';
    actionWidget.style.cssText = 'display: inline-flex; gap: 4px; margin-left: 4px; vertical-align: middle;';

    const acceptBtn = document.createElement('button');
    acceptBtn.textContent = '✓';
    acceptBtn.className = 'ai-accept-btn';
    acceptBtn.style.cssText = 'background: #0F7C3E; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px;';
    acceptBtn.setAttribute('data-suggestion-id', suggestion.id);
    acceptBtn.setAttribute('data-action', 'accept');
    acceptBtn.setAttribute('aria-label', 'Accept suggestion');

    const rejectBtn = document.createElement('button');
    rejectBtn.textContent = '✗';
    rejectBtn.className = 'ai-reject-btn';
    rejectBtn.style.cssText = 'background: #D13438; color: white; border: none; border-radius: 3px; padding: 2px 6px; cursor: pointer; font-size: 12px;';
    rejectBtn.setAttribute('data-suggestion-id', suggestion.id);
    rejectBtn.setAttribute('data-action', 'reject');
    rejectBtn.setAttribute('aria-label', 'Reject suggestion');

    actionWidget.append(acceptBtn, rejectBtn);

    decorations.push(
      Decoration.widget(suggestion.deleteRange.to, () => actionWidget, { side: 1 })
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
