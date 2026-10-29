import React, { useState } from 'react';
import { Chapter, ChapterStatus } from '../types';
import { X, CheckCircle2, RotateCcw, Sparkles, BookOpen, Star, Save, Share2 } from 'lucide-react';

interface ChapterDetailModalProps {
  chapter: Chapter | null;
  onClose: () => void;
  onSaveProgress: (chapterId: number, data: Partial<Chapter>) => Promise<void>;
  onOpenAiBriefing: (chapter: Chapter) => void;
  onOpenCreateNoteForChapter: (chapter: Chapter) => void;
}

export const ChapterDetailModal: React.FC<ChapterDetailModalProps> = ({
  chapter,
  onClose,
  onSaveProgress,
  onOpenAiBriefing,
  onOpenCreateNoteForChapter,
}) => {
  if (!chapter) return null;

  const [notes, setNotes] = useState(chapter.notes || '');
  const [status, setStatus] = useState<ChapterStatus>(chapter.status);
  const [revisionStatus, setRevisionStatus] = useState(chapter.revisionStatus);
  const [confidence, setConfidence] = useState(chapter.confidenceRating || 3);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(chapter.difficultyRating || 'Medium');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveProgress(chapter.id, {
        notes,
        status,
        revisionStatus,
        confidenceRating: confidence,
        difficultyRating: difficulty,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-800/80 bg-slate-950 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-900 bg-slate-900/60 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-cyan-400">
                CHAPTER #{chapter.srNo}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300">
                {chapter.sourceBoard}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800 text-amber-300">
                Weightage: {chapter.weightagePerYear}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {chapter.totalQuestions} Questions Bank
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">{chapter.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Status & Revision Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/40">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Study Status
              </label>
              <div className="flex items-center gap-1.5">
                {(['not-started', 'in-progress', 'completed'] as ChapterStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono capitalize transition-all border ${
                      status === st
                        ? st === 'completed'
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold'
                          : st === 'in-progress'
                          ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-600 text-white font-bold'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {st.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Revision Flag
              </label>
              <button
                type="button"
                onClick={() => setRevisionStatus(!revisionStatus)}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-2 border transition-all ${
                  revisionStatus
                    ? 'bg-amber-950/70 border-amber-600 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{revisionStatus ? 'Marked for Revision' : 'Mark for Revision'}</span>
              </button>
            </div>
          </div>

          {/* Difficulty & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Personal Difficulty Rating</label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === d
                        ? d === 'Easy'
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : d === 'Medium'
                          ? 'bg-blue-950 border-blue-500 text-blue-300'
                          : 'bg-rose-950 border-rose-500 text-rose-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Confidence Level (1-5)</label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= confidence ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Chapter Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Personal Revision Notes
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Private to your account</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down formulas, tricky definitions, questions to revisit, or memory tricks for this chapter..."
              rows={5}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 font-mono"
            />
          </div>

          {/* AI & Squad Quick Actions */}
          <div className="p-3.5 rounded-xl border border-cyan-950/60 bg-gradient-to-r from-slate-900/40 via-cyan-950/30 to-blue-950/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-cyan-300">Need exam preparation assistance?</div>
              <p className="text-[11px] text-slate-400">Launch AI mission briefing or create a squad note for everyone.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiBriefing(chapter);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-700 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-bold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Briefing</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateNoteForChapter(chapter);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-800 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Share in Squad</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between gap-3">
          <span className="text-xs text-emerald-400 font-mono">
            {savedSuccess && '✓ Progress and notes saved!'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-cyan-500 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Chapter Progress'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
