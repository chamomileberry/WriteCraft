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
      setImage: (options: { src: string; alt?: string; title?: string; width?: number; align?: string }) => ReturnType;
      setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType;
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
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: element => {
          return element.getAttribute('data-align') || 'center';
        },
        renderHTML: attributes => {
          return {
            'data-align': attributes.align,
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
    const align = HTMLAttributes.align || 'center';
    const width = HTMLAttributes.width;
    
    // Build style string
    let style = '';
    if (width) {
      style += `width: ${width}px;`;
    }
    
    // Add alignment styles
    if (align === 'left') {
      style += 'float: left; margin: 0 1.5rem 1rem 0;';
    } else if (align === 'right') {
      style += 'float: right; margin: 0 0 1rem 1.5rem;';
    } else if (align === 'center') {
      style += 'display: block; margin-left: auto; margin-right: auto; margin-top: 1rem; margin-bottom: 1rem;';
    }
    
    const attrs = {
      ...this.options.HTMLAttributes,
      ...HTMLAttributes,
      style,
      class: `editor-image ${this.options.HTMLAttributes?.class || ''}`.trim(),
    };
    
    return ['img', mergeAttributes(attrs)];
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
      setImageAlign:
        align =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          let imagePos: number | null = null;
          let imageNode: any = null;

          // Find the selected image node
          state.doc.descendants((node, pos) => {
            if (imagePos !== null) return false;
            
            if (node.type.name === 'image') {
              if (pos >= selection.from - 1 && pos <= selection.to) {
                imagePos = pos;
                imageNode = node;
                return false;
              }
            }
          });

          if (imagePos !== null && imageNode && dispatch) {
            const transaction = tr.setNodeMarkup(imagePos, undefined, {
              ...imageNode.attrs,
              align,
            });
            dispatch(transaction);
            return true;
          }

          return false;
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
