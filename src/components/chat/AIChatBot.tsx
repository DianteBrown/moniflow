import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Send,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AIChatBotProps {
  className?: string;
}

export default function AIChatBot({ className }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to Moniflow. I’m your Copilot for budgets, spending, and goals, so you can stress less and save more. How can I help?",
      sender: 'bot',
      timestamp: new Date()
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastBotMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const focusOnBotMessage = () => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      setTimeout(() => {
        // First scroll to bottom to show the new message
        scrollToBottom();
        // Then focus on the bot message
        if (lastBotMessageRef.current) {
          lastBotMessageRef.current.focus();
          // Also scroll the focused element into view
          lastBotMessageRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    });
  };

  // Remove automatic scrolling on every message change
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Make POST request to /chat endpoint
      const response = await api.post('/ai-bot/chat', {
        message: currentInput,
        conversationHistory: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || response.data.response || 'Sorry, I couldn\'t process that request.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      // Use a longer delay to ensure the DOM has updated
      setTimeout(() => {
        focusOnBotMessage();
      }, 100);
    } catch (error) {
      console.error('Chat API error:', error);

      // Fallback response on error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
      // Use a longer delay to ensure the DOM has updated
      setTimeout(() => {
        focusOnBotMessage();
      }, 100);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text: string) => {
    // Split text into lines for processing
    const lines = text.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={index} className="flex items-start gap-3 my-2">
            <span className="text-gray-600 dark:text-gray-400 mt-1 text-base">•</span>
            <span className="text-gray-900 dark:text-gray-100 leading-relaxed text-base">{line.trim().substring(2)}</span>
          </div>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={index} className="flex items-start gap-3 my-2">
            <span className="text-gray-600 dark:text-gray-400 mt-1 text-base font-medium">{line.trim().split('.')[0]}.</span>
            <span className="text-gray-900 dark:text-gray-100 leading-relaxed text-base">{line.trim().substring(line.trim().indexOf('.') + 1).trim()}</span>
          </div>
        );
      }

      // Handle bold text (**text** or __text__)
      if (line.includes('**') || line.includes('__')) {
        const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
          .replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
        return <div key={index} className="my-2 leading-relaxed text-gray-900 dark:text-gray-100 text-base" dangerouslySetInnerHTML={{ __html: boldText }} />;
      }

      // Handle code blocks (```code```)
      if (line.trim().startsWith('```')) {
        return <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-base my-3 border border-gray-200 dark:border-gray-700">{line.trim().substring(3)}</div>;
      }

      // Handle inline code (`code`)
      if (line.includes('`')) {
        const codeText = line.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-base font-mono border border-gray-200 dark:border-gray-700">$1</code>');
        return <div key={index} className="my-2 leading-relaxed text-gray-900 dark:text-gray-100 text-base" dangerouslySetInnerHTML={{ __html: codeText }} />;
      }

      // Handle headers (# Header)
      if (line.trim().startsWith('#')) {
        const level = line.trim().match(/^#+/)?.[0].length || 1;
        const headerText = line.trim().substring(level).trim();
        const className = level === 1 ? 'text-2xl font-bold text-gray-900 dark:text-gray-100 my-4' :
          level === 2 ? 'text-xl font-semibold text-gray-900 dark:text-gray-100 my-3' :
            'text-lg font-semibold text-gray-900 dark:text-gray-100 my-2';
        return <div key={index} className={className}>{headerText}</div>;
      }

      // Regular text
      return <div key={index} className="my-2 leading-relaxed text-gray-900 dark:text-gray-100 text-base">{line}</div>;
    });

    return <div className="prose prose-gray dark:prose-invert max-w-none">{formattedLines}</div>;
  };


  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg", className)}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 bg-[#060609]",
        !isCollapsed && "border-b border-gray-200 dark:border-gray-700"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/assets/images/AI bot.png" alt="Moniflow Copilot" className="h-full w-full" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">Moniflow Copilot</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your money, organized.
              Bills, budgets, goals, and alerts in one simple place wiith me.</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isCollapsed ? (
            <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          )}
        </Button>
      </div>

      {/* Messages Area */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6  bg-[#060609]">
          {messages.map((message, index) => {
            const isLastBotMessage = message.sender === 'bot' &&
              index === messages.length - 1;

            return (
              <div
                key={message.id}
                ref={isLastBotMessage ? lastBotMessageRef : null}
                tabIndex={isLastBotMessage ? 0 : -1}
                className={cn(
                  "flex gap-4 max-w-4xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-2 transition-all",
                  message.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                  message.sender === 'bot'
                    ? ""
                    : "bg-purple-600"
                )}>
                  {message.sender === 'bot' ? (
                    <img src="/assets/images/AI copilot.png" alt="Moniflow Copilot" className="h-full w-full" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-3xl",
                  message.sender === 'user' ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "inline-block px-4 py-3 rounded-lg leading-relaxed",
                    message.sender === 'user'
                      ? "bg-purple-600 text-white text-base"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base"
                  )}>
                    {message.sender === 'bot' ? formatMessage(message.text) : message.text}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 ">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-4 max-w-4xl mr-auto">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <img src="/assets/images/AI copilot.png" alt="Moniflow Copilot" className="h-full w-full" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-3 rounded-lg bg-transparent">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200  bg-[#060609]">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Moniflow Copilot..."
                  className="w-full pr-12 py-3 text-base border-gray-300 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500 focus:ring-0 rounded-xl"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              Moniflow Copilot can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}