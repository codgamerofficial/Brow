import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, User, Cpu } from './ui/Icons';
import { ChatMessage, PageContent } from '../types';
import { getCopilotResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageContent?: PageContent;
}

const CopilotSidebar: React.FC<CopilotSidebarProps> = ({ isOpen, onClose, currentPageContent }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: 'welcome',
        role: 'model',
        text: 'Hi! I\'m Brow Copilot. I can help you research, summarize, or answer questions about the current page.',
        timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        text: inputValue,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    const contextText = currentPageContent?.summary || "User is on a new tab or dashboard.";
    
    // Simulate network delay for realism if local logic is too fast
    const responseText = await getCopilotResponse([...messages, userMsg], contextText);

    const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 h-full border-l border-white/10 bg-[var(--brow-surface)]/95 backdrop-blur-xl flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-[var(--brow-accent)]">
            <Sparkles size={18} />
            <span className="font-bold text-sm">Copilot</span>
        </div>
        <button onClick={onClose} className="text-[var(--brow-text-secondary)] hover:text-[var(--brow-text)] p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10
                    ${msg.role === 'model' ? 'bg-[var(--brow-accent)] text-white' : 'bg-white/10 text-[var(--brow-text-secondary)]'}
                `}>
                    {msg.role === 'model' ? <Cpu size={14} /> : <User size={14} />}
                </div>
                <div className={`
                    max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed
                    ${msg.role === 'user' 
                        ? 'bg-white/10 text-[var(--brow-text)] rounded-tr-none' 
                        : 'bg-black/20 text-[var(--brow-text-secondary)] rounded-tl-none'}
                `}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
            </div>
        ))}
        {isThinking && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--brow-accent)] flex items-center justify-center shrink-0">
                    <Cpu size={14} className="text-white animate-spin" />
                </div>
                <div className="bg-black/20 rounded-2xl p-3 rounded-tl-none flex items-center gap-1">
                    <div className="w-2 h-2 bg-[var(--brow-text-secondary)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[var(--brow-text-secondary)] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[var(--brow-text-secondary)] rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-[var(--brow-bg)]/50">
        <div className="relative">
            <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this page..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-10 text-sm text-[var(--brow-text)] placeholder-[var(--brow-text-secondary)] outline-none focus:border-[var(--brow-accent)] focus:ring-1 focus:ring-[var(--brow-accent)] resize-none h-12 scrollbar-hide"
            />
            <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isThinking}
                className="absolute right-2 top-2 p-1.5 bg-[var(--brow-accent)] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <Send size={14} />
            </button>
        </div>
        <p className="text-[10px] text-[var(--brow-text-secondary)] text-center mt-2 opacity-50">
            AI can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
};

export default CopilotSidebar;