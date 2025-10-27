import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, HeadphonesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showContactSupport?: boolean;
}

export function HelpChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your WriteCraft assistant. I can help you with:\n\n• Navigating the application\n• Understanding workflows and features\n• Billing and subscription questions\n• Tips for using generators and tools\n\nWhat can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Escalation keywords to detect when AI suggests contacting support
  const escalationKeywords = [
    'contact support',
    'contact our support',
    'reach out to support',
    'speak to support',
    'talk to support',
    'real person',
    'human representative',
    'customer service',
    'speak to a human',
    'talk to a human',
    'speak with someone',
    'talk to someone',
    'contact us',
    'get in touch',
    'representative',
    'support team',
    'customer support',
    'technical support',
    'admin',
    'administrator'
  ];

  // Check if message contains escalation keywords
  const detectEscalation = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    return escalationKeywords.some(keyword => lowerContent.includes(keyword));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleContactSupport = () => {
    // Create a conversation transcript for context
    const transcript = messages
      .map(m => `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    // Store transcript in sessionStorage for pre-filling feedback
    sessionStorage.setItem('helpChatTranscript', transcript);
    sessionStorage.setItem('helpChatOriginalQuestion', messages.find(m => m.role === 'user')?.content || '');

    // Close the chat widget
    setIsOpen(false);

    // Navigate to feedback page with a flag to pre-fill the form
    setLocation('/feedback?openFeedback=true');

    toast({
      title: 'Redirecting to support',
      description: 'Opening the feedback form with your conversation context...',
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the AI assistant with help context
      const response = await apiRequest('/api/writing-assistant/chat', 'POST', {
        message: input,
        conversationHistory: messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content,
        })),
        context: 'help_support',
      });

      const data = await response.json();

      const responseContent = data.content || data.message || 'Sorry, I could not generate a response.';
      const shouldShowContactSupport = detectEscalation(responseContent);

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        showContactSupport: shouldShowContactSupport,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or visit our documentation for more help.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
        data-testid="button-open-help-chat"
        aria-label="Open help chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] shadow-xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <CardTitle className="text-lg font-semibold">Help Assistant</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-minimize-help-chat"
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-help-chat"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {/* Show Contact Support button for assistant messages with escalation keywords */}
                {message.role === 'assistant' && message.showContactSupport && (
                  <div className="flex justify-start">
                    <Button
                      onClick={handleContactSupport}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      data-testid="button-contact-support"
                    >
                      <HeadphonesIcon className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              data-testid="input-help-chat-message"
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              data-testid="button-send-help-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
