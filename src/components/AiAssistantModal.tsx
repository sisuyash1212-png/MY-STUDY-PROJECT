import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { RAW_CHAPTERS_DATA } from '../data/chapters';
import { api } from '../services/api';
import { X, Sparkles, Send, BookOpen, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AiAssistantModalProps {
  initialChapter?: Chapter | null;
  onClose: () => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  initialChapter,
  onClose,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(initialChapter?.id || 1);
  const [activeTab, setActiveTab] = useState<'briefing' | 'doubt'>('briefing');

  // Briefing state
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [briefingData, setBriefingData] = useState<{
    chapterName: string;
    summary: string;
    keyFormulas: string[];
    examTips: string[];
    highYieldQuestions: string[];
  } | null>(null);

  // Doubt state
  const [doubtText, setDoubtText] = useState('');
  const [loadingDoubt, setLoadingDoubt] = useState(false);
  const [doubtExplanation, setDoubtExplanation] = useState<string | null>(null);

  const fetchBriefing = async (chId: number) => {
    setLoadingBriefing(true);
    try {
      const ch = RAW_CHAPTERS_DATA.find((c) => c.id === chId);
      const res = await api.getChapterBriefing(chId, ch?.name);
      setBriefingData(res);
    } catch (e: any) {
      console.error('Failed to get AI briefing:', e);
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    fetchBriefing(selectedChapterId);
  }, [selectedChapterId]);

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || loadingDoubt) return;

    setLoadingDoubt(true);
    setDoubtExplanation(null);

    try {
      const ch = RAW_CHAPTERS_DATA.find((c) => c.id === selectedChapterId);
      const res = await api.explainDoubt(ch?.name || 'General Science', doubtText.trim());
      setDoubtExplanation(res.explanation);
    } catch (e: any) {
      setDoubtExplanation('Error connecting to AI tutor. Please check your network and try again.');
    } finally {
      setLoadingDoubt(false);
    }
  };

  const selectedChapter = RAW_CHAPTERS_DATA.find((c) => c.id === selectedChapterId) || RAW_CHAPTERS_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-800/80 bg-slate-950 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/70 border border-cyan-700/60 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>AI Science Mission Intelligence</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300">
                  Gemini Flash 3.8
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                High-yield exam synthesis & instant scientific doubt resolution
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Selector & Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-900/80 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-slate-400 flex-shrink-0">Target Chapter:</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 max-w-xs"
            >
              {RAW_CHAPTERS_DATA.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  #{ch.srNo} {ch.name} ({ch.weightagePerYear})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border border-slate-800 p-0.5 rounded-xl bg-slate-900/50">
            <button
              type="button"
              onClick={() => setActiveTab('briefing')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'briefing'
                  ? 'bg-cyan-950 border border-cyan-600 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mission Briefing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doubt')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeTab === 'doubt'
                  ? 'bg-cyan-950 border border-cyan-600 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ask a Doubt
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {activeTab === 'briefing' ? (
            loadingBriefing ? (
              <div className="py-16 text-center space-y-3">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-sm font-mono text-slate-400">
                  Synthesizing exam briefing for #{selectedChapter.srNo} {selectedChapter.name}...
                </p>
              </div>
            ) : briefingData ? (
              <div className="space-y-5">
                {/* Executive Summary */}
                <div className="p-4 rounded-xl border border-cyan-900/60 bg-gradient-to-r from-slate-900/60 to-cyan-950/40">
                  <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Chapter Overview & Weightage Analysis
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{briefingData.summary}</p>
                </div>

                {/* Key Formulas & Equations */}
                {briefingData.keyFormulas && briefingData.keyFormulas.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
                    <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Essential Formulas & Core Scientific Laws
                    </h3>
                    <ul className="space-y-1.5">
                      {briefingData.keyFormulas.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-300">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exam Tips & Mnemonics */}
                {briefingData.examTips && briefingData.examTips.length > 0 && (
                  <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20">
                    <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      Golden Exam Tips & Common Traps
                    </h3>
                    <ul className="space-y-1.5">
                      {briefingData.examTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-sans text-slate-300">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* High Yield Questions */}
                {briefingData.highYieldQuestions && briefingData.highYieldQuestions.length > 0 && (
                  <div className="p-4 rounded-xl border border-purple-900/60 bg-purple-950/20">
                    <h3 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      High-Probability Board Exam Questions
                    </h3>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 font-sans">
                      {briefingData.highYieldQuestions.map((q, i) => (
                        <li key={i} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            /* Ask a Doubt Tab */
            <div className="space-y-5">
              <form onSubmit={handleAskDoubt} className="space-y-3">
                <label className="block text-xs font-mono text-slate-400">
                  Ask any question or explain any concept from #{selectedChapter.srNo} {selectedChapter.name}:
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    placeholder="e.g. Why is the sky blue during the day and red during sunset? Or Explain Fleming's Left Hand Rule with application..."
                    rows={3}
                    className="flex-1 p-3 rounded-xl border border-slate-800 bg-slate-900/70 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={loadingDoubt || !doubtText.trim()}
                    className="self-end px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Explain</span>
                  </button>
                </div>
              </form>

              {loadingDoubt && (
                <div className="p-6 text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-slate-400">Synthesizing scientific explanation...</p>
                </div>
              )}

              {doubtExplanation && (
                <div className="p-5 rounded-2xl border border-cyan-800/60 bg-slate-900/60 space-y-2 animate-in fade-in duration-200">
                  <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Lead Science Officer Explanation:
                  </div>
                  <div className="text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {doubtExplanation}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-900 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold"
          >
            Close Mission Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
