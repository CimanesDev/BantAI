import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, X, MessageSquare, Menu } from "lucide-react";
import { generateChatResponse } from '@/api/chat';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Utility to strip markdown (bold, italics, etc.)
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1') // italics
    .replace(/__(.*?)__/g, '$1') // underline
    .replace(/_(.*?)_/g, '$1') // italics
    .replace(/`(.*?)`/g, '$1') // inline code
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/\n{2,}/g, '\n') // collapse multiple newlines
    .replace(/^\s+|\s+$/g, '');
}

const QUICK_MESSAGES = [
  "What are the common NCAP violations?",
  "How do I appeal a violation?",
  "What are the payment methods?",
  "How do I check my violations?",
  "What is the NCAP system?",
  "How do I register my vehicle?",
  "What are the traffic laws in the Philippines?",
  "How do I get a driver's license?",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your NCAP AI Assistant. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const systemPrompt = {
        role: 'system',
        content: 'Please provide a short, summarized answer (2-3 sentences max, no long explanations).'
      };
      const response = await generateChatResponse([
        systemPrompt,
        ...messages,
        { role: 'user', content: userMessage }
      ]);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMessage = (message: string) => {
    setInput(message);
    setShowQuickReplies(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowQuickReplies(false);
  };

  return createPortal(
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
      {/* Always visible chatbot button, hidden when chat is open */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', pointerEvents: 'auto' }}>
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-[#0d3b86] hover:bg-[#0d3b86] shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-lg border border-[#0d3b86]/40"
          >
            <MessageSquare className="h-7 w-7 text-white" />
          </Button>
        </div>
      )}
      {/* Chat modal, fixed size, always bottom right, only visible when open */}
      {isOpen && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: '400px', height: '600px', maxWidth: '100%', pointerEvents: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.35, type: 'spring' }}
            className="w-full h-full bg-card/80 backdrop-blur-lg border border-primary/10 rounded-3xl shadow-2xl flex flex-col"
            style={{ minWidth: 320 }}
          >
            <div className="flex flex-col h-full bg-transparent rounded-3xl overflow-hidden">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0d3b86] to-[#0d3b86] text-white rounded-t-3xl px-6 py-4 flex items-center justify-between shadow-lg/10 border-b border-primary/30">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-lg tracking-wide">NCAP Assistant</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full border border-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {/* Messages */}
              <ScrollArea ref={scrollRef} className="flex-1 px-4 py-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.22 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div className={`flex items-end max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                          {message.role === 'user' ? (
                            <div className="bg-[#0d3b86] text-white rounded-full p-2 flex items-center justify-center shadow-md">
                              <User className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="bg-[#fcf9f6] text-[#0d3b86] rounded-full p-2 flex items-center justify-center shadow-md">
                              <Bot className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        {/* Bubble */}
                        <div
                          className={`rounded-2xl px-5 py-4 shadow-lg/10 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-[#0d3b86] to-[#0d3b86] text-white shadow-lg'
                              : 'bg-[#fcf9f6] text-[#0d3b86] border border-[#0d3b86]/20 shadow'
                          }`}
                          style={{ minWidth: 60, marginBottom: 2, marginTop: 2 }}
                        >
                          <span className="text-sm whitespace-pre-line leading-relaxed">
                            {message.role === 'assistant' ? stripMarkdown(message.content) : stripMarkdown(message.content)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-end max-w-[80%]">
                        <div className="bg-[#fcf9f6] text-[#0d3b86] rounded-full p-2 flex items-center justify-center mr-2 shadow-md">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div className="bg-[#fcf9f6] text-[#0d3b86] border border-[#0d3b86]/20 rounded-2xl px-5 py-4 shadow flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-[#0d3b86]">AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ScrollArea>
              {/* Quick Questions (toggle with hamburger) */}
              {showQuickReplies && (
                <div className="px-4 pb-2 pt-2 bg-[#fcf9f6] border-t border-[#0d3b86]/20">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {QUICK_MESSAGES.map((msg, idx) => (
                      <button
                        key={idx}
                        className="bg-[#fcf9f6] hover:bg-[#fcf9f6] text-[#0d3b86] text-xs font-medium rounded-full px-3 py-1 border border-[#0d3b86]/20 transition-colors shadow-sm"
                        onClick={() => handleQuickMessage(msg)}
                        type="button"
                      >
                        {msg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Input with hamburger */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-4 bg-[#fcf9f6] border-t border-[#0d3b86]/20 rounded-b-3xl shadow-lg/10">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-[#0d3b86] hover:bg-[#fcf9f6] flex items-center justify-center shadow-sm"
                  onClick={() => setShowQuickReplies((prev) => !prev)}
                >
                  <Menu className="h-5 w-5 text-[#0d3b86]" />
                </Button>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your question..."
                  className="flex-1 bg-[#fcf9f6] border-none focus:ring-2 focus:ring-[#0d3b86] rounded-full px-4 py-2 text-sm shadow-sm"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" className="bg-[#0d3b86] hover:bg-[#0d3b86] text-white rounded-full h-10 w-10 flex items-center justify-center">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>,
    document.body
  );
};
