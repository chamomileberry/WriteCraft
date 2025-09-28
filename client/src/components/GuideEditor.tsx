import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { TextStyle } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { ListItem } from '@tiptap/extension-list-item';
import Image from '@tiptap/extension-image';
import { Table as TiptapTable } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Youtube from '@tiptap/extension-youtube';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import { createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EditorToolbar } from '@/components/ui/editor-toolbar';
import { 
  Save,
  ArrowLeft,
  Loader2,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Guide } from '@shared/schema';

interface GuideEditorProps {
  guideId: string;
  onBack: () => void;
  onGuideCreated?: (guideId: string) => void;
}

export interface GuideEditorRef {
  saveContent: () => Promise<void>;
}

const categories = ['Character Writing', 'Writing Craft', 'World Building', 'Story Structure', 'Genre Writing'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

// Custom FontSize extension - 2024 best practice approach
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
});

const GuideEditor = forwardRef<GuideEditorRef, GuideEditorProps>(({ guideId: initialGuideId, onBack, onGuideCreated }, ref) => {
  const [currentGuideId, setCurrentGuideId] = useState(initialGuideId);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hasBeenSavedOnce, setHasBeenSavedOnce] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch guide data
  const { data: guide, isLoading: isLoadingGuide } = useQuery<Guide>({
    queryKey: ['/api/guides', currentGuideId],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${currentGuideId}`);
      if (!response.ok) throw new Error('Failed to fetch guide');
      return response.json();
    },
    enabled: !!currentGuideId && currentGuideId !== 'new',
  });

  // Initialize TipTap editor
  const lowlight = createLowlight();
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in extensions that we'll replace
        bulletList: false,
        orderedList: false,
        listItem: false,
        link: false,
        codeBlock: false,
      }),
      CharacterCount,
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'my-custom-highlight',
        },
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'prose-ul',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'prose-ol',
        },
      }),
      ListItem,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary/30 hover:decoration-primary transition-colors',
        },
      }),
      // New Media Extensions
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      TiptapTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-4 border-border',
        },
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg my-4',
        },
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      Typography,
    ],
    content: guide?.content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-blockquote:text-foreground/80',
        style: 'font-size: 12pt;', // Set default font size to 12pt
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');
      
      // Update word count
      const currentWordCount = editor.storage.characterCount.words();
      setWordCount(currentWordCount);
      
      // Debounced autosave
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        if (hasBeenSavedOnce && isFormValid()) {
          handleAutoSave();
        }
      }, 2000);
    },
  });

  // Load guide data into form
  useEffect(() => {
    if (guide) {
      setTitle(guide.title || '');
      setDescription(guide.description || '');
      setCategory(guide.category || '');
      setDifficulty(guide.difficulty || '');
      setAuthor(guide.author || '');
      setTags(guide.tags || []);
      setHasBeenSavedOnce(true);
      
      if (editor && guide.content) {
        editor.commands.setContent(guide.content);
        // Update word count after setting content
        setWordCount(editor.storage.characterCount.words());
      }
    }
  }, [guide, editor]);

  // Update word count when editor is first created
  useEffect(() => {
    if (editor) {
      setWordCount(editor.storage.characterCount.words());
    }
  }, [editor]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (currentGuideId === 'new') {
        const response = await apiRequest('POST', '/api/guides', data);
        return response.json();
      } else {
        const response = await apiRequest('PUT', `/api/guides/${currentGuideId}`, data);
        return response.json();
      }
    },
    onSuccess: (savedGuide) => {
      // If this was a new guide, update the current guide ID
      if (currentGuideId === 'new' && savedGuide.id) {
        setCurrentGuideId(savedGuide.id);
        setHasBeenSavedOnce(true);
        onGuideCreated?.(savedGuide.id);
      }
      
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      // Invalidate all guide-related queries (including filtered ones)
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === '/api/guides';
        }
      });
      toast({
        title: 'Guide saved',
        description: 'Your guide has been saved successfully.',
      });
    },
    onError: (error: any) => {
      console.error('Error saving guide:', error);
      setSaveStatus('unsaved');
      toast({
        title: 'Error saving guide',
        description: 'Failed to save the guide. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const isFormValid = () => {
    return !!editor && !!title.trim() && !!category && !!difficulty;
  };

  const buildGuideData = () => {
    const content = editor!.getHTML();
    const wordCount = editor!.storage.characterCount.words();
    const calculatedReadTime = Math.max(1, Math.round(wordCount / 200));

    return {
      title: title.trim(),
      description: description.trim(),
      content,
      excerpt: description.trim() || content.substring(0, 200).replace(/<[^>]+>/g, ''),
      category: category || 'Writing Craft',
      readTime: calculatedReadTime,
      difficulty: difficulty || 'Beginner',
      author: author.trim() || 'Anonymous',
      tags: tags.filter(tag => tag.trim()),
      published: true,
    };
  };

  const handleAutoSave = async () => {
    if (!isFormValid()) {
      return;
    }
    
    setSaveStatus('saving');
    const guideData = buildGuideData();
    await saveMutation.mutateAsync(guideData);
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Missing required fields',
        description: 'Please provide a title, category, and difficulty for the guide.',
        variant: 'destructive',
      });
      return;
    }

    setSaveStatus('saving');
    const guideData = buildGuideData();
    await saveMutation.mutateAsync(guideData);
  };

  useImperativeHandle(ref, () => ({
    saveContent: handleSave,
  }));

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  if (isLoadingGuide && currentGuideId !== 'new') {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-serif font-bold">
            {currentGuideId === 'new' ? 'New Guide' : 'Edit Guide'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveStatus === 'saved' && <Clock className="h-4 w-4" />}
            <span>
              {saveStatus === 'saved' && lastSaveTime 
                ? `Saved ${lastSaveTime.toLocaleTimeString()}`
                : saveStatus === 'saving'
                ? 'Saving...'
                : 'Unsaved changes'
              }
            </span>
          </div>
          
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
            <Save className="h-4 w-4 mr-2" />
            Save Guide
          </Button>
        </div>
      </div>

      {/* Guide Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Guide Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter guide title"
                data-testid="input-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Guide author"
                data-testid="input-author"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the guide"
              rows={3}
              data-testid="input-description"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger data-testid="select-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                data-testid="input-tag"
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm" data-testid="button-add-tag">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          
          <EditorToolbar editor={editor} title={title} />
          
          {/* Word Count */}
          {editor && (
            <div className="px-2 pb-2 text-sm text-muted-foreground">
              {wordCount} words • {Math.max(1, Math.round(wordCount / 200))} min read
            </div>
          )}



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

              {/* Font Size */}
              <Select
                onValueChange={setFontSize}
                value={editor?.getAttributes('textStyle').fontSize || '12pt'}
              >
                <SelectTrigger className="w-20 h-8" data-testid="select-font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8pt">8pt</SelectItem>
                  <SelectItem value="10pt">10pt</SelectItem>
                  <SelectItem value="12pt">12pt</SelectItem>
                  <SelectItem value="14pt">14pt</SelectItem>
                  <SelectItem value="16pt">16pt</SelectItem>
                  <SelectItem value="18pt">18pt</SelectItem>
                  <SelectItem value="20pt">20pt</SelectItem>
                  <SelectItem value="24pt">24pt</SelectItem>
                  <SelectItem value="28pt">28pt</SelectItem>
                  <SelectItem value="32pt">32pt</SelectItem>
                  <SelectItem value="36pt">36pt</SelectItem>
                </SelectContent>
              </Select>

              {/* Font Family */}
              <Select
                onValueChange={setFontFamily}
                value={editor?.getAttributes('textStyle').fontFamily || 'default'}
              >
                <SelectTrigger className="w-32 h-8" data-testid="select-font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="serif">Times New Roman</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="monospace">Monospace</SelectItem>
                  <SelectItem value="cursive">Cursive</SelectItem>
                  <SelectItem value="unset">Reset Font</SelectItem>
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

              {/* Link */}
              <Button
                variant="outline"
                size="sm"
                onClick={addLink}
                data-testid="button-link"
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6" />
              
        </CardHeader>
        
        <CardContent>
          <div className="border rounded-md focus-within:ring-2 focus-within:ring-ring">
            <EditorContent editor={editor} data-testid="editor-content" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

GuideEditor.displayName = 'GuideEditor';

export default GuideEditor;