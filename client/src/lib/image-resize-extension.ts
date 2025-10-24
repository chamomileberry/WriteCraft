import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface ImageResizeOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageResize: {
      setImage: (options: { src: string; alt?: string; title?: string; width?: number }) => ReturnType;
    };
  }
}

export const ImageResize = Node.create<ImageResizeOptions>({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.style.width || element.getAttribute('width');
          return width ? parseInt(width) : null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          decorations(state) {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];

            doc.descendants((node, pos) => {
              if (node.type.name === 'image') {
                const { from, to } = selection;
                const isSelected = pos >= from && pos < to;

                if (isSelected) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'ProseMirror-selectednode image-resizer-selected',
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },

          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement;
              
              if (target.tagName !== 'IMG') {
                return false;
              }

              const img = target as HTMLImageElement;
              const { clientX } = event;
              const imgRect = img.getBoundingClientRect();
              const isNearRightEdge = clientX > imgRect.right - 20;

              if (!isNearRightEdge) {
                return false;
              }

              event.preventDefault();

              const startWidth = img.width || img.offsetWidth;
              const startX = clientX;

              // Find the position of this image node
              let imagePos: number | null = null;
              let imageNode: any = null;
              
              view.state.doc.descendants((node, pos) => {
                if (imagePos !== null) return false; // Already found
                
                if (node.type.name === 'image') {
                  // Try to match by checking if this is the same DOM element
                  const domAtPos = view.domAtPos(pos);
                  if (domAtPos.node === img || domAtPos.node.contains(img)) {
                    imagePos = pos;
                    imageNode = node;
                    return false; // Stop searching
                  }
                }
              });

              if (imagePos === null) {
                console.warn('Could not find image node position');
                return false;
              }

              let currentWidth = startWidth;

              const onMouseMove = (e: MouseEvent) => {
                const diff = e.clientX - startX;
                currentWidth = Math.max(100, Math.min(startWidth + diff, 1000));
                
                // Update the image width visually
                img.style.width = `${currentWidth}px`;
                img.setAttribute('width', String(currentWidth));
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                img.style.cursor = '';

                // Update ProseMirror state only once at the end
                if (imagePos !== null && imageNode) {
                  const tr = view.state.tr.setNodeMarkup(imagePos, undefined, {
                    ...imageNode.attrs,
                    width: currentWidth,
                  });
                  view.dispatch(tr);
                }
              };

              img.style.cursor = 'ew-resize';
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);

              return true;
            },
          },
        },
      }),
    ];
  },
});
