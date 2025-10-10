import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface ImageUploadOptions {
  onUpload: (file: File) => Promise<string>;
  onError?: (error: Error) => void;
  maxFileSize?: number;
}

export const ImageUploadExtension = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      onUpload: async () => '',
      onError: undefined,
      maxFileSize: 5 * 1024 * 1024, // 5MB default
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            // Check if any clipboard item is an image
            for (let i = 0; i < items.length; i++) {
              if (items[i].type.indexOf('image') !== -1) {
                event.preventDefault();
                
                const file = items[i].getAsFile();
                if (!file) continue;

                // Check file size
                const maxSize = this.options?.maxFileSize || 5 * 1024 * 1024;
                if (file.size > maxSize) {
                  this.options?.onError?.(new Error('Image too large'));
                  return true;
                }

                // Upload and insert the image
                const uploadFn = this.options?.onUpload;
                if (!uploadFn) return true;
                
                uploadFn(file)
                  .then((url) => {
                    const { schema } = view.state;
                    const node = schema.nodes.image.create({ src: url });
                    const tr = view.state.tr.insert(view.state.selection.from, node);
                    view.dispatch(tr);
                  })
                  .catch((error) => {
                    this.options.onError?.(error);
                  });
                
                return true;
              }
            }
            
            return false;
          },
          handleDrop: (view, event) => {
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return false;

            // Check if any dropped file is an image
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (file.type.startsWith('image/')) {
                event.preventDefault();

                // Check file size
                const maxSize = this.options?.maxFileSize || 5 * 1024 * 1024;
                if (file.size > maxSize) {
                  this.options?.onError?.(new Error('Image too large'));
                  return true;
                }

                // Get drop position
                const pos = view.posAtCoords({
                  left: event.clientX,
                  top: event.clientY,
                });

                if (!pos) return true;

                // Upload and insert the image
                const uploadFn = this.options?.onUpload;
                if (!uploadFn) return true;
                
                uploadFn(file)
                  .then((url) => {
                    const { schema } = view.state;
                    const node = schema.nodes.image.create({ src: url });
                    const tr = view.state.tr.insert(pos.pos, node);
                    view.dispatch(tr);
                  })
                  .catch((error) => {
                    this.options.onError?.(error);
                  });
                
                return true;
              }
            }
            
            return false;
          },
        },
      }),
    ];
  },
});
