import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useQuery } from '@tanstack/react-query';
import { FEATURES } from './features-config';

// React component for rendering clickable mentions with hover preview
function ClickableMentionComponent({ node }: NodeViewProps) {
  const { id, label, type } = node.attrs as { id: string; label: string | null; type: string };
  
  // Fetch the actual title for guides/projects/characters if label is missing
  const { data: fetchedTitle } = useQuery({
    queryKey: ['mention-title', type, id],
    queryFn: async () => {
      if (type === 'guide') {
        const res = await fetch(`/api/guides/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          return data.title;
        }
      } else if (type === 'project') {
        const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          return data.title;
        }
      } else if (type === 'character') {
        const res = await fetch(`/api/characters/${id}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          return data.name;
        }
      }
      return null;
    },
    enabled: !label && (type === 'guide' || type === 'project' || type === 'character'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // Determine display label
  let displayLabel = label;
  
  if (!displayLabel) {
    if (type === 'feature') {
      // Look up feature title from config
      const feature = FEATURES.find(f => f.id === id);
      displayLabel = feature?.title || id;
    } else if (fetchedTitle) {
      // Use fetched title from API
      displayLabel = fetchedTitle;
    } else {
      // For other types, try to extract from text content or use ID
      displayLabel = (node.textContent && node.textContent.replace(/^@/, '').trim()) || id;
    }
  }

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
      <span
        className="mention cursor-pointer inline-flex items-center bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-colors no-underline"
        onClick={handleClick}
        data-testid={`mention-${type}-${id}`}
        data-mention-type={type}
        data-mention-id={id}
        data-mention-label={displayLabel}
      >
        {displayLabel}
      </span>
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
        parseHTML: (element: HTMLElement) => {
          // Try to get from attribute first, then extract from text content
          const attrLabel = element.getAttribute('data-mention-label');
          if (attrLabel) return attrLabel;
          
          // Extract label from text content like "@Name Generator"
          const textContent = element.textContent || '';
          return textContent.replace(/^@/, '').trim() || null;
        },
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
