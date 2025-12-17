import React, { useState } from 'react';
import { Cpu, LayoutGrid, Zap, History, Globe, Settings, Sun, Cloud, Trash2, Plus } from './ui/Icons';
import { DashboardWidget, WidgetType } from '../types';

interface NewTabPageProps {
  onNavigate: (query: string) => void;
  widgets: DashboardWidget[];
  onToggleWidget: (id: string) => void;
}

const QuickLink = ({ icon, title, url, onClick }: { icon: React.ReactNode, title: string, url: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--brow-accent)] hover:-translate-y-1 transition-all duration-300 group"
  >
    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-[var(--brow-text-secondary)] group-hover:text-[var(--brow-accent)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
      {icon}
    </div>
    <span className="text-xs font-medium text-[var(--brow-text)]">{title}</span>
  </button>
);

const WeatherWidget = () => (
  <div className="w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-6 flex items-center justify-between backdrop-blur-md">
    <div>
      <div className="text-3xl font-bold text-white mb-1">72°F</div>
      <div className="text-sm text-blue-200">San Francisco, CA</div>
    </div>
    <div className="text-yellow-300">
      <Sun size={40} />
    </div>
  </div>
);

const NewsWidget = ({ onNavigate }: { onNavigate: (q: string) => void }) => (
  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
    <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[var(--brow-text)]">Top Stories</h3>
        <span className="text-[10px] bg-[var(--brow-accent)] text-white px-2 py-1 rounded-full">LIVE</span>
    </div>
    <div className="space-y-3">
        {[
            "AI Breakthroughs in 2025",
            "Global Markets hit record highs",
            "New Space Station module launches"
        ].map((headline, i) => (
            <div 
                key={i} 
                onClick={() => onNavigate(headline)}
                className="text-sm text-[var(--brow-text-secondary)] hover:text-[var(--brow-accent)] cursor-pointer truncate border-b border-white/5 pb-2 last:border-0"
            >
                {headline}
            </div>
        ))}
    </div>
  </div>
);

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate, widgets, onToggleWidget }) => {
  const [isEditing, setIsEditing] = useState(false);

  const getWidget = (type: WidgetType) => widgets.find(w => w.type === type);
  const isEnabled = (type: WidgetType) => getWidget(type)?.enabled;

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-140px)] p-6 fade-in relative">
      
      {/* Customize Button */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="absolute top-0 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--brow-text-secondary)] text-xs border border-white/10 transition-colors"
      >
        <Settings size={14} />
        {isEditing ? 'Done' : 'Customize Dashboard'}
      </button>

      {/* Edit Mode Panel */}
      {isEditing && (
        <div className="absolute top-10 right-6 w-64 bg-[var(--brow-surface)] border border-white/10 rounded-xl p-4 shadow-2xl z-20 animate-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-[var(--brow-text)] mb-3">Manage Widgets</h3>
            <div className="space-y-2">
                {widgets.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <span className="text-sm text-[var(--brow-text-secondary)] capitalize">{w.type.toLowerCase()}</span>
                        <button 
                            onClick={() => onToggleWidget(w.id)}
                            className={`p-1.5 rounded-md transition-colors ${w.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                            {w.enabled ? <Trash2 size={14} /> : <Plus size={14} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Main Content Centered */}
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mt-12 md:mt-20">
        
        {/* Brand */}
        {isEnabled('SEARCH') && (
            <div className="mb-12 text-center">
                <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-[var(--brow-accent)] blur-[40px] opacity-20 rounded-full"></div>
                <Cpu size={80} className="text-[var(--brow-text)] relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-[var(--brow-text)] tracking-tight">
                Brow
                </h1>
                <p className="mt-2 text-[var(--brow-text-secondary)] text-sm md:text-base tracking-wide">
                The Generative Web Experience
                </p>
            </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weather */}
            {isEnabled('WEATHER') && (
                <div className="md:col-span-1">
                    <WeatherWidget />
                </div>
            )}

             {/* News */}
             {isEnabled('NEWS') && (
                <div className="md:col-span-1">
                    <NewsWidget onNavigate={onNavigate} />
                </div>
            )}
        </div>

        {/* Quick Links */}
        {isEnabled('SHORTCUTS') && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-8">
                <QuickLink 
                icon={<Globe size={24} />} 
                title="Tech News" 
                url="Latest technology news" 
                onClick={() => onNavigate("Latest technology news")} 
                />
                <QuickLink 
                icon={<Zap size={24} />} 
                title="Trending" 
                url="What is trending worldwide today?" 
                onClick={() => onNavigate("What is trending worldwide today?")} 
                />
                <QuickLink 
                icon={<LayoutGrid size={24} />} 
                title="Design" 
                url="Modern UI/UX design trends 2025" 
                onClick={() => onNavigate("Modern UI/UX design trends 2025")} 
                />
                <QuickLink 
                icon={<History size={24} />} 
                title="Recents" 
                url="History" 
                onClick={() => {}} 
                />
            </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-6 text-[var(--brow-text-secondary)] text-xs flex gap-6">
        <span>Powered by Gemini 2.5</span>
        <span>&copy; 2025 Brow Inc.</span>
        <span>v2.0.0-custom</span>
      </div>
    </div>
  );
};

export default NewTabPage;