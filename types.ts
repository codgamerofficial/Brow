export enum TabStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum ViewMode {
  BROWSER = 'BROWSER',
  GRID = 'GRID'
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface PageContent {
  type: 'NEW_TAB' | 'SEARCH_RESULT' | 'DEEP_DIVE' | 'ERROR';
  query?: string;
  summary?: string; // The AI generated answer
  groundingLinks?: GroundingChunk[]; // The sources
  relatedTopics?: string[]; // Suggested follow-ups
  error?: string;
  timestamp: number;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string; // The visual URL or Query
  status: TabStatus;
  history: PageContent[];
  historyIndex: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string; // Main app background
    surface: string;    // Secondary backgrounds (cards, bars)
    accent: string;     // Interactive elements
    text: string;       // Primary text
    textSecondary: string; // Secondary text
  };
}

export type WidgetType = 'SEARCH' | 'SHORTCUTS' | 'WEATHER' | 'NEWS';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  enabled: boolean;
}

export interface ThemeConfig {
  accentColor: string;
  glassOpacity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}