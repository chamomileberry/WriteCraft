import { Editor } from '@tiptap/react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMobileDetection } from '@/hooks/useMobileDetection';
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
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  title?: string;
  isFocusMode?: boolean;
  onFocusModeToggle?: () => void;
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
}

// Hook for preserving editor selection during dropdown interactions
function useEditorSelection(editor: Editor | null) {
  const [storedSelection, setStoredSelection] = useState<any>(null);

  const preserveSelection = useCallback(() => {
    if (editor && !editor.state.selection.empty) {
      setStoredSelection({
        from: editor.state.selection.from,
        to: editor.state.selection.to,
      });
    }
  }, [editor]);

  const restoreSelectionAndExecute = useCallback((command: () => void) => {
    if (editor && storedSelection) {
      // Restore the selection
      editor.commands.setTextSelection({
        from: storedSelection.from,
        to: storedSelection.to,
      });
      // Execute the command
      command();
      // Clear stored selection
      setStoredSelection(null);
    } else if (editor) {
      // No stored selection, just execute command
      command();
    }
  }, [editor, storedSelection]);

  return { preserveSelection, restoreSelectionAndExecute };
}

export function EditorToolbar({ 
  editor, 
  title = 'Untitled',
  isFocusMode = false,
  onFocusModeToggle,
  zoomLevel = 1,
  onZoomChange
}: EditorToolbarProps) {
  const { toast } = useToast();
  const { isMobile } = useMobileDetection();
  const { preserveSelection, restoreSelectionAndExecute } = useEditorSelection(editor);
  
  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [footnoteDialogOpen, setFootnoteDialogOpen] = useState(false);
  const [specialCharDialogOpen, setSpecialCharDialogOpen] = useState(false);
  
  // Input states
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [footnoteText, setFootnoteText] = useState('');
  const [selectedSpecialChar, setSelectedSpecialChar] = useState('');

  // Toolbar functions
  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const addLink = () => {
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      editor?.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
      toast({
        title: "Link added",
        description: "The link has been successfully inserted."
      });
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

  const handleImageSubmit = () => {
    if (imageUrl.trim()) {
      editor?.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setImageDialogOpen(false);
      toast({
        title: "Image added",
        description: "The image has been successfully inserted."
      });
    }
  };

  const handleVideoSubmit = () => {
    if (videoUrl.trim()) {
      editor?.chain().focus().setYoutubeVideo({
        src: videoUrl.trim(),
        width: 640,
        height: 480,
      }).run();
      setVideoUrl('');
      setVideoDialogOpen(false);
      toast({
        title: "Video added",
        description: "The YouTube video has been successfully inserted."
      });
    }
  };

  const handleFootnoteSubmit = () => {
    if (footnoteText.trim()) {
      const footnoteId = Date.now();
      const footnoteRef = `<sup><a href="#footnote-${footnoteId}" id="ref-${footnoteId}">${footnoteId}</a></sup>`;
      const footnote = `<div id="footnote-${footnoteId}" class="footnote" style="border-top: 1px solid #ccc; margin-top: 2rem; padding-top: 1rem; font-size: 0.875rem;"><p><a href="#ref-${footnoteId}">${footnoteId}.</a> ${footnoteText.trim()}</p></div>`;
      editor?.chain().focus().insertContent(footnoteRef).run();
      editor?.commands.insertContentAt(editor.state.doc.content.size, footnote);
      setFootnoteText('');
      setFootnoteDialogOpen(false);
      toast({
        title: "Footnote added",
        description: "The footnote has been successfully inserted."
      });
    }
  };

  const handleSpecialCharSubmit = () => {
    if (selectedSpecialChar.trim()) {
      const specialChars = ['©', '®', '™', '§', '¶', '†', '‡', '•', '…', '"', '"', "'", "'", '—', '–', '½', '¼', '¾', '±', '×', '÷', '°', 'α', 'β', 'γ', 'δ', 'π', 'Σ', '∞'];
      const charIndex = parseInt(selectedSpecialChar) - 1;
      const charToInsert = (!isNaN(charIndex) && specialChars[charIndex]) ? specialChars[charIndex] : selectedSpecialChar;
      editor?.chain().focus().insertContent(charToInsert).run();
      setSelectedSpecialChar('');
      setSpecialCharDialogOpen(false);
      toast({
        title: "Character inserted",
        description: "The special character has been successfully inserted."
      });
    }
  };

  const handleExport = (option: string) => {
    const content = editor?.getHTML() || '';
    const guideTitle = title || 'Untitled';
    
    switch(option) {
      case 'html':
        const htmlFile = new Blob([content], { type: 'text/html' });
        const htmlLink = document.createElement('a');
        htmlLink.href = URL.createObjectURL(htmlFile);
        htmlLink.download = `${guideTitle}.html`;
        htmlLink.click();
        toast({
          title: "Export complete",
          description: "Your document has been exported as HTML."
        });
        break;
        
      case 'pdf':
        toast({
          title: "PDF Export",
          description: "Opening print dialog - select 'Save as PDF' to export."
        });
        setTimeout(() => window.print(), 500);
        break;
        
      case 'docx':
        try {
          const textContent = editor?.getText() || '';
          const docxBlob = new Blob([`${guideTitle}\n\n${textContent}`], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          const docxLink = document.createElement('a');
          docxLink.href = URL.createObjectURL(docxBlob);
          docxLink.download = `${guideTitle}.docx`;
          docxLink.click();
          toast({
            title: "Export complete",
            description: "Your document has been exported as DOCX (text format)."
          });
        } catch (error) {
          const textBlob = new Blob([editor?.getText() || ''], { type: 'text/plain' });
          const textLink = document.createElement('a');
          textLink.href = URL.createObjectURL(textBlob);
          textLink.download = `${guideTitle}.txt`;
          textLink.click();
          toast({
            title: "Export fallback",
            description: "Exported as text file instead of DOCX."
          });
        }
        break;
        
      case 'email':
        toast({
          title: "Coming soon",
          description: "Email export feature is in development."
        });
        break;
        
      case 'collaboration':
        toast({
          title: "Coming soon",
          description: "Collaboration sharing feature is in development."
        });
        break;
    }
  };

  return (
    <div className="border-t bg-muted/20 p-2">
      {isMobile ? (
        // Mobile Layout: Essential tools + More Options dropdown
        <div className="flex items-center gap-1">
          {/* Essential Tools */}
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

          {/* More Options Dropdown */}
          <DropdownMenu onOpenChange={(open) => open && preserveSelection()}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-more-options"
                title="More Options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
              {/* Text Formatting */}
              <DropdownMenuItem onClick={toggleHighlight}>
                <Highlighter className="h-4 w-4 mr-2" />
                Highlight
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Headings */}
              <DropdownMenuItem onClick={() => toggleHeading(1)}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleHeading(2)}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleHeading(3)}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleHeading(4)}>
                <Heading4 className="h-4 w-4 mr-2" />
                Heading 4
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleHeading(5)}>
                <Heading5 className="h-4 w-4 mr-2" />
                Heading 5
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleHeading(6)}>
                <Heading6 className="h-4 w-4 mr-2" />
                Heading 6
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Lists */}
              <DropdownMenuItem onClick={toggleBulletList}>
                <List className="h-4 w-4 mr-2" />
                Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleOrderedList}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered List
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Alignment */}
              <DropdownMenuItem onClick={() => setTextAlign('left')}>
                <AlignLeft className="h-4 w-4 mr-2" />
                Align Left
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextAlign('center')}>
                <AlignCenter className="h-4 w-4 mr-2" />
                Align Center
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextAlign('right')}>
                <AlignRight className="h-4 w-4 mr-2" />
                Align Right
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTextAlign('justify')}>
                <AlignJustify className="h-4 w-4 mr-2" />
                Justify
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Links and Media */}
              <DropdownMenuItem onClick={addLink}>
                <Link className="h-4 w-4 mr-2" />
                Add Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Insert Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVideoDialogOpen(true)}>
                <Video className="h-4 w-4 mr-2" />
                Insert Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              }}>
                <Table className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor?.chain().focus().toggleCodeBlock().run();
              }}>
                <Code className="h-4 w-4 mr-2" />
                Code Block
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                editor?.chain().focus().setHorizontalRule().run();
              }}>
                <Minus className="h-4 w-4 mr-2" />
                Horizontal Rule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFootnoteDialogOpen(true)}>
                <Hash className="h-4 w-4 mr-2" />
                Insert Footnote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSpecialCharDialogOpen(true)}>
                <SpecialChar className="h-4 w-4 mr-2" />
                Special Characters
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Font Controls */}
              <div className="px-2 py-1.5 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Font Size</div>
                <select
                  className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                  onChange={(e) => {
                    const size = e.target.value;
                    
                    // Preserve selection and apply formatting
                    restoreSelectionAndExecute(() => {
                      editor?.chain().focus().setFontSize(size).run();
                    });
                  }}
                  value={editor?.getAttributes('textStyle').fontSize || '16px'}
                  data-testid="mobile-select-font-size"
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="28px">28px</option>
                  <option value="32px">32px</option>
                  <option value="36px">36px</option>
                  <option value="48px">48px</option>
                </select>
              </div>
              
              <div className="px-2 py-1.5 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Font Family</div>
                <select
                  className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                  onChange={(e) => {
                    const family = e.target.value;
                    
                    // Preserve selection and apply formatting
                    restoreSelectionAndExecute(() => {
                      if (family === 'unset') {
                        editor?.chain().focus().unsetFontFamily().run();
                      } else {
                        editor?.chain().focus().setFontFamily(family).run();
                      }
                    });
                  }}
                  value={editor?.getAttributes('textStyle').fontFamily || 'unset'}
                  data-testid="mobile-select-font-family"
                >
                  <option value="unset">Default</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>
              
              <div className="px-2 py-1.5 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Colors</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">Text Color</label>
                    <input
                      type="color"
                      className="w-full h-8 border rounded cursor-pointer"
                      onChange={(e) => {
                        const color = e.target.value;
                        
                        // Preserve selection and apply formatting
                        restoreSelectionAndExecute(() => {
                          editor?.chain().focus().setColor(color).run();
                        });
                      }}
                      value={editor?.getAttributes('textStyle').color || '#000000'}
                      data-testid="mobile-input-text-color"
                      title="Text Color"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">Highlight</label>
                    <input
                      type="color"
                      className="w-full h-8 border rounded cursor-pointer"
                      onChange={(e) => {
                        const color = e.target.value;
                        
                        // Preserve selection and apply formatting
                        restoreSelectionAndExecute(() => {
                          editor?.chain().focus().setHighlight({ color }).run();
                        });
                      }}
                      value={editor?.getAttributes('highlight').color || '#ffff00'}
                      data-testid="mobile-input-highlight-color"
                      title="Highlight Color"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-2 py-1.5 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Zoom Level</div>
                <select
                  className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                  onChange={(e) => {
                    const zoom = parseInt(e.target.value) / 100;
                    onZoomChange?.(zoom);
                  }}
                  value={(zoomLevel * 100).toString()}
                  data-testid="mobile-select-zoom"
                  title="Zoom Level"
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                  <option value="200">200%</option>
                </select>
              </div>
              <DropdownMenuSeparator />
              
              {/* Utilities */}
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFocusModeToggle?.()}>
                <FocusIcon className="h-4 w-4 mr-2" />
                {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                <Download className="h-4 w-4 mr-2" />
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // Desktop Layout: Full toolbar (existing implementation)
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
            onClick={() => setImageDialogOpen(true)}
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
            onClick={() => setVideoDialogOpen(true)}
            data-testid="button-insert-video"
            title="Insert YouTube Video"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFootnoteDialogOpen(true)}
            data-testid="button-insert-footnote"
            title="Insert Footnote"
          >
            <Hash className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSpecialCharDialogOpen(true)}
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
              onZoomChange?.(zoom);
            }}
            value={(zoomLevel * 100).toString()}
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
            variant={isFocusMode ? "default" : "outline"}
            size="sm"
            onClick={() => onFocusModeToggle?.()}
            data-testid="button-focus-mode"
            title="Focus Mode"
          >
            <FocusIcon className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                data-testid="button-export"
                title="Export & Share Document"
              >
                <Download className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF (Print)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                Export as DOCX (Text)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('email')} disabled>
                Send via Email (Coming Soon)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('collaboration')} disabled>
                Share for Collaboration (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => e.key === 'Enter' && handleImageSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImageSubmit}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert YouTube Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-url">YouTube URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyDown={(e) => e.key === 'Enter' && handleVideoSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVideoSubmit}>Insert Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footnote Dialog */}
      <Dialog open={footnoteDialogOpen} onOpenChange={setFootnoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Footnote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="footnote-text">Footnote Text</Label>
              <Input
                id="footnote-text"
                value={footnoteText}
                onChange={(e) => setFootnoteText(e.target.value)}
                placeholder="Enter footnote text..."
                onKeyDown={(e) => e.key === 'Enter' && handleFootnoteSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFootnoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFootnoteSubmit}>Insert Footnote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Special Character Dialog */}
      <Dialog open={specialCharDialogOpen} onOpenChange={setSpecialCharDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Special Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="special-char">Character or Number</Label>
              <Input
                id="special-char"
                value={selectedSpecialChar}
                onChange={(e) => setSelectedSpecialChar(e.target.value)}
                placeholder="Enter character or number (1-29)"
                onKeyDown={(e) => e.key === 'Enter' && handleSpecialCharSubmit()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Available characters:</p>
              <p>1. © 2. ® 3. ™ 4. § 5. ¶ 6. † 7. ‡ 8. • 9. … 10. " 11. " 12. ' 13. ' 14. — 15. –</p>
              <p>16. ½ 17. ¼ 18. ¾ 19. ± 20. × 21. ÷ 22. ° 23. α 24. β 25. γ 26. δ 27. π 28. Σ 29. ∞</p>
              <p>Enter the number (1-29) or type the character directly.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecialCharDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSpecialCharSubmit}>Insert Character</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}