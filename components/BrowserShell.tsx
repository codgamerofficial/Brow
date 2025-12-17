import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TabBar from './TabBar';
import Omnibox from './Omnibox';
import NewTabPage from './NewTabPage';
import SearchResultPage from './SearchResultPage';
import ThemeStore, { AVAILABLE_THEMES } from './ThemeStore';
import CopilotSidebar from './CopilotSidebar';
import TabGrid from './TabGrid';
import HistoryPanel from './HistoryPanel';
import Background3D from './Background3D';
import { Palette } from './ui/Icons';
import { BrowserTab, PageContent, TabStatus, Theme, DashboardWidget, ViewMode } from '../types';
import { performSmartSearch, performDeepResearch } from '../services/geminiService';

const BrowserShell: React.FC = () => {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<Theme>(AVAILABLE_THEMES[0]);
  const [isThemeStoreOpen, setIsThemeStoreOpen] = useState(false);
  
  // Feature State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<Theme | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.BROWSER);

  // Dashboard State
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([
    { id: 'w1', type: 'SEARCH', enabled: true },
    { id: 'w2', type: 'SHORTCUTS', enabled: true },
    { id: 'w3', type: 'WEATHER', enabled: false },
    { id: 'w4', type: 'NEWS', enabled: false },
  ]);

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'brow://newtab',
      status: TabStatus.IDLE,
      history: [{ type: 'NEW_TAB', timestamp: Date.now() }],
      historyIndex: 0
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const toggleGhostMode = () => {
    if (!isGhostMode) {
        setPreviousTheme(currentTheme);
        setIsGhostMode(true);
        setCurrentTheme({
            id: 'ghost',
            name: 'Ghost Mode',
            colors: {
                background: '#1a1a1a',
                surface: '#2d2d2d',
                accent: '#a855f7', // Purple
                text: '#d4d4d4',
                textSecondary: '#737373'
            }
        });
    } else {
        setIsGhostMode(false);
        if (previousTheme) setCurrentTheme(previousTheme);
    }
  };

  const createTab = () => {
    const newTab: BrowserTab = {
      id: uuidv4(),
      title: 'New Tab',
      url: 'brow://newtab',
      status: TabStatus.IDLE,
      history: [{ type: 'NEW_TAB', timestamp: Date.now() }],
      historyIndex: 0
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setViewMode(ViewMode.BROWSER); // Switch back to browser when creating new tab
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      updateTab(id, { 
        title: 'New Tab', 
        url: 'brow://newtab', 
        status: TabStatus.IDLE, 
        history: [{ type: 'NEW_TAB', timestamp: Date.now() }],
        historyIndex: 0
      });
      return;
    }
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateTab = (id: string, updates: Partial<BrowserTab>) => {
    setTabs(prev => prev.map(tab => tab.id === id ? { ...tab, ...updates } : tab));
  };

  const navigate = async (input: string) => {
    if (!input || input.trim() === '') return;

    setViewMode(ViewMode.BROWSER);
    updateTab(activeTabId, { status: TabStatus.LOADING, url: input, title: input });
    const result = await performSmartSearch(input);

    const newContent: PageContent = {
      type: result.error ? 'ERROR' : 'SEARCH_RESULT',
      query: input,
      summary: result.summary,
      groundingLinks: result.groundingLinks,
      relatedTopics: result.relatedTopics,
      error: result.error,
      timestamp: Date.now()
    };

    setTabs(prev => prev.map(tab => {
        if (tab.id !== activeTabId) return tab;
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(newContent);
        return {
            ...tab,
            url: input,
            title: input,
            status: result.error ? TabStatus.ERROR : TabStatus.COMPLETE,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }));
  };

  const handleDeepDive = async (query: string) => {
    if (!query) return;

    updateTab(activeTabId, { status: TabStatus.LOADING, title: `Researching: ${query}` });
    const result = await performDeepResearch(query);

    const newContent: PageContent = {
        type: 'DEEP_DIVE',
        query: query,
        summary: result.summary,
        groundingLinks: result.groundingLinks,
        relatedTopics: result.relatedTopics,
        error: result.error,
        timestamp: Date.now()
    };

    setTabs(prev => prev.map(tab => {
        if (tab.id !== activeTabId) return tab;
        const newHistory = tab.history.slice(0, tab.historyIndex + 1);
        newHistory.push(newContent);
        return {
            ...tab,
            url: `brow://deep-dive/${encodeURIComponent(query)}`,
            title: `Deep Research: ${query}`,
            status: TabStatus.COMPLETE,
            history: newHistory,
            historyIndex: newHistory.length - 1
        };
    }));
  };

  const handleBack = () => {
      if (activeTab.historyIndex > 0) {
          const newIndex = activeTab.historyIndex - 1;
          const content = activeTab.history[newIndex];
          updateTab(activeTabId, {
              historyIndex: newIndex,
              url: content.query || 'brow://newtab',
              title: content.query || 'New Tab',
              status: TabStatus.COMPLETE
          });
      }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
        const newIndex = activeTab.historyIndex + 1;
        const content = activeTab.history[newIndex];
        updateTab(activeTabId, {
            historyIndex: newIndex,
            url: content.query || 'brow://newtab',
            title: content.query || 'New Tab',
            status: TabStatus.COMPLETE
        });
    }
  };
  
  const handleJumpToHistory = (index: number) => {
      const content = activeTab.history[index];
      updateTab(activeTabId, {
          historyIndex: index,
          url: content.query || 'brow://newtab',
          title: content.query || 'New Tab',
          status: TabStatus.COMPLETE
      });
      // Optionally close history on jump
      // setIsHistoryOpen(false); 
  }

  const handleRefresh = () => {
      if (activeTab.url !== 'brow://newtab' && !activeTab.url.startsWith('brow://')) {
          navigate(activeTab.url);
      }
  };

  const toggleWidget = (id: string) => {
    setDashboardWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const toggleViewMode = () => {
      setViewMode(prev => prev === ViewMode.BROWSER ? ViewMode.GRID : ViewMode.BROWSER);
  };

  const handleSwitchTab = (id: string) => {
      setActiveTabId(id);
      setViewMode(ViewMode.BROWSER);
  }

  const currentContent = activeTab.history[activeTab.historyIndex];

  return (
    // Theme Injection Wrapper
    <div 
      className="flex flex-col h-screen w-full overflow-hidden font-sans transition-colors duration-500 relative"
      style={{
        '--brow-bg': currentTheme.colors.background,
        '--brow-surface': currentTheme.colors.surface,
        '--brow-accent': currentTheme.colors.accent,
        '--brow-text': currentTheme.colors.text,
        '--brow-text-secondary': currentTheme.colors.textSecondary,
        backgroundColor: 'var(--brow-bg)',
        color: 'var(--brow-text)'
      } as React.CSSProperties}
    >
      <ThemeStore 
        isOpen={isThemeStoreOpen} 
        onClose={() => setIsThemeStoreOpen(false)} 
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 3D Background Layer */}
      <Background3D theme={currentTheme} />

      {/* Top Bar Area (Glassmorphism) */}
      <div className={`flex flex-col w-full z-40 backdrop-blur-xl border-b border-white/5 pt-2 pb-2 transition-colors duration-300 ${isGhostMode ? 'bg-black/90' : 'bg-[var(--brow-bg)]/80'}`}>
        
        {/* Tab Strip */}
        <div className="w-full px-2 mb-2 flex items-center">
          <div className="flex-1 overflow-hidden">
            <TabBar 
              tabs={tabs} 
              activeTabId={activeTabId} 
              onSwitchTab={handleSwitchTab} 
              onCloseTab={closeTab}
              onNewTab={createTab}
            />
          </div>
          {/* Theme Button (Disabled in Ghost Mode) */}
          {!isGhostMode && (
            <button 
                onClick={() => setIsThemeStoreOpen(true)}
                className="ml-2 p-2 rounded-lg text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-accent)] transition-colors"
                title="Theme Store"
            >
                <Palette size={18} />
            </button>
          )}
        </div>

        {/* Omnibox */}
        <div className="px-4">
          <Omnibox 
            activeTab={activeTab} 
            onNavigate={navigate}
            onBack={handleBack}
            onForward={handleForward}
            onRefresh={handleRefresh}
            isCopilotOpen={isCopilotOpen}
            onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
            isGhostMode={isGhostMode}
            onToggleGhostMode={toggleGhostMode}
            viewMode={viewMode}
            onToggleViewMode={toggleViewMode}
            isHistoryOpen={isHistoryOpen}
            onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          />
        </div>
      </div>

      {/* Main Viewport & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden relative w-full z-10" id="viewport-container">
          
          {/* History Panel (Left) */}
          <HistoryPanel 
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={activeTab.history}
            currentIndex={activeTab.historyIndex}
            onJumpTo={handleJumpToHistory}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative transition-all duration-300" id="content-area">
            
            {/* Grid View Overlay */}
            {viewMode === ViewMode.GRID && (
                <div className="absolute inset-0 z-30 bg-[var(--brow-bg)]/90 backdrop-blur-md">
                    <TabGrid 
                        tabs={tabs} 
                        activeTabId={activeTabId} 
                        onSwitchTab={handleSwitchTab} 
                        onCloseTab={closeTab}
                        onNewTab={createTab}
                    />
                </div>
            )}

            {/* Browser Content */}
            <div className={`w-full h-full overflow-y-auto scroll-smooth ${viewMode === ViewMode.GRID ? 'hidden' : 'block'}`}>
                {currentContent.type === 'NEW_TAB' && (
                <NewTabPage 
                    onNavigate={navigate} 
                    widgets={dashboardWidgets}
                    onToggleWidget={toggleWidget}
                />
                )}
                
                {(currentContent.type === 'SEARCH_RESULT' || currentContent.type === 'DEEP_DIVE' || currentContent.type === 'ERROR') && (
                <SearchResultPage 
                    content={currentContent} 
                    onNavigate={navigate} 
                    onDeepDive={handleDeepDive}
                />
                )}
            </div>
          </div>

          {/* Right Sidebar (Copilot) */}
          <div className={`${isCopilotOpen ? 'w-80 border-l border-white/5' : 'w-0'} transition-all duration-300 overflow-hidden`}>
               <CopilotSidebar 
                    isOpen={isCopilotOpen} 
                    onClose={() => setIsCopilotOpen(false)} 
                    currentPageContent={currentContent}
                />
          </div>
      </div>
    </div>
  );
};

export default BrowserShell;