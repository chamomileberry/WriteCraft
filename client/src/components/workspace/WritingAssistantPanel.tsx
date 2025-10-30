import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useNotebookStore } from '@/stores/notebookStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ContextualPromptCard from './ContextualPromptCard';
import EntityActionCard from './EntityActionCard';
import EntityPreviewDialog from './EntityPreviewDialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  MessageSquare, 
  Sparkles, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb,
  Loader2,
  Copy,
  ArrowRightToLine,
  User,
  Bot,
  Trash2,
  ImageIcon
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface WritingAssistantPanelProps {
  panelId: string;
  className?: string;
  onRegisterClearChatFunction?: (fn: () => void) => void;
  onRegisterToggleHistoryFunction?: (fn: () => void) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedPrompt {
  id: string;
  icon: any;
  label: string;
  prompt: string;
  description: string;
}

interface DetectedEntity {
  type: 'character' | 'location' | 'plotPoint';
  name: string;
  confidence: number;
  details: any;
}

// Separate component for chat input to prevent parent re-renders
const ChatInput = React.memo(React.forwardRef<HTMLTextAreaElement, { 
  onSubmit: (text: string) => void; 
  isPending: boolean;
}>(({ onSubmit, isPending }, ref) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    onSubmit(inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex gap-2">
      <Textarea
        ref={ref}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ask about your writing..."
        className="min-h-[40px] max-h-[100px] resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        data-testid="input-chat-message"
        autoComplete="off"
        spellCheck={false}
      />
      <Button 
        size="sm" 
        onClick={handleSubmit}
        disabled={!inputText.trim() || isPending}
        data-testid="button-send-message"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}));

export default function WritingAssistantPanel({ 
  panelId, 
  className, 
  onRegisterClearChatFunction, 
  onRegisterToggleHistoryFunction 
}: WritingAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [extendedThinkingEnabled, setExtendedThinkingEnabled] = useState(false);

  // Image generation state
  const [showImagePromptDialog, setShowImagePromptDialog] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');

  // Thread management state
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threadTitle, setThreadTitle] = useState<string | null>(null);
  const [tagsGenerated, setTagsGenerated] = useState(false);

  // Context analysis state
  const [contextAnalysis, setContextAnalysis] = useState<{ topics: any[]; entities: any[] } | null>(null);
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false);

  // Entity detection state
  const [detectedEntities, setDetectedEntities] = useState<DetectedEntity[]>([]);
  const [isDetectingEntities, setIsDetectingEntities] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<DetectedEntity | null>(null);
  const [showEntityPreview, setShowEntityPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasPremiumAccess, extendedThinkingRemaining, premiumQuota } = useSubscription();
  const { getEditorContext, executeEditorAction } = useWorkspaceStore();
  const { activeNotebookId } = useNotebookStore();
  const queryClient = useQueryClient();

  // Fetch characters from the notebook
  const { data: characters } = useQuery({
    queryKey: ['/api/characters'],
    queryFn: async () => {
      if (!activeNotebookId) return [];
      const response = await fetch(`/api/characters?notebookId=${activeNotebookId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch characters');
      return response.json();
    },
    enabled: !!activeNotebookId,
  });

  // Smart prompt suggestions
  const suggestedPrompts: SuggestedPrompt[] = [
    {
      id: 'analyze',
      icon: FileText,
      label: 'Analyze',
      prompt: 'Analyze the current text for readability, style, and provide improvement suggestions',
      description: 'Get writing suggestions and readability score'
    },
    {
      id: 'proofread',
      icon: CheckCircle,
      label: 'Proofread',
      prompt: 'Proofread the current text for grammar, spelling, and style issues',
      description: 'Check grammar and spelling'
    },
    {
      id: 'questions',
      icon: HelpCircle,
      label: 'Questions',
      prompt: 'Generate questions a reader might have about this content',
      description: 'Find potential plot holes'
    },
    {
      id: 'improve',
      icon: Sparkles,
      label: 'Improve',
      prompt: 'Suggest improvements to make this text more engaging and clear',
      description: 'Enhance clarity and flow'
    },
    {
      id: 'ideas',
      icon: Lightbulb,
      label: 'Ideas',
      prompt: 'Help me brainstorm ideas for continuing this story',
      description: 'Brainstorm next steps'
    }
  ];

  // Load chat history when component mounts or editor context changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return; // Wait for authentication

      try {
        setIsLoadingHistory(true);
        const editorContext = getEditorContext();

        // Check for threadId in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const threadIdFromUrl = urlParams.get('threadId');

        if (threadIdFromUrl) {
          // Load specific thread
          try {
            const threadResponse = await fetch(`/api/conversation-threads/${threadIdFromUrl}`, {
              credentials: 'include'
            });

            if (threadResponse.ok) {
              const thread = await threadResponse.json();
              setCurrentThreadId(thread.id);
              setThreadTitle(thread.title);
              setTagsGenerated(thread.tags && thread.tags.length > 0);

              // Load messages for this thread
              const messagesResponse = await fetch(`/api/chat-messages?threadId=${threadIdFromUrl}`, {
                credentials: 'include'
              });

              if (messagesResponse.ok) {
                const chatMessages = await messagesResponse.json();
                const formattedMessages: Message[] = chatMessages.map((msg: any) => ({
                  id: msg.id,
                  type: msg.type,
                  content: msg.content,
                  timestamp: new Date(msg.createdAt)
                }));
                setMessages(formattedMessages);
              }
            }
          } catch (error) {
            console.error('Failed to load thread:', error);
          }
        } else {
          // Load by project/guide (legacy behavior for backwards compatibility)
          const params = new URLSearchParams();
          if (editorContext.type === 'manuscript' && editorContext.entityId) {
            params.append('projectId', editorContext.entityId);
          } else if (editorContext.type === 'guide' && editorContext.entityId) {
            params.append('guideId', editorContext.entityId);
          }

          const response = await fetch(`/api/chat-messages?${params.toString()}`, {
            credentials: 'include'
          });

          if (response.ok) {
            const chatMessages = await response.json();
            const formattedMessages: Message[] = chatMessages.map((msg: any) => ({
              id: msg.id,
              type: msg.type,
              content: msg.content,
              timestamp: new Date(msg.createdAt)
            }));
            setMessages(formattedMessages);

            // If we have messages and they have a threadId, set it
            if (chatMessages.length > 0 && chatMessages[0].threadId) {
              setCurrentThreadId(chatMessages[0].threadId);

              // Fetch thread details to get title
              try {
                const threadResponse = await fetch(`/api/conversation-threads/${chatMessages[0].threadId}`, {
                  credentials: 'include'
                });
                if (threadResponse.ok) {
                  const thread = await threadResponse.json();
                  setThreadTitle(thread.title);
                  setTagsGenerated(thread.tags && thread.tags.length > 0);
                }
              } catch (error) {
                console.error('Failed to load thread details:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [getEditorContext, user]);



  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isLoadingHistory) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingHistory]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(e.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };

    if (showHistoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showHistoryDropdown]);

  // Conversational chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;

      // Prepare conversation history from messages with timestamps
      const conversationHistory = messages
        .slice(-30) // Send last 30 messages for better context retention
        .map(msg => ({
          role: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }));

      const response = await fetch('/api/writing-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined,
          notebookId: editorContext.notebookId || activeNotebookId || undefined,
          projectId: editorContext.type === 'manuscript' ? editorContext.entityId : undefined,
          guideId: editorContext.type === 'guide' ? editorContext.entityId : undefined,
          useExtendedThinking: extendedThinkingEnabled
        }),
      });
      if (!response.ok) throw new Error('Failed to get chat response');
      return response.json();
    },
    onSuccess: (data) => {
      addMessage('assistant', data.message);
    },
    onError: (error: any) => {
      console.error('Chat API error:', error);

      let errorMessage = "I'm having trouble processing your request. Please try again.";

      // Handle specific error cases
      if (error?.response?.status === 429) {
        errorMessage = "You've reached your usage limit. Please wait a moment and try again.";
      } else if (error?.response?.status === 401 || error?.response?.status === 403) {
        errorMessage = "Your session has expired. Please refresh the page and try again.";
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = "I'm having trouble connecting right now. Please check your internet connection and try again.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "The request took too long. Please try a shorter question or try again.";
        }
      }

      addMessage('assistant', errorMessage);

      // Show a toast for additional visibility
      toast({
        title: 'Chat Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Mutation for AI image generation
  const generateImageMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ideogram/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          prompt,
          quality: 'standard',
          size: '1024x1024'
        }),
      });
      if (!response.ok) throw new Error('Failed to generate image');
      return response.json();
    },
    onSuccess: (data) => {
      // Add the generated image to the conversation
      addMessage('assistant', `I've generated an image for you:\n\n![Generated Image](${data.imageUrl})`);
      setShowImagePromptDialog(false);
      setImagePrompt('');
    },
    onError: (error: any) => {
      console.error('Image generation error:', error);
      toast({
        title: 'Image generation failed',
        description: error.message || 'Failed to generate image. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Clear chat history mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const editorContext = getEditorContext();

      const params = new URLSearchParams();
      if (editorContext.type === 'manuscript' && editorContext.entityId) {
        params.append('projectId', editorContext.entityId);
      } else if (editorContext.type === 'guide' && editorContext.entityId) {
        params.append('guideId', editorContext.entityId);
      }

      const response = await fetch(`/api/chat-messages?${params.toString()}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to clear chat history');
    },
    onSuccess: () => {
      setMessages([]);
      setCurrentThreadId(null);
      setThreadTitle(null);
      setTagsGenerated(false);
      toast({
        title: 'Chat cleared',
        description: 'Started a new conversation.',
      });
    },
    onError: () => {
      toast({
        title: 'Clear failed',
        description: 'Could not clear chat history. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Analyze context for smart prompts
  const analyzeContext = async () => {
    // Only analyze if we have at least 2 messages (1 user + 1 assistant minimum)
    if (messages.length < 2) {
      setContextAnalysis(null);
      return;
    }

    try {
      setIsAnalyzingContext(true);
      const editorContext = getEditorContext();

      const response = await fetch('/api/ai/analyze-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: messages.map(m => ({ type: m.type, content: m.content })),
          editorState: {
            hasContent: editorContext.content && editorContext.content.length > 10,
            type: editorContext.type,
            title: editorContext.title
          }
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setContextAnalysis(analysis);
      }
    } catch (error) {
      console.error('Failed to analyze context:', error);
      setContextAnalysis(null);
    } finally {
      setIsAnalyzingContext(false);
    }
  };

  // Detect entities from conversation
  const detectEntities = async () => {
    // Only detect if we have at least 3 messages for meaningful conversation
    if (messages.length < 3) {
      setDetectedEntities([]);
      return;
    }

    try {
      setIsDetectingEntities(true);

      const response = await apiRequest('POST', '/api/ai/detect-entities', {
        messages: messages.map(m => ({ type: m.type, content: m.content })),
        notebookId: activeNotebookId
      });

      if (response.ok) {
        const data = await response.json();
        setDetectedEntities(data.entities || []);

        // Show feedback if detection failed but didn't throw an error
        if (data.error) {
          toast({
            title: 'Entity detection issue',
            description: 'Could not extract character/location details from the conversation.',
            variant: 'destructive',
          });
        }
      } else {
        throw new Error('Failed to detect entities');
      }
    } catch (error) {
      console.error('Failed to detect entities:', error);
      setDetectedEntities([]);
      toast({
        title: 'Detection failed',
        description: 'Could not analyze the conversation for entities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDetectingEntities(false);
    }
  };

  // Entity detection - only run after assistant messages, with debouncing
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].type === 'assistant') {
      // Only detect entities if we have meaningful conversation (3+ messages)
      if (messages.length >= 3) {
        const timer = setTimeout(() => {
          detectEntities();
        }, 2000); // Reduced from 5s to 2s for better responsiveness
        return () => clearTimeout(timer);
      }
    }
  }, [messages.length]);

  // Trigger context analysis after messages change
  // Re-enabled with caching and debouncing to prevent blocking on every message
  useEffect(() => {
    // Only analyze after assistant messages and with meaningful conversation
    if (messages.length >= 3 && messages[messages.length - 1].type === 'assistant') {
      const timer = setTimeout(() => {
        analyzeContext();
      }, 3000); // 3-second delay to batch rapid exchanges, cache handles identical content
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Register functions for header buttons
  useEffect(() => {
    if (onRegisterClearChatFunction) {
      onRegisterClearChatFunction(() => {
        clearChatMutation.mutate();
      });
    }
    if (onRegisterToggleHistoryFunction) {
      onRegisterToggleHistoryFunction(() => {
        setShowHistoryDropdown(prev => !prev);
      });
    }
  }, [onRegisterClearChatFunction, onRegisterToggleHistoryFunction, clearChatMutation]);

  // Get editor content from workspace context
  const getEditorText = () => {
    const editorContext = getEditorContext();

    if (editorContext.content && editorContext.content.length > 10) {
      return {
        text: editorContext.content.slice(0, 2000),
        hasEditorContent: true,
        title: editorContext.title,
        type: editorContext.type
      };
    }

    return {
      text: '',
      hasEditorContent: false,
      title: '',
      type: null
    };
  };

  // Extract text suggestions from assistant messages
  const extractTextSuggestions = (content: string) => {
    const suggestions: { text: string; type: 'replace' | 'insert' }[] = [];

    const quotedTextRegex = /"([^"]+)"/g;
    let match;
    while ((match = quotedTextRegex.exec(content)) !== null) {
      const text = match[1];
      if (text.length > 10 && text.length < 500) {
        suggestions.push({ text, type: 'replace' });
      }
    }

    const correctedTextRegex = /(?:corrected|improved|rephrased|better).*?:\s*"([^"]+)"/gi;
    match = correctedTextRegex.exec(content);
    while (match !== null) {
      const text = match[1];
      if (text.length > 5) {
        suggestions.push({ text, type: 'replace' });
      }
      match = correctedTextRegex.exec(content);
    }

    return suggestions;
  };

  // Apply text change to editor
  const applyTextChange = (text: string, type: 'replace' | 'insert' = 'replace') => {
    try {
      const success = executeEditorAction(type === 'replace' ? 'replaceSelection' : 'insertAtCursor', text);
      if (success) {
        toast({
          title: "Applied successfully",
          description: "The suggested text has been applied to your document.",
        });
      } else {
        toast({
          title: "Could not apply change",
          description: "Please make sure you have a document open for editing.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error applying change",
        description: "Something went wrong while applying the text.",
        variant: "destructive",
      });
    }
  };

  // Add message helper - saves to database and updates local state
  const addMessage = async (type: 'user' | 'assistant', content: string, metadata?: any) => {
    if (!user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Save to database in background
    try {
      const editorContext = getEditorContext();
      let threadId = currentThreadId;

      // Create thread on first message if none exists
      if (!threadId) {
        try {
          const threadData = {
            title: `Chat about ${editorContext.type === 'manuscript' ? editorContext.title || 'project' : editorContext.type === 'guide' ? editorContext.title || 'guide' : 'writing'}`,
            projectId: editorContext.type === 'manuscript' ? editorContext.entityId : undefined,
            guideId: editorContext.type === 'guide' ? editorContext.entityId : undefined,
          };

          const threadResponse = await fetch('/api/conversation-threads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(threadData)
          });

          if (threadResponse.ok) {
            const savedThread = await threadResponse.json();
            threadId = savedThread.id;
            setCurrentThreadId(savedThread.id);
            setThreadTitle(savedThread.title);
          }
        } catch (error) {
          console.error('Failed to create conversation thread:', error);
        }
      }

      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          content,
          threadId: threadId,
          projectId: editorContext.type === 'manuscript' ? editorContext.entityId : undefined,
          guideId: editorContext.type === 'guide' ? editorContext.entityId : undefined,
          metadata
        })
      });

      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, id: savedMessage.id }
            : msg
        ));

        // Auto-generate tags after 5 messages (only once)
        if (threadId && !tagsGenerated && messages.length >= 4) {
          setTagsGenerated(true);
          try {
            await fetch(`/api/conversation-threads/${threadId}/generate-tags`, {
              method: 'POST',
              credentials: 'include',
            });
          } catch (error) {
            console.error('Failed to generate tags:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save message to database:', error);
    }
  };

  // Handle chat submission
  const handleChatSubmit = (text: string) => {
    if (!text.trim()) return;

    addMessage('user', text);
    chatMutation.mutate(text);
  };

  // Handle suggested prompt click
  const handleSuggestedPrompt = (prompt: SuggestedPrompt) => {
    const editorContent = getEditorText();

    if (!editorContent.hasEditorContent && (prompt.id === 'analyze' || prompt.id === 'proofread' || prompt.id === 'questions')) {
      addMessage('assistant', 'I need some text to work with. Could you please:\n\n1. Open a project or guide for editing, or\n2. Ask me a general question about writing\n\nI can help with analyzing text, brainstorming ideas, answering questions, and more!');
      return;
    }

    // Auto-submit for quick actions
    addMessage('user', prompt.prompt);
    chatMutation.mutate(prompt.prompt);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard.',
    });
  };

  // Helper to find existing character by name
  const findExistingCharacter = (name: string) => {
    if (!characters) return undefined;

    const nameLower = name.toLowerCase();
    return characters.find((char: any) => {
      const fullName = [char.givenName, char.familyName].filter(Boolean).join(' ').toLowerCase();
      const givenName = (char.givenName || '').toLowerCase();
      const nickname = (char.nickname || '').toLowerCase();

      return fullName === nameLower || 
             givenName === nameLower || 
             (nickname && nickname === nameLower);
    });
  };

  // Handle creating entities from detected data
  const handleCreateEntity = async (entity: DetectedEntity) => {
    setSelectedEntity(entity);
    setShowEntityPreview(true);
  };

  // Handle updating existing entity with new details
  const handleUpdateEntity = async (entity: DetectedEntity) => {
    const existingChar = findExistingCharacter(entity.name);
    if (!existingChar) {
      toast({
        title: 'Character not found',
        description: 'Could not find an existing character to update.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (entity.type === 'character') {
        // Merge existing data with new details from conversation
        const updates: any = {};

        // Helper function to append or set text fields
        const appendOrSet = (currentValue: string | null | undefined, newValue: string) => {
          const current = currentValue || '';
          if (!current) return newValue;
          if (current.includes(newValue)) return undefined; // No change needed
          return `${current}\n\n${newValue}`;
        };

        // Only update fields that have new information
        if (entity.details.age && !existingChar.age) updates.age = parseInt(entity.details.age);
        if (entity.details.species && !existingChar.species) updates.species = entity.details.species;
        if (entity.details.occupation && !existingChar.occupation) updates.occupation = entity.details.occupation;

        // Handle personality - convert to array if needed
        if (entity.details.personality) {
          let personalityArray: string[] = [];

          // If it's already an array, use it
          if (Array.isArray(entity.details.personality)) {
            personalityArray = entity.details.personality;
          } 
          // If it's a string, split by common delimiters
          else if (typeof entity.details.personality === 'string') {
            personalityArray = entity.details.personality
              .split(/[,;]\s*|\n/)
              .map((trait: string) => trait.trim())
              .filter((trait: string) => trait.length > 0);
          }

          // Merge with existing personality traits
          if (personalityArray.length > 0) {
            const existingTraits = Array.isArray(existingChar.personality) ? existingChar.personality : [];
            const newTraits = personalityArray.filter(trait => !existingTraits.includes(trait));

            if (newTraits.length > 0) {
              updates.personality = [...existingTraits, ...newTraits];
            }
          }
        }

        if (entity.details.physicalDescription) {
          const updated = appendOrSet(existingChar.physicalDescription, entity.details.physicalDescription);
          if (updated !== undefined) updates.physicalDescription = updated;
        }

        if (entity.details.backstory) {
          const updated = appendOrSet(existingChar.backstory, entity.details.backstory);
          if (updated !== undefined) updates.backstory = updated;
        }

        if (entity.details.motivation) {
          const updated = appendOrSet(existingChar.motivation, entity.details.motivation);
          if (updated !== undefined) updates.motivation = updated;
        }

        if (entity.details.flaw) {
          const updated = appendOrSet(existingChar.flaw, entity.details.flaw);
          if (updated !== undefined) updates.flaw = updated;
        }

        if (entity.details.strength) {
          const updated = appendOrSet(existingChar.strength, entity.details.strength);
          if (updated !== undefined) updates.strength = updated;
        }

        if (entity.details.abilities) {
          const updated = appendOrSet(existingChar.abilities, entity.details.abilities);
          if (updated !== undefined) updates.abilities = updated;
        }

        if (entity.details.likes) {
          const updated = appendOrSet(existingChar.likes, entity.details.likes);
          if (updated !== undefined) updates.likes = updated;
        }

        if (entity.details.dislikes) {
          const updated = appendOrSet(existingChar.dislikes, entity.details.dislikes);
          if (updated !== undefined) updates.dislikes = updated;
        }

        // Handle any other text fields that might be in the details
        const textFields = [
          'description', 'goals', 'fears', 'secrets', 'habits', 
          'mannerisms', 'speech', 'beliefs', 'values', 'quirks',
          'appearance', 'voice', 'style', 'relationships'
        ];

        textFields.forEach(field => {
          if (entity.details[field]) {
            const existingValue = (existingChar as any)[field];
            const updated = appendOrSet(existingValue, entity.details[field]);
            if (updated !== undefined) updates[field] = updated;
          }
        });

        // If there are any updates, apply them
        if (Object.keys(updates).length > 0) {
          const response = await fetch(`/api/characters/${existingChar.id}?notebookId=${activeNotebookId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates)
          });

          if (response.ok) {
            // Create a detailed summary of what was updated
            const updateSummary = Object.entries(updates).map(([key, value]) => {
              const fieldLabels: Record<string, string> = {
                personality: 'Personality traits',
                backstory: 'Backstory',
                motivation: 'Motivation',
                flaw: 'Character flaw',
                physicalDescription: 'Physical description',
                occupation: 'Occupation',
                species: 'Species',
                age: 'Age',
                gender: 'Gender',
                pronouns: 'Pronouns',
                height: 'Height',
                build: 'Build',
                hairColor: 'Hair color',
                eyeColor: 'Eye color',
                skinTone: 'Skin tone',
                currentLocation: 'Current location',
                placeOfBirth: 'Place of birth',
                family: 'Family information',
                relationships: 'Relationships',
                skills: 'Skills',
                strengths: 'Strengths',
                education: 'Education',
                religiousBelief: 'Religious beliefs'
              };

              const label = fieldLabels[key] || key.replace(/([A-Z])/g, ' $1').trim();

              // Format the value for display
              let displayValue = '';
              if (Array.isArray(value)) {
                displayValue = value.length > 3 
                  ? `${value.slice(0, 3).join(', ')}... (${value.length} items)`
                  : value.join(', ');
              } else if (typeof value === 'string') {
                displayValue = value.length > 100 
                  ? value.slice(0, 100) + '...'
                  : value;
              } else {
                displayValue = String(value);
              }

              return `• ${label}: ${displayValue}`;
            }).join('\n');

            toast({
              title: `${entity.name} updated successfully!`,
              description: (
                <div className="space-y-2">
                  <p className="font-medium">Added/updated the following details:</p>
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-2 rounded max-h-48 overflow-y-auto">
                    {updateSummary}
                  </pre>
                </div>
              ),
              duration: 10000 // Show for 10 seconds so user can read it
            });

            // Remove this entity from detected entities
            setDetectedEntities(prev => prev.filter(e => e !== entity));
            // Invalidate characters query
            queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
            queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
          } else {
            throw new Error('Failed to update character');
          }
        } else {
          toast({
            title: 'No updates needed',
            description: `${entity.name} already has all the information from this conversation.`,
          });
          // Still remove from detected entities since no action is needed
          setDetectedEntities(prev => prev.filter(e => e !== entity));
        }
      }
    } catch (error) {
      console.error('Error updating entity:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update character. Please try again.',
        variant: 'destructive'
      });
    }
  };


  // Memoize MessageWithApplyButtons to prevent unnecessary re-renders during typing
  const MessageWithApplyButtons = React.memo(({ message, isLastAssistant }: { message: Message; isLastAssistant: boolean }) => {
    const suggestions = extractTextSuggestions(message.content);
    const hasApplicableText = suggestions.length > 0;
    const editorContext = getEditorContext();
    const hasEditorAvailable = editorContext.type !== null && editorContext.entityId !== null;

    // Show contextual prompts only on the last assistant message
    const showContextualPrompts = isLastAssistant && message.type === 'assistant' && contextAnalysis && contextAnalysis.topics.length > 0;

    const handleContextPromptClick = (topic: any) => {
      const config = topicConfig[topic.topic] || {};
      if (config.prompt) {
        addMessage('user', config.prompt);
        chatMutation.mutate(config.prompt);
      }
    };

    return (
      <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.type === 'assistant' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
        )}

        <div className={`max-w-[85%] ${message.type === 'user' ? 'order-first' : ''}`}>
          <div
            className={`rounded-lg px-4 py-3 ${
              message.type === 'user'
                ? 'bg-primary text-primary-foreground ml-auto'
                : 'bg-muted'
            }`}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{message.timestamp.toLocaleTimeString()}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(message.content)}
                className="h-6 px-2"
                data-testid={`button-copy-message-${message.id}`}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {hasApplicableText && message.type === 'assistant' && hasEditorAvailable && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-muted-foreground font-medium">
                Suggested text changes:
              </div>
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded border">
                  <div className="flex-1 text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                    "{suggestion.text.length > 60 ? suggestion.text.substring(0, 60) + '...' : suggestion.text}"
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyTextChange(suggestion.text, suggestion.type)}
                    className="h-8 px-3"
                    data-testid={`button-apply-change-${message.id}-${index}`}
                  >
                    <ArrowRightToLine className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Contextual Prompts - Only show on last assistant message */}
          {showContextualPrompts && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-muted-foreground font-medium px-1">
                {isAnalyzingContext ? 'Analyzing conversation...' : 'Quick actions:'}
              </div>
              {!isAnalyzingContext && (
                <div className="flex flex-wrap gap-2">
                  {contextAnalysis.topics.slice(0, 3).map((topic: any) => (
                    <ContextualPromptCard
                      key={topic.topic}
                      topic={topic.topic}
                      confidence={topic.confidence}
                      reason={topic.reason}
                      onSelect={() => handleContextPromptClick(topic)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {message.type === 'user' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if message content or isLastAssistant changes
    return prevProps.message.id === nextProps.message.id && 
           prevProps.isLastAssistant === nextProps.isLastAssistant;
  });

  // Map topics to prompts (for contextual prompt handler)
  const topicConfig: Record<string, { prompt: string }> = {
    plot: {
      prompt: 'Analyze the plot structure and check for potential plot holes or inconsistencies'
    },
    character: {
      prompt: 'Help me develop this character further with backstory, motivations, and personality details'
    },
    dialogue: {
      prompt: 'Review and suggest improvements for the dialogue we discussed'
    },
    setting: {
      prompt: 'Help me develop this setting with more sensory details and world-building'
    },
    worldbuilding: {
      prompt: 'Suggest world-building details and elements to make this world feel more alive'
    },
    pacing: {
      prompt: 'Analyze the pacing and suggest areas where it might be too slow or too fast'
    },
    theme: {
      prompt: 'Help me explore and deepen the thematic elements we discussed'
    },
    conflict: {
      prompt: 'Suggest ways to increase tension and raise the stakes in this conflict'
    },
    prose: {
      prompt: 'Review the prose style and suggest improvements for clarity and impact'
    },
    grammar: {
      prompt: 'Proofread for grammar, spelling, and punctuation issues'
    }
  };

  return (
    <div className={`h-full flex flex-col bg-background overflow-hidden ${className}`} data-testid={`writing-assistant-panel-${panelId}`}>
      {/* Thread title display */}
      {threadTitle && (
        <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Conversation:</span>
            <span className="text-sm font-medium" data-testid="text-thread-title">{threadTitle}</span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 min-h-0 max-h-[calc(100vh-300px)] md:max-h-none overflow-y-auto">
        <div className="space-y-3 p-3 pb-6">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Ask me anything about your writing!</p>
              <p className="text-xs mt-2">I have full context of your notebook and projects.</p>
              <p className="text-xs mt-1">Try the suggested prompts below to get started.</p>
            </div>
          )}

          {messages.map((message, index) => {
            // Check if this is the last assistant message
            const isLastAssistant = message.type === 'assistant' && 
              index === messages.length - 1 || 
              (index < messages.length - 1 && messages[index + 1].type === 'user');

            return (
              <MessageWithApplyButtons 
                key={message.id} 
                message={message} 
                isLastAssistant={isLastAssistant}
              />
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Detected Entities - moved inside ScrollArea for mobile visibility */}
      {detectedEntities.length > 0 && (
        <div className="flex-shrink-0 border-t bg-muted/30 max-h-[40vh] overflow-y-auto">
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2 sticky top-0 bg-muted/30 pb-2 z-10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Detected from conversation</span>
              {isDetectingEntities && (
                <span className="text-xs text-muted-foreground">Analyzing...</span>
              )}
            </div>
            <div className="space-y-2">
              {detectedEntities.map((entity, index) => (
                <EntityActionCard
                  key={`${entity.type}-${entity.name}-${index}`}
                  entity={entity}
                  onCreateNew={() => handleCreateEntity(entity)}
                  onUpdateExisting={entity.type === 'character' ? () => handleUpdateEntity(entity) : undefined}
                  existingEntity={entity.type === 'character' ? findExistingCharacter(entity.name) : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t flex-shrink-0 space-y-3">
        {/* Smart Prompt Suggestions */}
        {messages.length === 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium px-1">Suggested prompts:</div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <Tooltip key={prompt.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="h-8 text-xs"
                      data-testid={`button-prompt-${prompt.id}`}
                    >
                      <prompt.icon className="w-3 h-3 mr-1.5" />
                      {prompt.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{prompt.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Extended Thinking Toggle */}
        {hasPremiumAccess() && (
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="extended-thinking"
                      checked={extendedThinkingEnabled}
                      onCheckedChange={setExtendedThinkingEnabled}
                      disabled={extendedThinkingRemaining <= 0}
                      data-testid="switch-extended-thinking"
                    />
                    <Label htmlFor="extended-thinking" className="text-sm font-medium cursor-pointer">
                      Extended Thinking
                    </Label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Uses advanced AI for deeper reasoning and analysis</p>
                </TooltipContent>
              </Tooltip>
              {extendedThinkingEnabled && (
                <Badge variant="secondary" className="text-xs">
                  Slower, higher quality
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {extendedThinkingRemaining}/{premiumQuota?.extendedThinking.limit || 0} remaining
            </span>
          </div>
        )}

        {/* Chat Input */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setShowImagePromptDialog(true)}
            disabled={chatMutation.isPending}
            className="shrink-0"
            data-testid="button-generate-image"
            title="Generate AI Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <ChatInput 
            ref={chatInputRef}
            onSubmit={handleChatSubmit}
            isPending={chatMutation.isPending}
          />
        </div>
      </div>

      {/* Image Generation Dialog */}
      <Dialog open={showImagePromptDialog} onOpenChange={setShowImagePromptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Image</DialogTitle>
            <DialogDescription>
              Describe the image you want to generate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="E.g., A fantasy character portrait of an elven warrior with silver hair..."
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={4}
              data-testid="textarea-image-prompt"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImagePromptDialog(false);
                setImagePrompt('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (imagePrompt.trim()) {
                  generateImageMutation.mutate(imagePrompt.trim());
                }
              }}
              disabled={!imagePrompt.trim() || generateImageMutation.isPending}
              data-testid="button-submit-image-generation"
            >
              {generateImageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entity Preview Dialog */}
      <EntityPreviewDialog
        open={showEntityPreview}
        onOpenChange={setShowEntityPreview}
        entity={selectedEntity}
        onConfirm={async (editedDetails) => {
          if (!selectedEntity) return;

          try {
            if (selectedEntity.type === 'character') {
              // Create character from extracted details
              const characterData = {
                notebookId: activeNotebookId,
                givenName: editedDetails.givenName || selectedEntity.name,
                familyName: editedDetails.familyName || '',
                species: editedDetails.species || '',
                age: editedDetails.age || '',
                occupation: editedDetails.occupation || '',
                physicalDescription: editedDetails.physicalDescription || '',
                personality: editedDetails.personality || '',
                backstory: editedDetails.backstory || '',
                motivations: editedDetails.motivations || '',
                abilities: editedDetails.abilities || '',
                relationships: editedDetails.relationships || []
              };

              const response = await fetch('/api/characters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(characterData)
              });

              if (response.ok) {
                toast({
                  title: 'Character created',
                  description: `${characterData.givenName} has been added to your notebook.`
                });
                // Remove this entity from detected entities
                setDetectedEntities(prev => prev.filter(e => e !== selectedEntity));
                // Invalidate characters query
                queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
              } else {
                throw new Error('Failed to create character');
              }
            } else if (selectedEntity.type === 'location') {
              // Create location from extracted details
              const locationData = {
                notebookId: activeNotebookId,
                name: editedDetails.name || selectedEntity.name,
                description: editedDetails.description || '',
                atmosphere: editedDetails.atmosphere || '',
                significance: editedDetails.significance || ''
              };

              const response = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(locationData)
              });

              if (response.ok) {
                toast({
                  title: 'Location created',
                  description: `${locationData.name} has been added to your notebook.`
                });
                setDetectedEntities(prev => prev.filter(e => e !== selectedEntity));
                queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
              } else {
                throw new Error('Failed to create location');
              }
            } else if (selectedEntity.type === 'plotPoint') {
              // Create plot point from extracted details
              const plotData = {
                notebookId: activeNotebookId,
                name: editedDetails.name || selectedEntity.name,
                description: editedDetails.description || '',
                significance: editedDetails.significance || ''
              };

              const response = await fetch('/api/plot-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(plotData)
              });

              if (response.ok) {
                toast({
                  title: 'Plot point created',
                  description: `${plotData.name} has been added to your notebook.`
                });
                setDetectedEntities(prev => prev.filter(e => e !== selectedEntity));
                queryClient.invalidateQueries({ queryKey: ['/api/plot-points'] });
              } else {
                throw new Error('Failed to create plot point');
              }
            }
          } catch (error) {
            console.error('Error creating entity:', error);
            toast({
              title: 'Creation failed',
              description: 'Could not create the entity. Please try again.',
              variant: 'destructive'
            });
          }
        }}
        onCancel={() => {
          setSelectedEntity(null);
          setShowEntityPreview(false);
        }}
      />

      {/* Chat History Dropdown */}
      {showHistoryDropdown && (
        <div
          ref={historyDropdownRef}
          className="absolute top-16 right-3 bg-popover border rounded-md shadow-lg py-2 z-50 w-80"
          data-testid="chat-history-dropdown"
        >
          <div className="px-3 pb-2 border-b">
            <h3 className="font-medium text-sm">Chat History</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length} message{messages.length !== 1 ? 's' : ''} in current conversation
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="p-3">
                <div className="text-sm font-medium mb-2">Current Conversation</div>
                <div className="space-y-2">
                  {messages.slice(0, 5).map((message) => (
                    <div
                      key={message.id}
                      className="p-2 bg-muted/30 rounded text-xs cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setShowHistoryDropdown(false);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Bot className="w-3 h-3 text-primary" />
                        )}
                        <span className="font-medium capitalize">{message.type}</span>
                        <span className="text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="truncate">{message.content}</p>
                    </div>
                  ))}
                  {messages.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      ... and {messages.length - 5} more messages
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                No messages in current conversation
              </div>
            )}
          </div>

          <div className="px-3 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearChatMutation.mutate();
                setShowHistoryDropdown(false);
              }}
              disabled={clearChatMutation.isPending || messages.length === 0}
              className="w-full h-7"
              data-testid="button-clear-from-history"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Current Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}