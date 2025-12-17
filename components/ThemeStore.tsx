import React from 'react';
import { Theme } from '../types';
import { Palette, CheckCircle, X } from './ui/Icons';

interface ThemeStoreProps {
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AVAILABLE_THEMES: Theme[] = [
  {
    id: 'default-dark',
    name: 'Slate Dark',
    colors: {
      background: '#020617', // slate-950
      surface: '#1e293b',    // slate-800
      accent: '#6366f1',     // indigo-500
      text: '#f1f5f9',       // slate-100
      textSecondary: '#94a3b8' // slate-400
    }
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    colors: {
      background: '#0b1021',
      surface: '#151b2e',
      accent: '#3b82f6',     // blue-500
      text: '#e2e8f0',
      textSecondary: '#64748b'
    }
  },
  {
    id: 'forest-depths',
    name: 'Forest Depths',
    colors: {
      background: '#052e16', // emerald-950
      surface: '#064e3b',    // emerald-900
      accent: '#34d399',     // emerald-400
      text: '#ecfdf5',
      textSecondary: '#6ee7b7'
    }
  },
  {
    id: 'sunset-vibes',
    name: 'Sunset Vibes',
    colors: {
      background: '#2a0a18',
      surface: '#4c1d2e',
      accent: '#fb7185',     // rose-400
      text: '#fff1f2',
      textSecondary: '#fda4af'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      background: '#000000',
      surface: '#18181b',
      accent: '#e879f9',     // fuchsia-400
      text: '#ffffff',
      textSecondary: '#a1a1aa'
    }
  }
];

const ThemeStore: React.FC<ThemeStoreProps> = ({ currentTheme, onSelectTheme, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
      <div className="w-full max-w-2xl bg-[var(--brow-surface)] rounded-2xl border border-white/10 shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[var(--brow-text-secondary)] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--brow-accent)] flex items-center justify-center text-white">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--brow-text)]">Theme Store</h2>
            <p className="text-sm text-[var(--brow-text-secondary)]">Customize your browsing experience</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {AVAILABLE_THEMES.map((theme) => {
            const isActive = currentTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`
                  relative flex items-center p-4 rounded-xl border transition-all duration-300 group
                  ${isActive 
                    ? 'border-[var(--brow-accent)] bg-white/5 ring-1 ring-[var(--brow-accent)]' 
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
                `}
              >
                {/* Theme Preview Swatch */}
                <div 
                  className="w-16 h-16 rounded-lg shadow-lg mr-4 border border-white/10 shrink-0"
                  style={{ background: theme.colors.background }}
                >
                  <div className="w-full h-1/2 bg-white/10 rounded-t-lg"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full" style={{ background: theme.colors.accent }}></div>
                </div>

                <div className="text-left flex-1">
                  <h3 className="font-bold text-[var(--brow-text)]">{theme.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.background }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.surface }}></div>
                    <div className="w-4 h-4 rounded-full" style={{ background: theme.colors.accent }}></div>
                  </div>
                </div>

                {isActive && (
                  <div className="absolute top-3 right-3 text-[var(--brow-accent)]">
                    <CheckCircle size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeStore;