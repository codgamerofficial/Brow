import React from 'react';
import { BrowserTab, TabStatus } from '../types';
import { X, Globe, Cpu, Plus, FileText, Search, Zap } from './ui/Icons';

interface TabGridProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

const TabGrid: React.FC<TabGridProps> = ({ tabs, activeTabId, onSwitchTab, onCloseTab, onNewTab }) => {
  return (
    <div className="w-full h-full p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const currentContent = tab.history[tab.historyIndex];
          
          return (
            <div
              key={tab.id}
              onClick={() => onSwitchTab(tab.id)}
              className={`
                group relative aspect-[4/3] rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-300
                border hover:-translate-y-2 hover:shadow-2xl
                ${isActive 
                  ? 'bg-[var(--brow-accent)] text-white border-transparent ring-2 ring-white/50' 
                  : 'bg-[var(--brow-surface)] border-white/10 hover:border-[var(--brow-accent)]'}
              `}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-full ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                   {tab.url === 'brow://newtab' ? <Cpu size={16} /> : <Globe size={16} />}
                </div>
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className={`p-1.5 rounded-full hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Card Content Preview */}
              <div className="flex-1 mt-4 overflow-hidden">
                <h3 className={`font-bold text-lg leading-tight line-clamp-2 ${isActive ? 'text-white' : 'text-[var(--brow-text)]'}`}>
                    {tab.title}
                </h3>
                <p className={`text-xs mt-2 line-clamp-3 ${isActive ? 'text-blue-100' : 'text-[var(--brow-text-secondary)]'}`}>
                    {currentContent.summary 
                        ? currentContent.summary.substring(0, 100).replace(/[#*]/g, '') 
                        : (tab.url === 'brow://newtab' ? 'Start browsing...' : 'Loading content...')}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                 {currentContent.type === 'DEEP_DIVE' && (
                     <span className="text-[10px] px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded-full border border-purple-500/30">Deep Dive</span>
                 )}
                 <span className={`text-[10px] truncate ${isActive ? 'text-blue-200' : 'text-[var(--brow-text-secondary)]'}`}>
                    {tab.url}
                 </span>
              </div>
            </div>
          );
        })}

        {/* New Tab Card */}
        <button
          onClick={onNewTab}
          className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-[var(--brow-text-secondary)] hover:text-[var(--brow-accent)] hover:border-[var(--brow-accent)] hover:bg-[var(--brow-accent)]/5 transition-all duration-300 group"
        >
            <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-[var(--brow-accent)]/20 flex items-center justify-center transition-colors">
                <Plus size={32} />
            </div>
            <span className="font-medium">Open New Tab</span>
        </button>
      </div>
    </div>
  );
};

export default TabGrid;