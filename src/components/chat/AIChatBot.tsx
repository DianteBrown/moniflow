import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User } from 'lucide-react';
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
      text:
        "Welcome to Heritage Budgeting. I'm your Copilot for budgets, spending, and goals, so you can stress less and save more. How can I help?",
      sender: 'bot',
      timestamp: new Date()
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // The ONLY scroll target: the messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: messages.length <= 2 ? 'auto' : 'smooth' });
  }, [messages]);

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
      const response = await api.post('/ai-bot/chat', {
        message: currentInput,
        conversationHistory: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      });

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          response.data.message ||
          response.data.response ||
          "Sorry, I couldn't process that request.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
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
    const lines = text.split('\n');
    const formatted = lines.map((line, index) => {
      // bullets
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={index} className="my-2 flex items-start gap-3">
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">•</span>
            <span className="text-base leading-relaxed text-gray-900 dark:text-gray-100">
              {line.trim().substring(2)}
            </span>
          </div>
        );
      }
      // numbered
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={index} className="my-2 flex items-start gap-3">
            <span className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {line.trim().split('.')[0]}.
            </span>
            <span className="text-base leading-relaxed text-gray-900 dark:text-gray-100">
              {line.trim().substring(line.trim().indexOf('.') + 1).trim()}
            </span>
          </div>
        );
      }
      // bold
      if (line.includes('**') || line.includes('__')) {
        const boldText = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')
          .replace(/__(.*?)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
        return (
          <div
            key={index}
            className="my-2 text-base leading-relaxed text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: boldText }}
          />
        );
      }
      // block code  ```code```
      if (line.trim().startsWith('```')) {
        return (
          <div
            key={index}
            className="my-3 rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {line.trim().substring(3)}
          </div>
        );
      }
      // inline code `code`
      if (line.includes('`')) {
        const codeText = line.replace(
          /`(.*?)`/g,
          '<code class="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-800">$1</code>'
        );
        return (
          <div
            key={index}
            className="my-2 text-base leading-relaxed text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: codeText }}
          />
        );
      }
      // headers
      if (line.trim().startsWith('#')) {
        const level = line.trim().match(/^#+/)?.[0].length || 1;
        const headerText = line.trim().substring(level).trim();
        const cls =
          level === 1
            ? 'my-3 text-xl font-bold'
            : level === 2
            ? 'my-2 text-lg font-semibold'
            : 'my-1.5 text-base font-semibold';
        return <div key={index} className={cls}>{headerText}</div>;
      }
      // normal
      return (
        <div key={index} className="my-2 text-base leading-relaxed text-gray-900 dark:text-gray-100">
          {line}
        </div>
      );
    });

    return <div className="prose prose-gray dark:prose-invert max-w-none">{formatted}</div>;
  };

  return (
    <div
      className={cn(
        // Stand-out shell
        'flex flex-col rounded-2xl border border-gray-300 dark:border-gray-700 shadow-xl',
        'bg-white/90 dark:bg-gray-900/85 backdrop-blur',
        // Fixed responsive height so only inner scroll moves
        'max-h-[70vh] h-[70vh]',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center rounded-t-2xl px-4 py-3',
          'text-white',
          'bg-[var(--heritage-green)] dark:bg-[var(--heritage-light-green)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center">
            <img src="/assets/images/AI bot.png" alt="Heritage Budgeting Copilot" className="h-full w-full" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Heritage Budgeting Copilot</h1>
            <p className="text-xs text-gray-300">
              Your money, organized. Bills, budgets, goals, and alerts with me.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area (scrolls inside) */}
      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto bg-gray-50/80 p-4 dark:bg-gray-800/70 ai-chat-messages"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
        }}
      >
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex max-w-4xl gap-4',
                  message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                {/* Avatar */}
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                  style={message.sender === 'user' ? {backgroundColor: 'var(--heritage-green)'} : {}}
                >
                  {message.sender === 'bot' ? (
                    <img src="/assets/images/AI copilot.png" alt="Heritage Budgeting Copilot" className="h-full w-full" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Bubble */}
                <div className={cn('max-w-3xl', message.sender === 'user' ? 'text-right' : 'text-left')}>
                  <div
                    className={cn(
                      'inline-block rounded-lg px-4 py-3 leading-relaxed shadow-sm ring-1',
                      message.sender === 'user'
                        ? 'text-white ring-transparent'
                        : 'bg-white/95 text-gray-900 ring-gray-200 dark:bg-gray-700/90 dark:text-gray-100 dark:ring-gray-600'
                    )}
                    style={message.sender === 'user' ? {backgroundColor: 'var(--heritage-green)'} : {}}
                  >
                    {message.sender === 'bot' ? formatMessage(message.text) : message.text}
                  </div>
                  <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto flex max-w-4xl gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <img src="/assets/images/AI copilot.png" alt="Heritage Budgeting Copilot" className="h-full w-full" />
                </div>
                <div className="flex-1">
                  <div className="inline-block rounded-lg bg-transparent px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Input Area */}
      <div className="rounded-b-2xl border-t border-gray-200/80 bg-white/90 px-4 py-3 dark:border-gray-700/70 dark:bg-gray-900/85">
        <div className="mx-auto max-w-4xl">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Heritage Budgeting Copilot..."
                className="w-full rounded-xl pr-12 py-3 text-base shadow-sm border-gray-300 dark:border-gray-600 focus:border-[var(--heritage-green)] focus:ring-2 focus:ring-[var(--heritage-green)]/20"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="rounded-xl px-4 py-3 font-medium shadow-sm disabled:opacity-60 hover:opacity-90"
              style={{backgroundColor: 'var(--heritage-gold)', color: 'var(--heritage-green)'}}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Heritage Budgeting Copilot can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
