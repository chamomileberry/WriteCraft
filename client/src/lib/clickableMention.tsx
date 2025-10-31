import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import MentionHoverCard from '@/components/MentionHoverCard';

// React component for rendering clickable mentions with hover preview
function ClickableMentionComponent({ node }: NodeViewProps) {
  const { id, label, type } = node.attrs as { id: string; label: string; type: string };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // For features, id contains the full route
    if (type === 'feature') {
      window.location.href = `/generators#${id}`;
      return;
    }
    
    // Navigate to the appropriate page based on content type
    const navigationMap: Record<string, string> = {
      'character': `/characters/${id}/edit`,
      'location': `/editor/location/${id}`,
      'organization': `/editor/organization/${id}`,
      'species': `/editor/species/${id}`,
      'item': `/editor/item/${id}`,
      'spell': `/editor/spell/${id}`,
      'weapon': `/editor/weapon/${id}`,
      'technology': `/editor/technology/${id}`,
      'profession': `/editor/profession/${id}`,
      'religion': `/editor/religion/${id}`,
      'culture': `/editor/culture/${id}`,
      'faction': `/editor/faction/${id}`,
      'event': `/editor/event/${id}`,
      'project': `/projects/${id}`,
      'guide': `/guides/${id}`,
    };

    const path = navigationMap[type] || `/notebook`;
    window.location.href = path;
  };

  return (
    <NodeViewWrapper as="span" className="mention-wrapper inline">
      <MentionHoverCard contentType={type} contentId={id}>
        <span
          className="mention cursor-pointer inline-flex items-center bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-colors no-underline"
          onClick={handleClick}
          data-testid={`mention-${type}-${id}`}
          data-mention-type={type}
          data-mention-id={id}
        >
          @{label}
        </span>
      </MentionHoverCard>
    </NodeViewWrapper>
  );
}

// Custom TipTap extension for clickable mentions - extends official Mention with custom rendering
export const ClickableMention = Mention.extend({
  name: 'mention',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-mention-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-mention-id': attributes.id,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-mention-label'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.label) {
            return {};
          }
          return {
            'data-mention-label': attributes.label,
          };
        },
      },
      type: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-mention-type'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-mention-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mention-type][data-mention-id]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-mention-type': node.attrs.type,
        'data-mention-id': node.attrs.id,
        'data-mention-label': node.attrs.label,
        class: 'mention',
      },
      `@${node.attrs.label || node.attrs.id}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ClickableMentionComponent);
  },
});
