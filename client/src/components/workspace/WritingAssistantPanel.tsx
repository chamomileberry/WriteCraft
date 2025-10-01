import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Edit3, 
  BookOpen, 
  HelpCircle, 
  Lightbulb,
  Loader2,
  Copy,
  ArrowRightToLine,
  User,
  Bot,
  MessageSquarePlus,
  History,
  Trash2
} from 'lucide-react';

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

interface TextAnalysis {
  suggestions: string[];
  readabilityScore: number;
  potentialIssues: string[];
}

interface ProofreadResult {
  correctedText: string;
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
}

export default function WritingAssistantPanel({ 
  panelId, 
  className, 
  onRegisterClearChatFunction, 
  onRegisterToggleHistoryFunction 
}: WritingAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getEditorContext, executeEditorAction } = useWorkspaceStore();

  // Load chat history when component mounts or editor context changes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const editorContext = getEditorContext();
        
        // Build query parameters for fetching messages
        const params = new URLSearchParams();
        if (editorContext.type === 'manuscript' && editorContext.entityId) {
          params.append('projectId', editorContext.entityId);
        } else if (editorContext.type === 'guide' && editorContext.entityId) {
          params.append('guideId', editorContext.entityId);
        }
        
        const response = await fetch(`/api/chat-messages?${params.toString()}`, {
          headers: {
            'x-user-id': 'demo-user' // TODO: Replace with actual user ID
          }
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
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [getEditorContext]);

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

  // AI analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;
      
      const response = await fetch('/api/writing-assistant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to analyze text');
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setActiveTab('analysis');
    },
    onError: () => {
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze the text. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Rephrase mutation
  const rephraseMutation = useMutation({
    mutationFn: async ({ text, style }: { text: string; style: string }) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;
      
      const response = await fetch('/api/writing-assistant/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          style,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to rephrase text');
      return response.json();
    },
    onSuccess: (data) => {
      addMessage('assistant', `Rephrased text: "${data.text}"`);
    },
  });

  // Proofread mutation
  const proofreadMutation = useMutation({
    mutationFn: async (text: string) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;
      
      const response = await fetch('/api/writing-assistant/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to proofread text');
      return response.json();
    },
    onSuccess: (data: ProofreadResult) => {
      const correctionsList = data.corrections.length > 0 
        ? data.corrections.map(c => `• ${c.original} → ${c.corrected} (${c.reason})`).join('\n')
        : 'No corrections needed!';
      
      addMessage('assistant', `Proofread result:\n\n"${data.correctedText}"\n\nCorrections made:\n${correctionsList}`);
    },
  });

  // Generate questions mutation
  const questionsMutation = useMutation({
    mutationFn: async (text: string) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;
      
      const response = await fetch('/api/writing-assistant/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to generate questions');
      return response.json();
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setActiveTab('questions');
    },
  });


  // Conversational chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const editorContext = getEditorContext();
      const hasEditorContent = editorContext.content && editorContext.content.length > 10;
      
      // Prepare conversation history from messages
      const conversationHistory = messages
        .slice(-10) // Only send last 10 messages for context
        .map(msg => ({
          role: msg.type,
          content: msg.content
        }));

      const response = await fetch('/api/writing-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          conversationHistory: conversationHistory.length > 0 ? conversationHistory : undefined,
          editorContent: hasEditorContent ? editorContext.content : undefined,
          documentTitle: hasEditorContent ? editorContext.title : undefined,
          documentType: hasEditorContent ? editorContext.type : undefined
        }),
      });
      if (!response.ok) throw new Error('Failed to get chat response');
      return response.json();
    },
    onSuccess: (data) => {
      addMessage('assistant', data.message);
    },
    onError: () => {
      addMessage('assistant', "I'm having trouble processing your message right now. Please try again, and I'll do my best to help with your writing!");
    },
  });

  // Clear chat history mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const editorContext = getEditorContext();
      
      // Build query parameters for clearing messages
      const params = new URLSearchParams();
      if (editorContext.type === 'manuscript' && editorContext.entityId) {
        params.append('projectId', editorContext.entityId);
      } else if (editorContext.type === 'guide' && editorContext.entityId) {
        params.append('guideId', editorContext.entityId);
      }
      
      const response = await fetch(`/api/chat-messages?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'demo-user' // TODO: Replace with actual user ID
        }
      });
      if (!response.ok) throw new Error('Failed to clear chat history');
    },
    onSuccess: () => {
      setMessages([]);
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
    
    // If we have editor content, use it (this is the manuscript/guide being edited)
    if (editorContext.content && editorContext.content.length > 10) {
      return {
        text: editorContext.content.slice(0, 2000), // Limit to reasonable size
        hasEditorContent: true,
        title: editorContext.title,
        type: editorContext.type
      };
    }
    
    // Fallback: if no editor content, return empty
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
    
    // Look for quoted text suggestions in messages
    const quotedTextRegex = /"([^"]+)"/g;
    let match;
    while ((match = quotedTextRegex.exec(content)) !== null) {
      const text = match[1];
      if (text.length > 10 && text.length < 500) { // Reasonable text length
        suggestions.push({ text, type: 'replace' });
      }
    }
    
    // Look for "corrected" or "improved" text patterns
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
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    
    // Update local state immediately for responsive UI
    setMessages(prev => [...prev, newMessage]);
    
    // Save to database in background
    try {
      const editorContext = getEditorContext();
      
      const response = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user' // TODO: Replace with actual user ID
        },
        body: JSON.stringify({
          type,
          content,
          projectId: editorContext.type === 'manuscript' ? editorContext.entityId : undefined,
          guideId: editorContext.type === 'guide' ? editorContext.entityId : undefined,
          metadata
        })
      });
      
      if (response.ok) {
        const savedMessage = await response.json();
        // Update the message with the actual database ID
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, id: savedMessage.id }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to save message to database:', error);
      // Message still shows in UI even if database save fails
    }
  };

  // Handle chat submission
  const handleChatSubmit = () => {
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    addMessage('user', text);
    setInputText('');

    // Auto-detect intent and respond accordingly
    const editorContent = getEditorText();
    
    if (text.toLowerCase().includes('analyze')) {
      if (editorContent.text && editorContent.text.length >= 10) {
        analyzeMutation.mutate(editorContent.text);
      } else {
        addMessage('assistant', 'I need some text to analyze. Could you provide the text you\'d like me to examine, or open a manuscript to edit?');
      }
    } else if (text.toLowerCase().includes('proofread')) {
      if (editorContent.text && editorContent.text.length >= 10) {
        proofreadMutation.mutate(editorContent.text);
      } else {
        addMessage('assistant', 'I need some text to proofread. Could you provide the text you\'d like me to check, or open a manuscript to edit?');
      }
    } else if (text.toLowerCase().includes('questions')) {
      if (editorContent.text && editorContent.text.length >= 10) {
        questionsMutation.mutate(editorContent.text);
      } else {
        addMessage('assistant', 'I need some text to generate questions about. Could you provide the content, or open a manuscript to edit?');
      }
    } else {
      // Use conversational chat for general writing discussions, brainstorming, and questions
      chatMutation.mutate(text);
    }
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    const editorContent = getEditorText();
    
    if (!editorContent.text || editorContent.text.length < 10) {
      addMessage('assistant', 'I need some text to work with. Could you please:\n\n1. Open a manuscript for editing, or\n2. Paste or type some text in the chat for me to analyze\n\nI can help with analyzing, proofreading, rephrasing, and improving any text you provide!');
      return;
    }

    switch (action) {
      case 'analyze':
        analyzeMutation.mutate(editorContent.text);
        break;
      case 'proofread':
        proofreadMutation.mutate(editorContent.text);
        break;
      case 'questions':
        questionsMutation.mutate(editorContent.text);
        break;
      case 'rephrase-formal':
        rephraseMutation.mutate({ text: editorContent.text, style: 'formal' });
        break;
      case 'rephrase-casual':
        rephraseMutation.mutate({ text: editorContent.text, style: 'casual' });
        break;
      case 'rephrase-concise':
        rephraseMutation.mutate({ text: editorContent.text, style: 'concise' });
        break;
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard.',
    });
  };

  // Message component with apply buttons for suggestions
  const MessageWithApplyButtons = ({ message }: { message: Message }) => {
    const suggestions = extractTextSuggestions(message.content);
    const hasApplicableText = suggestions.length > 0;
    const editorContext = getEditorContext();
    const hasEditorAvailable = editorContext.type !== null && editorContext.entityId !== null;

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

          {/* Apply buttons for text suggestions - only show when in editor context */}
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
        </div>

        {message.type === 'user' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col bg-background overflow-hidden ${className}`} data-testid={`writing-assistant-panel-${panelId}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, hsl(270, 75%, 75%) 0%, hsl(255, 69%, 71%) 100%)'}}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">Writing Assistant</h3>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">AI-powered writing help</p>
            {(() => {
              const editorContent = getEditorText();
              return editorContent.hasEditorContent && (
                <Badge variant="secondary" className="text-xs">
                  {editorContent.type === 'manuscript' ? '📖' : '📝'} {editorContent.title}
                </Badge>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-2 flex-shrink-0">
            <TabsTrigger value="chat" className="text-xs" data-testid="tab-chat">
              <MessageSquare className="w-3 h-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs" data-testid="tab-analysis">
              <FileText className="w-3 h-3 mr-1" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs" data-testid="tab-actions">
              <Edit3 className="w-3 h-3 mr-1" />
              Actions
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs" data-testid="tab-questions">
              <HelpCircle className="w-3 h-3 mr-1" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 min-h-0">
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-3 p-3 pb-6">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Ask me anything about your writing!</p>
                    <p className="text-xs mt-1">I can analyze, proofread, rephrase, and suggest improvements.</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <MessageWithApplyButtons key={message.id} message={message} />
                ))}
                
                {/* Scroll target for auto-scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about your writing..."
                  className="min-h-[40px] max-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  data-testid="input-chat-message"
                />
                <Button 
                  size="sm" 
                  onClick={handleChatSubmit}
                  disabled={!inputText.trim()}
                  data-testid="button-send-message"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="flex-1 mt-0 min-h-0">
            <ScrollArea className="h-full p-3">
              {analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Readability Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold">{analysis.readabilityScore}</div>
                        <div className="text-sm text-muted-foreground">/ 100</div>
                        <Badge variant={analysis.readabilityScore >= 80 ? 'default' : analysis.readabilityScore >= 60 ? 'secondary' : 'destructive'}>
                          {analysis.readabilityScore >= 80 ? 'Great' : analysis.readabilityScore >= 60 ? 'Good' : 'Needs work'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="w-4 h-4 mt-0.5 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              {index + 1}
                            </span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {analysis.potentialIssues.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          Potential Issues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.potentialIssues.map((issue, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="w-4 h-4 mt-0.5 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
                                !
                              </span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No analysis available</p>
                  <p className="text-xs mt-1">Use the quick actions to analyze your text</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="flex-1 mt-0 min-h-0">
            <ScrollArea className="h-full p-3">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('analyze')}
                    disabled={analyzeMutation.isPending}
                    className="justify-start h-auto p-3"
                    data-testid="button-analyze-text"
                  >
                    <div className="flex items-start gap-3">
                      {analyzeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mt-0.5 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mt-0.5" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Analyze Text</div>
                        <div className="text-xs text-muted-foreground">Get writing suggestions and readability score</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('proofread')}
                    disabled={proofreadMutation.isPending}
                    className="justify-start h-auto p-3"
                    data-testid="button-proofread-text"
                  >
                    <div className="flex items-start gap-3">
                      {proofreadMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mt-0.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mt-0.5" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Proofread</div>
                        <div className="text-xs text-muted-foreground">Check grammar, spelling, and style</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('questions')}
                    disabled={questionsMutation.isPending}
                    className="justify-start h-auto p-3"
                    data-testid="button-generate-questions"
                  >
                    <div className="flex items-start gap-3">
                      {questionsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mt-0.5 animate-spin" />
                      ) : (
                        <HelpCircle className="w-4 h-4 mt-0.5" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Generate Questions</div>
                        <div className="text-xs text-muted-foreground">What readers might ask about your content</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <h4 className="text-sm font-medium mb-2">Rephrase Styles</h4>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('rephrase-formal')}
                    disabled={rephraseMutation.isPending}
                    className="justify-start"
                    data-testid="button-rephrase-formal"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Make it Formal
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('rephrase-casual')}
                    disabled={rephraseMutation.isPending}
                    className="justify-start"
                    data-testid="button-rephrase-casual"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Make it Casual
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('rephrase-concise')}
                    disabled={rephraseMutation.isPending}
                    className="justify-start"
                    data-testid="button-rephrase-concise"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Make it Concise
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="flex-1 mt-0 min-h-0">
            <ScrollArea className="h-full p-3">
              {questions.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Reader Questions
                  </h4>
                  {questions.map((question, index) => (
                    <Card key={index} className="p-3">
                      <p className="text-sm">{question}</p>
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(question)}
                          className="h-6 px-2"
                          data-testid={`button-copy-question-${index}`}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No questions generated yet</p>
                  <p className="text-xs mt-1">Use the quick actions to generate reader questions</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

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
                  {messages.slice(0, 5).map((message, index) => (
                    <div
                      key={message.id}
                      className="p-2 bg-muted/30 rounded text-xs cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        // Auto-scroll to this message in the chat
                        setShowHistoryDropdown(false);
                        setActiveTab('chat');
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