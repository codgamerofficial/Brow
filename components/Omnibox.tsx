import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  RotateCw, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Mic,
  Star,
  Ghost,
  MessageSquare,
  MicOff,
  LayoutGrid,
  History
} from './ui/Icons';
import { BrowserTab, TabStatus, ViewMode } from '../types';

interface OmniboxProps {
  activeTab: BrowserTab;
  onNavigate: (url: string) => void;
  onRefresh: () => void;
  onBack: () => void;
  onForward: () => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  isGhostMode: boolean;
  onToggleGhostMode: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
}

const Omnibox: React.FC<OmniboxProps> = ({ 
  activeTab, 
  onNavigate, 
  onRefresh, 
  onBack, 
  onForward,
  isCopilotOpen,
  onToggleCopilot,
  isGhostMode,
  onToggleGhostMode,
  viewMode,
  onToggleViewMode,
  isHistoryOpen,
  onToggleHistory
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync input with active tab URL, but only if not typing
  useEffect(() => {
    if (!isFocused) {
      const displayUrl = activeTab.url === 'brow://newtab' ? '' : activeTab.url;
      setInputValue(displayUrl);
    }
  }, [activeTab.url, isFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onNavigate(inputValue);
      inputRef.current?.blur();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        onNavigate(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      alert("Voice search is not supported in this browser.");
    }
  };

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  return (
    <div className="flex items-center gap-2 w-full max-w-5xl mx-auto py-2">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-1 text-[var(--brow-text-secondary)]">
        <button 
          disabled={!canGoBack}
          onClick={onBack}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${!canGoBack && 'opacity-30 cursor-not-allowed'}`}
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          disabled={!canGoForward}
          onClick={onForward}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${!canGoForward && 'opacity-30 cursor-not-allowed'}`}
        >
          <ChevronRight size={18} />
        </button>
        <button 
          onClick={onRefresh}
          className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${activeTab.status === TabStatus.LOADING ? 'animate-spin text-[var(--brow-accent)]' : ''}`}
        >
          <RotateCw size={16} />
        </button>
      </div>

      {/* Input Field Container */}
      <div className={`
        flex-1 flex items-center h-10 bg-black/20 border rounded-full transition-all duration-300 relative overflow-hidden
        ${isFocused ? 'border-[var(--brow-accent)] shadow-lg' : 'border-white/10 hover:border-white/30'}
        ${isListening ? 'ring-2 ring-red-500 border-red-500' : ''}
      `}>
        {/* Leading Icon */}
        <div className="pl-4 pr-2 text-[var(--brow-text-secondary)]">
           {isGhostMode ? <Ghost size={14} className="text-purple-400" /> : 
            (activeTab.url.startsWith('https') ? <ShieldCheck size={14} className="text-emerald-400" /> : <Search size={14} />)
           }
        </div>

        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--brow-text)] placeholder-[var(--brow-text-secondary)]"
          placeholder={isListening ? "Listening..." : "Search or type a query..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        />

        {/* Trailing Actions */}
        <div className="flex items-center pr-2 space-x-1">
          {inputValue && (
            <button className="p-1.5 text-[var(--brow-text-secondary)] hover:text-yellow-400 transition-colors">
              <Star size={14} />
            </button>
          )}
          
          <button 
            onClick={toggleListening}
            className={`p-1.5 transition-all duration-300 rounded-full ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-[var(--brow-text-secondary)] hover:text-[var(--brow-accent)]'}`}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        </div>

        {/* Progress Bar */}
        {activeTab.status === TabStatus.LOADING && (
          <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--brow-accent)] w-full animate-[shimmer_1.5s_infinite]"></div>
        )}
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-1 pl-2 border-l border-white/10">
         <button
            onClick={onToggleHistory}
            className={`p-2 rounded-lg transition-all ${isHistoryOpen ? 'bg-[var(--brow-accent)] text-white shadow-lg' : 'text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)]'}`}
            title="Tab History"
         >
            <History size={18} />
         </button>

         <button
            onClick={onToggleViewMode}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.GRID ? 'bg-white/10 text-[var(--brow-accent)]' : 'text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)]'}`}
            title="Tab Grid View"
         >
            <LayoutGrid size={18} />
         </button>

         <button
            onClick={onToggleGhostMode}
            className={`p-2 rounded-lg transition-all ${isGhostMode ? 'bg-purple-500/20 text-purple-300' : 'text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)]'}`}
            title="Ghost Mode (Incognito)"
         >
            <Ghost size={18} />
         </button>
         
         <button
            onClick={onToggleCopilot}
            className={`p-2 rounded-lg transition-all ${isCopilotOpen ? 'bg-[var(--brow-accent)] text-white shadow-lg' : 'text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)]'}`}
            title="Brow Copilot"
         >
            <MessageSquare size={18} />
         </button>
      </div>
    </div>
  );
};

export default Omnibox;