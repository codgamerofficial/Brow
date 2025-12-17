import React from 'react';
import { PageContent } from '../types';
import { X, Clock, Search, Layers, Cpu, CheckCircle, Ghost } from './ui/Icons';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: PageContent[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, currentIndex, onJumpTo }) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 h-full border-r border-white/10 bg-[var(--brow-surface)]/95 backdrop-blur-xl flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 absolute left-0 top-0 z-50">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-[var(--brow-text)]">
            <Clock size={18} />
            <span className="font-bold text-sm">Tab History</span>
        </div>
        <button onClick={onClose} className="text-[var(--brow-text-secondary)] hover:text-[var(--brow-text)] p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={18} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
         {/* Reverse mapping to show newest first, but we need to keep original index for jumping */}
         {[...history].map((item, index) => ({ item, index })).reverse().map(({ item, index }) => {
             const isCurrent = index === currentIndex;
             return (
                 <button
                    key={`${item.timestamp}-${index}`}
                    onClick={() => onJumpTo(index)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all flex items-start gap-3 group border
                        ${isCurrent 
                            ? 'bg-[var(--brow-accent)]/10 border-[var(--brow-accent)]/20' 
                            : 'bg-transparent border-transparent hover:bg-white/5'}
                    `}
                 >
                    <div className={`mt-0.5 shrink-0 ${isCurrent ? 'text-[var(--brow-accent)]' : 'text-[var(--brow-text-secondary)]'}`}>
                        {item.type === 'NEW_TAB' && <Cpu size={14} />}
                        {item.type === 'SEARCH_RESULT' && <Search size={14} />}
                        {item.type === 'DEEP_DIVE' && <Layers size={14} />}
                        {item.type === 'ERROR' && <Ghost size={14} />}
                    </div>
                    
                    <div className="flex-1 overflow-hidden min-w-0">
                        <div className={`text-sm font-medium truncate ${isCurrent ? 'text-[var(--brow-text)]' : 'text-[var(--brow-text)]/80'}`}>
                            {item.query || 'New Tab'}
                        </div>
                        <div className="text-[10px] text-[var(--brow-text-secondary)] mt-1 flex items-center gap-2">
                           <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           {item.type === 'DEEP_DIVE' && <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-300">REPORT</span>}
                        </div>
                    </div>

                    {isCurrent && <CheckCircle size={14} className="text-[var(--brow-accent)] mt-1 shrink-0" />}
                 </button>
             )
         })}
         
         {history.length === 0 && (
             <div className="p-4 text-center text-sm text-[var(--brow-text-secondary)]">
                 No history for this tab.
             </div>
         )}
      </div>
    </div>
  );
};

export default HistoryPanel;