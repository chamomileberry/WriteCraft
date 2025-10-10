import { Editor } from '@tiptap/react';
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  Type,
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
  Plus,
  Heading,
  Upload,
  Loader2,
  X,
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Stock photo states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [searchingStock, setSearchingStock] = useState(false);
  const [selectedStockImage, setSelectedStockImage] = useState('');
  
  // AI generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatedAIImage, setGeneratedAIImage] = useState('');

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
    const finalImageUrl = imagePreviewUrl || imageUrl.trim();
    if (finalImageUrl) {
      editor?.chain().focus().setImage({ src: finalImageUrl }).run();
      setImageUrl('');
      setImagePreviewUrl('');
      setImageDialogOpen(false);
      toast({
        title: "Image added",
        description: "The image has been successfully inserted."
      });
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadingImage(true);
    try {
      // Get presigned upload URL and object path from server
      const uploadUrlResponse = await fetch('/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, objectPath } = await uploadUrlResponse.json();

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Finalize upload by setting ACL metadata
      const finalizeResponse = await fetch('/api/upload/finalize', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objectPath })
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload');
      }

      const { objectPath: finalPath } = await finalizeResponse.json();

      setImagePreviewUrl(finalPath);
      setImageUrl(''); // Clear URL input when file is uploaded

      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImagePreview = () => {
    setImagePreviewUrl('');
  };

  const handleStockSearch = async () => {
    if (!stockSearchQuery.trim()) {
      toast({
        title: 'Enter search query',
        description: 'Please enter keywords to search for stock photos',
        variant: 'destructive'
      });
      return;
    }

    setSearchingStock(true);
    try {
      const response = await fetch('/api/stock-images/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: stockSearchQuery,
          limit: 12
        })
      });

      if (!response.ok) {
        throw new Error('Failed to search stock images');
      }

      const data = await response.json();
      setStockImages(data.images || []);
      
      if (data.images?.length === 0) {
        toast({
          title: 'No results',
          description: 'No stock photos found for your query. Try different keywords.',
        });
      }
    } catch (error) {
      console.error('Stock search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search stock photos. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSearchingStock(false);
    }
  };

  const handleStockImageSelect = (imageUrl: string) => {
    setSelectedStockImage(imageUrl);
  };

  const handleStockImageInsert = () => {
    if (selectedStockImage) {
      editor?.chain().focus().setImage({ src: selectedStockImage }).run();
      setImageDialogOpen(false);
      setStockSearchQuery('');
      setStockImages([]);
      setSelectedStockImage('');
      toast({
        title: "Image added",
        description: "The stock photo has been successfully inserted."
      });
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Enter prompt',
        description: 'Please describe the image you want to generate',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingAI(true);
    try {
      const response = await fetch('/api/dalle/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          quality: 'standard',
          size: '1024x1024'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedAIImage(data.imageUrl);
      
      toast({
        title: 'Image generated',
        description: 'Your AI-generated image is ready'
      });
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleAIImageInsert = () => {
    if (generatedAIImage) {
      editor?.chain().focus().setImage({ src: generatedAIImage }).run();
      setImageDialogOpen(false);
      setAiPrompt('');
      setGeneratedAIImage('');
      toast({
        title: "Image added",
        description: "The AI-generated image has been successfully inserted."
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
    <>
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
        // Desktop Layout: Streamlined toolbar with grouped controls
        <TooltipProvider>
          <div className="flex items-center justify-center gap-1 flex-nowrap overflow-x-auto px-2 pb-2">
            {/* Format Menu - Groups alignment and styling */}
            <DropdownMenu onOpenChange={(open) => open && preserveSelection()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-format"
                    >
                      <Type className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Text Formatting</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-64">
                {/* Text Alignment */}
                <div className="px-2 py-1.5">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Text Alignment</div>
                  <div className="flex gap-1">
                    <Button
                      variant={editor?.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => restoreSelectionAndExecute(() => setTextAlign('left'))}
                      className="flex-1"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor?.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => restoreSelectionAndExecute(() => setTextAlign('center'))}
                      className="flex-1"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor?.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => restoreSelectionAndExecute(() => setTextAlign('right'))}
                      className="flex-1"
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={editor?.isActive({ textAlign: 'justify' }) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => restoreSelectionAndExecute(() => setTextAlign('justify'))}
                      className="flex-1"
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* Font Controls */}
                <div className="px-2 py-1.5 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Font Size</div>
                  <select
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    onChange={(e) => {
                      const size = e.target.value;
                      restoreSelectionAndExecute(() => setFontSize(size));
                    }}
                    value={editor?.getAttributes('textStyle').fontSize || '16px'}
                    data-testid="select-font-size"
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
                  <div className="text-xs font-medium text-muted-foreground">Font Family</div>
                  <select
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    onChange={(e) => {
                      const family = e.target.value;
                      restoreSelectionAndExecute(() => setFontFamily(family));
                    }}
                    value={editor?.getAttributes('textStyle').fontFamily || 'unset'}
                    data-testid="select-font-family"
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
                <DropdownMenuSeparator />

                {/* Colors */}
                <div className="px-2 py-1.5 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Colors</div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs flex-shrink-0">Text:</Label>
                    <input
                      type="color"
                      className="w-full h-8 border rounded cursor-pointer"
                      onChange={(e) => restoreSelectionAndExecute(() => setColor(e.target.value))}
                      value={editor?.getAttributes('textStyle').color || '#000000'}
                      data-testid="input-text-color"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs flex-shrink-0">Highlight:</Label>
                    <input
                      type="color"
                      className="w-full h-8 border rounded cursor-pointer"
                      onChange={(e) => restoreSelectionAndExecute(() => setHighlightColor(e.target.value))}
                      value={editor?.getAttributes('highlight').color || '#ffff00'}
                      data-testid="input-highlight-color"
                    />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Headings Dropdown */}
            <DropdownMenu onOpenChange={(open) => open && preserveSelection()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-headings"
                    >
                      <Heading className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Headings</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(1))}>
                  <Heading1 className="h-4 w-4 mr-2" />
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(2))}>
                  <Heading2 className="h-4 w-4 mr-2" />
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(3))}>
                  <Heading3 className="h-4 w-4 mr-2" />
                  Heading 3
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(4))}>
                  <Heading4 className="h-4 w-4 mr-2" />
                  Heading 4
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(5))}>
                  <Heading5 className="h-4 w-4 mr-2" />
                  Heading 5
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => toggleHeading(6))}>
                  <Heading6 className="h-4 w-4 mr-2" />
                  Heading 6
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Basic Formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('bold') ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleBold}
                  data-testid="button-bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold (Ctrl+B)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('italic') ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleItalic}
                  data-testid="button-italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic (Ctrl+I)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('highlight') ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleHighlight}
                  data-testid="button-highlight"
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Highlight</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('bulletList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleBulletList}
                  data-testid="button-bullet-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('orderedList') ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleOrderedList}
                  data-testid="button-ordered-list"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor?.isActive('link') ? 'default' : 'outline'}
                  size="sm"
                  onClick={addLink}
                  data-testid="button-link"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Link (Ctrl+K)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().chain().focus().undo().run()}
                  data-testid="button-undo"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().chain().focus().redo().run()}
                  data-testid="button-redo"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* Insert Menu - Groups media and content insertion */}
            <DropdownMenu onOpenChange={(open) => open && preserveSelection()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-insert"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Insert</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Insert Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVideoDialogOpen(true)}>
                  <Video className="h-4 w-4 mr-2" />
                  Insert Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => {
                  editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                })}>
                  <Table className="h-4 w-4 mr-2" />
                  Insert Table
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => {
                  editor?.chain().focus().toggleCodeBlock().run();
                })}>
                  <Code className="h-4 w-4 mr-2" />
                  Code Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => restoreSelectionAndExecute(() => {
                  editor?.chain().focus().setHorizontalRule().run();
                })}>
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
              </DropdownMenuContent>
            </DropdownMenu>

            

            {/* Export Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-export"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
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

            {/* More Options */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-more"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More Options</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFocusModeToggle?.()}>
                  <FocusIcon className="h-4 w-4 mr-2" />
                  {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Zoom Level</div>
                  <select
                    className="w-full px-2 py-1 text-sm border rounded-md bg-background"
                    onChange={(e) => {
                      const zoom = parseInt(e.target.value) / 100;
                      onZoomChange?.(zoom);
                    }}
                    value={(zoomLevel * 100).toString()}
                    data-testid="select-zoom"
                  >
                    <option value="50">50%</option>
                    <option value="75">75%</option>
                    <option value="100">100%</option>
                    <option value="125">125%</option>
                    <option value="150">150%</option>
                    <option value="200">200%</option>
                  </select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" data-testid="tab-upload">Upload File</TabsTrigger>
              <TabsTrigger value="stock" data-testid="tab-stock">Stock Photos</TabsTrigger>
              <TabsTrigger value="ai" data-testid="tab-ai">AI Generate</TabsTrigger>
            </TabsList>
            
            {/* Tab 1: Upload File */}
            <TabsContent value="upload" className="space-y-4">
              {imagePreviewUrl ? (
                <div className="relative inline-block max-w-full">
                  <img 
                    src={imagePreviewUrl} 
                    alt="Preview" 
                    className="max-w-full h-auto max-h-64 rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImagePreview}
                    data-testid="button-remove-image-preview"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const file = e.dataTransfer?.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        // Create a synthetic event with the dropped file
                        // Note: We can't use DataTransfer constructor (not available in Firefox)
                        const syntheticEvent = {
                          target: {
                            files: [file] as any, // Minimal FileList-like object
                          }
                        };
                        handleImageFileChange(syntheticEvent as any);
                      }
                    }}
                  >
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop an image here, or click to browse
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        data-testid="button-upload-file-editor"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                      capture="environment"
                      data-testid="input-file-editor"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or enter URL
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => e.key === 'Enter' && !uploadingImage && handleImageSubmit()}
                      disabled={uploadingImage}
                      data-testid="input-image-url-editor"
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setImageDialogOpen(false);
                  setImageUrl('');
                  setImagePreviewUrl('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImageSubmit}
                  disabled={!imagePreviewUrl && !imageUrl.trim()}
                  data-testid="button-insert-image-editor"
                >
                  Insert Image
                </Button>
              </DialogFooter>
            </TabsContent>
            
            {/* Tab 2: Stock Photos */}
            <TabsContent value="stock" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search stock photos..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStockSearch()}
                  disabled={searchingStock}
                  data-testid="input-stock-search"
                />
                <Button 
                  onClick={handleStockSearch}
                  disabled={searchingStock || !stockSearchQuery.trim()}
                  data-testid="button-stock-search"
                >
                  {searchingStock ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
              
              {stockImages.length > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                    {stockImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all hover-elevate ${
                          selectedStockImage === image.url 
                            ? 'border-primary ring-2 ring-primary' 
                            : 'border-transparent'
                        }`}
                        onClick={() => handleStockImageSelect(image.url)}
                        data-testid={`stock-image-${index}`}
                      >
                        <img 
                          src={image.url} 
                          alt={image.alt || `Stock photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {selectedStockImage && (
                    <div className="border rounded-lg p-2">
                      <img 
                        src={selectedStockImage} 
                        alt="Selected preview" 
                        className="max-w-full h-auto max-h-48 mx-auto rounded"
                      />
                    </div>
                  )}
                </>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setImageDialogOpen(false);
                  setStockSearchQuery('');
                  setStockImages([]);
                  setSelectedStockImage('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStockImageInsert}
                  disabled={!selectedStockImage}
                  data-testid="button-insert-stock-image"
                >
                  Insert Image
                </Button>
              </DialogFooter>
            </TabsContent>
            
            {/* Tab 3: AI Generate */}
            <TabsContent value="ai" className="space-y-4">
              <div>
                <Label htmlFor="ai-prompt">Describe the image you want to generate</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="A serene mountain landscape at sunset with a lake in the foreground..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={generatingAI}
                  className="min-h-24 mt-2"
                  data-testid="textarea-ai-prompt"
                />
              </div>
              
              <Button 
                onClick={handleGenerateAI}
                disabled={generatingAI || !aiPrompt.trim()}
                className="w-full"
                data-testid="button-generate-ai"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
              
              {generatedAIImage && (
                <div className="border rounded-lg p-4">
                  <img 
                    src={generatedAIImage} 
                    alt="AI generated" 
                    className="max-w-full h-auto max-h-64 mx-auto rounded-lg"
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setImageDialogOpen(false);
                  setAiPrompt('');
                  setGeneratedAIImage('');
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAIImageInsert}
                  disabled={!generatedAIImage}
                  data-testid="button-insert-ai-image"
                >
                  Insert Image
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
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
    </>
  );
}