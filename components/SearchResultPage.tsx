import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PageContent } from '../types';
import { ArrowRight, Globe, Zap, FileText, X, BookOpen, Layers, Share2 } from './ui/Icons';
import { summarizeContent, performDeepResearch } from '../services/geminiService';

interface SearchResultPageProps {
  content: PageContent;
  onNavigate: (query: string) => void;
  onDeepDive?: (query: string) => void;
}

const SearchResultPage: React.FC<SearchResultPageProps> = ({ content, onNavigate, onDeepDive }) => {
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isReaderMode, setIsReaderMode] = useState(false);

  const handleSummarize = async () => {
    setShowSummary(true);
    if (!summaryText && content.summary) {
        setIsSummarizing(true);
        const result = await summarizeContent(content.summary);
        setSummaryText(result);
        setIsSummarizing(false);
    }
  };

  if (content.type === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-rose-400">
        <div className="w-16 h-16 bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
          <Zap size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-[var(--brow-text-secondary)] max-w-md">{content.error}</p>
      </div>
    );
  }

  // Reader Mode View
  if (isReaderMode) {
      return (
          <div className="w-full h-full bg-[var(--brow-bg)] overflow-y-auto animate-in fade-in">
              <div className="fixed top-4 right-8 z-50 flex gap-2">
                  <button 
                    onClick={() => setIsReaderMode(false)}
                    className="p-2 rounded-full bg-[var(--brow-surface)] text-[var(--brow-text)] shadow-lg hover:bg-[var(--brow-accent)] transition-colors"
                  >
                      <X size={20} />
                  </button>
              </div>
              <div className="max-w-2xl mx-auto py-20 px-8">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--brow-text)] mb-8 leading-tight">
                    {content.query}
                  </h1>
                  <article className="prose prose-invert prose-lg prose-p:text-[var(--brow-text-secondary)] prose-headings:text-[var(--brow-text)] max-w-none font-serif leading-loose">
                    <ReactMarkdown>{content.summary || ''}</ReactMarkdown>
                  </article>
              </div>
          </div>
      )
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 fade-in pb-32 relative">
        
        {/* Top Actions Bar */}
        <div className="flex justify-between items-center mb-6">
             <div className="flex gap-2">
                 {content.type === 'DEEP_DIVE' ? (
                     <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-2">
                        <Layers size={12} /> Deep Research Report
                     </span>
                 ) : (
                    <span className="px-3 py-1 rounded-full bg-[var(--brow-accent)]/20 text-[var(--brow-accent)] text-xs font-bold border border-[var(--brow-accent)]/30">
                        Quick Answer
                    </span>
                 )}
             </div>

             <div className="flex gap-2">
                <button 
                    onClick={() => setIsReaderMode(true)}
                    className="p-2 rounded-lg text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)] transition-colors tooltip"
                    title="Reader Mode"
                >
                    <BookOpen size={18} />
                </button>
                <button 
                    className="p-2 rounded-lg text-[var(--brow-text-secondary)] hover:bg-white/10 hover:text-[var(--brow-text)] transition-colors"
                    title="Share"
                >
                    <Share2 size={18} />
                </button>
             </div>
        </div>

        {/* Header Query */}
        <div className="mb-8 pb-6 border-b border-white/10">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brow-text)] leading-tight capitalize">
                {content.query}
            </h1>
        </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main AI Content */}
        <div className="flex-1">
          <article className="prose prose-invert prose-p:text-[var(--brow-text-secondary)] prose-headings:text-[var(--brow-text)] prose-strong:text-[var(--brow-text)] prose-li:text-[var(--brow-text-secondary)] max-w-none">
            <ReactMarkdown>
              {content.summary || ''}
            </ReactMarkdown>
          </article>
          
          {/* Related Topics (Perplexity Style) */}
          {content.relatedTopics && content.relatedTopics.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="text-sm font-bold text-[var(--brow-text)] mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400" /> Related Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {content.relatedTopics.map((topic, i) => (
                          <button
                            key={i}
                            onClick={() => onNavigate(topic)}
                            className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[var(--brow-accent)]/30 transition-all flex justify-between items-center group"
                          >
                              <span className="text-sm text-[var(--brow-text-secondary)] group-hover:text-[var(--brow-text)] line-clamp-1">{topic}</span>
                              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[var(--brow-text-secondary)] group-hover:bg-[var(--brow-accent)] group-hover:text-white">
                                  <ArrowRight size={12} />
                              </div>
                          </button>
                      ))}
                  </div>
              </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-6">
            
            {/* Deep Dive Call To Action */}
            {content.type !== 'DEEP_DIVE' && onDeepDive && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-sm mb-2">
                        <Layers size={16} />
                        Want more detail?
                    </div>
                    <p className="text-xs text-purple-200/70 mb-3">
                        Convert this quick summary into a comprehensive research report.
                    </p>
                    <button 
                        onClick={() => onDeepDive(content.query || '')}
                        className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-lg shadow-purple-900/50"
                    >
                        Deep Dive
                    </button>
                </div>
            )}

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 sticky top-4">
                <h3 className="text-xs font-bold text-[var(--brow-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Globe size={12} /> Sources
                </h3>
                <div className="space-y-3">
                    {content.groundingLinks?.map((chunk, idx) => {
                        if (!chunk.web) return null;
                        return (
                            <a 
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="text-xs text-[var(--brow-accent)] mb-1 truncate opacity-70 group-hover:opacity-100">
                                    {new URL(chunk.web.uri).hostname}
                                </div>
                                <div className="text-sm font-medium text-[var(--brow-text)] line-clamp-2 leading-snug">
                                    {chunk.web.title}
                                </div>
                                <div className="mt-2 flex items-center text-[10px] text-[var(--brow-text-secondary)] group-hover:text-[var(--brow-accent)]">
                                    Visit Source <ArrowRight size={10} className="ml-1" />
                                </div>
                            </a>
                        )
                    })}
                    {(!content.groundingLinks || content.groundingLinks.length === 0) && (
                        <p className="text-sm text-[var(--brow-text-secondary)] italic">No direct sources linked.</p>
                    )}
                </div>
            </div>
            
            <div className="bg-[var(--brow-accent)]/10 rounded-xl p-4 border border-[var(--brow-accent)]/20">
                <button 
                    onClick={handleSummarize}
                    className="flex items-center justify-center w-full gap-2 py-2 rounded-lg bg-[var(--brow-accent)]/20 hover:bg-[var(--brow-accent)]/30 text-[var(--brow-accent)] text-xs font-bold transition-colors"
                >
                    <FileText size={14} /> Summarize into Bullet Points
                </button>
            </div>
        </div>
      </div>

       {/* Summary Modal / Popup */}
       {showSummary && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 fade-in">
                <div className="bg-[var(--brow-surface)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[var(--brow-accent)]">
                            <Zap size={18} />
                            <h3 className="font-bold text-[var(--brow-text)]">AI Summary</h3>
                        </div>
                        <button onClick={() => setShowSummary(false)} className="text-[var(--brow-text-secondary)] hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        {isSummarizing ? (
                            <div className="space-y-3">
                                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
                                <p className="text-xs text-[var(--brow-text-secondary)] mt-4">Analyzing content...</p>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm">
                                <ReactMarkdown>{summaryText}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SearchResultPage;