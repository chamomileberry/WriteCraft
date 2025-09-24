import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from '@/components/MentionList';

export const suggestion = {
  items: async ({ query }: { query: string }) => {
    if (!query) return [];
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) return [];
      
      const results = await response.json();
      return results.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error fetching suggestions:', error);
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

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
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

      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown?.(props) || false;
      },

      onExit: () => {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};