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
  Copy
} from 'lucide-react';

interface WritingAssistantPanelProps {
  panelId: string;
  className?: string;
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

export default function WritingAssistantPanel({ panelId, className }: WritingAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getEditorContext } = useWorkspaceStore();

  // Load chat history when component mounts or editor context changes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const editorContext = getEditorContext();
        
        // Build query parameters for fetching messages
        const params = new URLSearchParams();
        if (editorContext.type === 'manuscript' && editorContext.entityId) {
          params.append('manuscriptId', editorContext.entityId);
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
          manuscriptId: editorContext.type === 'manuscript' ? editorContext.entityId : undefined,
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
            <ScrollArea className="flex-1 min-h-0 max-h-[calc(100vh-300px)] md:max-h-none overflow-y-auto">
              <div className="space-y-3 p-3 pb-6">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Ask me anything about your writing!</p>
                    <p className="text-xs mt-1">I can analyze, proofread, rephrase, and suggest improvements.</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      <div className={`rounded-lg p-2 text-sm ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.type === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Ensure proper styling for markdown elements
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs">{children}</code>,
                                blockquote: ({ children }) => <blockquote className="border-l-2 border-muted-foreground/20 pl-3 italic">{children}</blockquote>
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      
                      {/* Message metadata and actions */}
                      <div className={`flex items-center gap-2 mt-1 px-1 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.type === 'assistant' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 w-16 p-0 text-xs opacity-70 hover:opacity-100 transition-opacity"
                            data-testid="button-copy-message"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
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
    </div>
  );
}