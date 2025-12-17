import React from 'react';
import { BrowserTab, TabStatus } from '../types';
import { Plus, X, Globe, Cpu } from './ui/Icons';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSwitchTab, onCloseTab, onNewTab }) => {
  return (
    <div className="flex items-center h-10 px-2 space-x-1 select-none overflow-x-auto no-scrollbar w-full">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSwitchTab(tab.id)}
            className={`
              group relative flex items-center min-w-[160px] max-w-[240px] h-8 px-3 rounded-lg cursor-pointer transition-all duration-200 border
              ${isActive 
                ? 'bg-white/10 border-white/20 text-[var(--brow-text)] shadow-lg' 
                : 'bg-transparent border-transparent text-[var(--brow-text-secondary)] hover:bg-white/5 hover:text-[var(--brow-text)]'}
            `}
          >
            {/* Loading Indicator */}
            {tab.status === TabStatus.LOADING && (
              <div className="absolute bottom-0 left-0 h-[2px] bg-[var(--brow-accent)] animate-pulse w-full rounded-b-lg overflow-hidden">
                <div className="h-full bg-white/50 w-1/3 animate-[shimmer_1s_infinite]"></div>
              </div>
            )}

            {/* Icon */}
            <span className="mr-2 opacity-70">
                {tab.url === 'brow://newtab' ? <Cpu size={14} /> : <Globe size={14} />}
            </span>

            {/* Title */}
            <span className="text-xs font-medium truncate flex-1">
              {tab.title || 'New Tab'}
            </span>

            {/* Close Button */}
            <button
              onClick={(e) => onCloseTab(tab.id, e)}
              className={`
                ml-2 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all
                ${isActive ? 'opacity-100' : ''}
              `}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <button
        onClick={onNewTab}
        className="flex items-center justify-center min-w-[32px] h-8 rounded-lg text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)] transition-colors"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default TabBar;