import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import MentionList from "@/components/MentionList";
import { searchFeatures } from "./features-config";

export const guideSuggestion = {
  items: async ({ query }: { query: string }) => {
    if (!query) return [];

    try {
      // Search for both guides and features in parallel
      const [guidesResponse, featureResults] = await Promise.all([
        fetch(`/api/guides?search=${encodeURIComponent(query)}`, {
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => []),
        Promise.resolve(searchFeatures(query)),
      ]);

      // Map guides to include type field
      const guideResults = guidesResponse.map((guide: any) => ({
        ...guide,
        type: "guide",
      }));

      // Map features to match expected format
      const mappedFeatures = featureResults.map((feature) => ({
        id: feature.id,
        title: feature.title,
        type: "feature",
        description: feature.description,
      }));

      // Combine and return results (features first for better discovery)
      return [...mappedFeatures, ...guideResults].slice(0, 10);
    } catch (error) {
      console.error("Error fetching guide suggestions:", error);
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate: (props: any) => {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      // Custom command to properly map search results to mention attributes
      command: ({ editor, range, props }: any) => {
        // Guard against malformed search results
        if (!props || !props.id) {
          console.error("Invalid mention props:", props);
          return;
        }

        const mentionData = {
          id: props.id,
          label: props.title || props.id, // Fallback to id if title is missing
          type: props.type || "guide",
        };

        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: "mention",
              attrs: mentionData,
            },
            {
              type: "text",
              text: " ",
            },
          ])
          .run();
      },

      onKeyDown: (props: any) => {
        if (props.event.key === "Escape") {
          popup[0].hide();
          return true;
        }

        return component.ref &&
          typeof component.ref === "object" &&
          component.ref !== null &&
          "onKeyDown" in component.ref &&
          typeof (component.ref as any).onKeyDown === "function"
          ? (component.ref as any).onKeyDown(props)
          : false;
      },

      onExit: () => {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
