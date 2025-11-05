import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export interface AISuggestion {
  id: string;
  type: "grammar" | "style" | "clarity" | "conciseness";
  deleteRange: { from: number; to: number };
  originalText: string;
  suggestedText: string;
  status: "pending" | "accepted" | "rejected" | "invalid";
  timestamp: number;
}

export interface AISuggestionPluginState {
  suggestions: AISuggestion[];
  decorations: DecorationSet;
}

export const aiSuggestionPluginKey = new PluginKey<AISuggestionPluginState>(
  "aiSuggestions",
);

// Inject CSS for AI suggestion highlighting
if (
  typeof document !== "undefined" &&
  !document.getElementById("ai-suggestion-styles")
) {
  const style = document.createElement("style");
  style.id = "ai-suggestion-styles";
  style.textContent = `
    .ai-suggestion-highlight {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(139, 92, 246, 0.12));
      border-radius: 3px;
      box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.25);
      transition: all 0.2s ease;
      position: relative;
    }

    .dark .ai-suggestion-highlight {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.15));
      box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.3);
    }
  `;
  document.head.appendChild(style);
}

function createSuggestionDecorations(
  doc: any,
  suggestions: AISuggestion[],
): DecorationSet {
  const decorations: any[] = [];

  // Only show the first pending suggestion
  const activeSuggestion = suggestions.find((s) => s.status === "pending");

  if (!activeSuggestion) {
    return DecorationSet.empty;
  }

  // Add highlight decoration to the affected text
  decorations.push(
    Decoration.inline(
      activeSuggestion.deleteRange.from,
      activeSuggestion.deleteRange.to,
      {
        class: "ai-suggestion-highlight",
        "data-suggestion-id": activeSuggestion.id,
        "data-suggestion-anchor": "true",
      },
    ),
  );

  return DecorationSet.create(doc, decorations);
}

export const AISuggestionsExtension = Extension.create({
  name: "aiSuggestions",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: aiSuggestionPluginKey,
        state: {
          init(): AISuggestionPluginState {
            return {
              suggestions: [],
              decorations: DecorationSet.empty,
            };
          },

          apply(tr, pluginState): AISuggestionPluginState {
            // Map existing decorations through document changes
            let decorations = pluginState.decorations.map(tr.mapping, tr.doc);

            // Map existing suggestions through this transaction
            const updatedSuggestions = pluginState.suggestions.map(
              (suggestion) => {
                const mappedFrom = tr.mapping.map(
                  suggestion.deleteRange.from,
                  -1,
                );
                const mappedTo = tr.mapping.map(suggestion.deleteRange.to, 1);
                return {
                  ...suggestion,
                  deleteRange: { from: mappedFrom, to: mappedTo },
                };
              },
            );

            // Handle new suggestion from transaction meta
            const newSuggestion = tr.getMeta(aiSuggestionPluginKey);
            if (newSuggestion) {
              // Add the new suggestion and mark others as invalid
              updatedSuggestions.forEach((s) => (s.status = "invalid"));
              updatedSuggestions.push(newSuggestion);
              decorations = createSuggestionDecorations(
                tr.doc,
                updatedSuggestions,
              );

              return {
                suggestions: updatedSuggestions,
                decorations,
              };
            }

            // Handle updateSuggestions meta (for accepting/rejecting)
            const updateSuggestions = tr.getMeta("updateSuggestions");
            if (updateSuggestions) {
              decorations = createSuggestionDecorations(
                tr.doc,
                updateSuggestions,
              );
              return {
                suggestions: updateSuggestions,
                decorations,
              };
            }

            // If the document changed, recreate decorations
            if (tr.docChanged) {
              decorations = createSuggestionDecorations(
                tr.doc,
                updatedSuggestions,
              );
            }

            return {
              suggestions: updatedSuggestions,
              decorations,
            };
          },
        },

        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            return pluginState?.decorations || DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
