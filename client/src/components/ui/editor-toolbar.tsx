import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bold,
  Italic,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Undo,
  Redo,
  ImageIcon,
  TableIcon as Table,
  Code,
  Minus,
  Video,
  Hash,
  Type as SpecialChar,
  Printer,
  Focus as FocusIcon,
  Download,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  title?: string;
}

export function EditorToolbar({ editor, title = 'Untitled' }: EditorToolbarProps) {
  // Toolbar functions
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const toggleHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor?.chain().focus().toggleHeading({ level }).run();
  };

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run();
  };

  const toggleHighlight = () => {
    editor?.chain().focus().toggleHighlight({ color: '#ffff00' }).run();
  };

  const setTextAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(alignment).run();
  };

  const setFontSize = (size: string) => {
    editor?.chain().focus().setFontSize(size).run();
  };

  const setColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const setHighlightColor = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run();
  };

  const setFontFamily = (fontFamily: string) => {
    if (fontFamily === 'unset') {
      editor?.chain().focus().unsetFontFamily().run();
    } else {
      editor?.chain().focus().setFontFamily(fontFamily).run();
    }
  };

  return (
    <div className="border-t bg-muted/20 p-2">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Headers */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor?.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(1)}
            data-testid="button-h1"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(2)}
            data-testid="button-h2"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(3)}
            data-testid="button-h3"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive('heading', { level: 4 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(4)}
            data-testid="button-h4"
            title="Heading 4"
          >
            <Heading4 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive('heading', { level: 5 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(5)}
            data-testid="button-h5"
            title="Heading 5"
          >
            <Heading5 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor?.isActive('heading', { level: 6 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleHeading(6)}
            data-testid="button-h6"
            title="Heading 6"
          >
            <Heading6 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Basic Formatting */}
        <Button
          variant={editor?.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={toggleBold}
          data-testid="button-bold"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={toggleItalic}
          data-testid="button-italic"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive('highlight') ? 'default' : 'outline'}
          size="sm"
          onClick={toggleHighlight}
          data-testid="button-highlight"
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <Button
          variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={toggleBulletList}
          data-testid="button-bullet-list"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={toggleOrderedList}
          data-testid="button-ordered-list"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Alignment */}
        <Button
          variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTextAlign('left')}
          data-testid="button-align-left"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTextAlign('center')}
          data-testid="button-align-center"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTextAlign('right')}
          data-testid="button-align-right"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={editor?.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTextAlign('justify')}
          data-testid="button-align-justify"
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Links */}
        <Button
          variant={editor?.isActive('link') ? 'default' : 'outline'}
          size="sm"
          onClick={addLink}
          data-testid="button-link"
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo/Redo */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().chain().focus().undo().run()}
          data-testid="button-undo"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().chain().focus().redo().run()}
          data-testid="button-redo"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Media Insertion */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = prompt('Enter image URL:');
            if (url) {
              editor?.chain().focus().setImage({ src: url }).run();
            }
          }}
          data-testid="button-insert-image"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          data-testid="button-insert-table"
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            editor?.chain().focus().toggleCodeBlock().run();
          }}
          data-testid="button-code-block"
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            editor?.chain().focus().setHorizontalRule().run();
          }}
          data-testid="button-horizontal-rule"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const url = prompt('Enter YouTube URL:');
            if (url) {
              editor?.chain().focus().setYoutubeVideo({
                src: url,
                width: 640,
                height: 480,
              }).run();
            }
          }}
          data-testid="button-insert-video"
          title="Insert YouTube Video"
        >
          <Video className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const footnoteText = prompt('Enter footnote text:');
            if (footnoteText) {
              const footnoteId = Date.now();
              const footnoteRef = `<sup><a href="#footnote-${footnoteId}" id="ref-${footnoteId}">${footnoteId}</a></sup>`;
              const footnote = `<div id="footnote-${footnoteId}" class="footnote" style="border-top: 1px solid #ccc; margin-top: 2rem; padding-top: 1rem; font-size: 0.875rem;"><p><a href="#ref-${footnoteId}">${footnoteId}.</a> ${footnoteText}</p></div>`;
              editor?.chain().focus().insertContent(footnoteRef).run();
              editor?.commands.insertContentAt(editor.state.doc.content.size, footnote);
            }
          }}
          data-testid="button-insert-footnote"
          title="Insert Footnote"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const specialChars = ['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '"', '"', "'", "'", '—', '–', '½', '¼', '¾', '±', '×', '÷', '°', 'α', 'β', 'γ', 'δ', 'π', 'Σ', '∞'];
            const selectedChar = prompt('Select special character:\n' + specialChars.map((char, i) => (i + 1) + '. ' + char).join(' ') + '\n\nEnter character number or the character directly:');
            if (selectedChar) {
              const charIndex = parseInt(selectedChar) - 1;
              const charToInsert = (!isNaN(charIndex) && specialChars[charIndex]) ? specialChars[charIndex] : selectedChar;
              editor?.chain().focus().insertContent(charToInsert).run();
            }
          }}
          data-testid="button-special-chars"
          title="Insert Special Characters"
        >
          <SpecialChar className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Font Size */}
        <Select
          onValueChange={setFontSize}
          value={editor?.getAttributes('textStyle').fontSize || '16px'}
        >
          <SelectTrigger className="w-20 h-8" data-testid="select-font-size">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
            <SelectItem value="28px">28px</SelectItem>
            <SelectItem value="32px">32px</SelectItem>
            <SelectItem value="36px">36px</SelectItem>
            <SelectItem value="48px">48px</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Family */}
        <Select
          onValueChange={setFontFamily}
          value={editor?.getAttributes('textStyle').fontFamily || 'Default'}
        >
          <SelectTrigger className="w-32 h-8" data-testid="select-font-family">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unset">Default</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Lato">Lato</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
          </SelectContent>
        </Select>

        {/* Text Color */}
        <input
          type="color"
          className="w-8 h-8 border rounded cursor-pointer"
          onChange={(e) => setColor(e.target.value)}
          value={editor?.getAttributes('textStyle').color || '#000000'}
          data-testid="input-text-color"
          title="Text Color"
        />

        {/* Highlight Color */}
        <input
          type="color"
          className="w-8 h-8 border rounded cursor-pointer bg-yellow-200"
          onChange={(e) => setHighlightColor(e.target.value)}
          value={editor?.getAttributes('highlight').color || '#ffff00'}
          data-testid="input-highlight-color"
          title="Highlight Color"
        />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Utilities */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          data-testid="button-print"
          title="Print Document"
        >
          <Printer className="h-4 w-4" />
        </Button>
        <select
          className="px-2 py-1 text-sm border rounded-md bg-background min-w-20"
          onChange={(e) => {
            const zoom = parseInt(e.target.value) / 100;
            const editorElement = document.querySelector('.ProseMirror');
            if (editorElement) {
              (editorElement as HTMLElement).style.transform = `scale(${zoom})`;
              (editorElement as HTMLElement).style.transformOrigin = 'top left';
            }
          }}
          defaultValue="100"
          data-testid="select-zoom"
          title="Zoom Level"
        >
          <option value="50">50%</option>
          <option value="75">75%</option>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
          <option value="200">200%</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const toolbar = document.querySelector('.border-t.bg-muted\\/20');
            const sidebar = document.querySelector('[data-sidebar]');
            if (toolbar) {
              toolbar.classList.toggle('hidden');
            }
            if (sidebar) {
              sidebar.classList.toggle('hidden');
            }
          }}
          data-testid="button-focus-mode"
          title="Focus Mode"
        >
          <FocusIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const exportOptions = [
              '1. Export as HTML',
              '2. Export as PDF (Preview)',
              '3. Export as DOCX (Preview)', 
              '4. Send via Email (Coming Soon)',
              '5. Share for Collaboration (Coming Soon)'
            ].join('\n');
            
            const choice = prompt(`Choose export option:\n\n${exportOptions}\n\nEnter option number (1-5):`);
            const content = editor?.getHTML() || '';
            const guideTitle = title || 'Untitled';
            
            switch(choice) {
              case '1':
                // HTML Export
                const htmlFile = new Blob([content], { type: 'text/html' });
                const htmlLink = document.createElement('a');
                htmlLink.href = URL.createObjectURL(htmlFile);
                htmlLink.download = `${guideTitle}.html`;
                htmlLink.click();
                break;
                
              case '2':
                // PDF Export (Preview)
                alert('PDF Export: This feature uses browser print-to-PDF.\nClick OK to open print dialog, then select "Save as PDF".');
                setTimeout(() => window.print(), 500);
                break;
                
              case '3':
                // DOCX Export (Preview)
                try {
                  const textContent = editor?.getText() || '';
                  const docxBlob = new Blob([`${guideTitle}\n\n${textContent}`], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                  const docxLink = document.createElement('a');
                  docxLink.href = URL.createObjectURL(docxBlob);
                  docxLink.download = `${guideTitle}.docx`;
                  docxLink.click();
                } catch (error) {
                  alert('DOCX Export: Feature in development. Using text export for now.');
                  const textBlob = new Blob([editor?.getText() || ''], { type: 'text/plain' });
                  const textLink = document.createElement('a');
                  textLink.href = URL.createObjectURL(textBlob);
                  textLink.download = `${guideTitle}.txt`;
                  textLink.click();
                }
                break;
                
              case '4':
                alert('Email Export: Coming soon! This will allow you to email your guide directly to recipients.');
                break;
                
              case '5':
                alert('Collaboration Sharing: Coming soon! This will generate shareable links for collaborative editing.');
                break;
                
              default:
                if (choice) alert('Invalid option selected. Please choose 1-5.');
                break;
            }
          }}
          data-testid="button-export"
          title="Export & Share Document"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}