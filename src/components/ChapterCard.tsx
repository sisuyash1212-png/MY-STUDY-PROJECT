import React from 'react';
import { Chapter, ChapterStatus } from '../types';
import { CheckCircle2, Circle, Clock, RotateCcw, Sparkles, BookOpen, Star, HelpCircle } from 'lucide-react';

interface ChapterCardProps {
  chapter: Chapter;
  onUpdateStatus: (chapterId: number, status: ChapterStatus) => void;
  onToggleRevision: (chapterId: number, current: boolean) => void;
  onOpenDetails: (chapter: Chapter) => void;
  onOpenAiBriefing: (chapter: Chapter) => void;
  onTakeQuiz?: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  onUpdateStatus,
  onToggleRevision,
  onOpenDetails,
  onOpenAiBriefing,
  onTakeQuiz,
}) => {
  const isHighWeightage =
    chapter.weightagePerYear.includes('4–5') ||
    chapter.weightagePerYear.includes('4-5') ||
    chapter.weightagePerYear.includes('10');

  const boardColor =
    chapter.sourceBoard.includes('State Board')
      ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300'
      : chapter.sourceBoard.includes('NCERT')
      ? 'border-cyan-800/60 bg-cyan-950/40 text-cyan-300'
      : chapter.sourceBoard.includes('Common')
      ? 'border-blue-800/60 bg-blue-950/40 text-blue-300'
      : 'border-purple-800/60 bg-purple-950/40 text-purple-300';

  const statusBadge = {
    'not-started': {
      label: 'Not Started',
      className: 'border-slate-800 bg-slate-900/60 text-slate-400',
      icon: Circle,
    },
    'in-progress': {
      label: 'In Progress',
      className: 'border-amber-800/60 bg-amber-950/40 text-amber-300',
      icon: Clock,
    },
    'completed': {
      label: 'Completed',
      className: 'border-emerald-800/60 bg-emerald-950/50 text-emerald-300',
      icon: CheckCircle2,
    },
  }[chapter.status];

  const StatusIcon = statusBadge.icon;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between ${
        chapter.status === 'completed'
          ? 'bg-slate-950/70 border-emerald-900/50 shadow-md shadow-emerald-950/20'
          : isHighWeightage
          ? 'bg-slate-950/80 border-cyan-900/60 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/30'
          : 'bg-slate-950/60 border-slate-900 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Top row: Sr. No, Board, Weightage Badge, Revision Pin */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chapter Serial Badge */}
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            CH #{chapter.srNo}
          </span>

          {/* Board Badge */}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${boardColor}`}>
            {chapter.sourceBoard}
          </span>

          {/* Weightage Label */}
          <span
            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
              isHighWeightage
                ? 'border-amber-700/70 bg-amber-950/50 text-amber-300 animate-pulse'
                : 'border-slate-800 bg-slate-900 text-slate-300'
            }`}
          >
            {chapter.weightagePerYear}
          </span>
        </div>

        {/* Revision Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleRevision(chapter.id, chapter.revisionStatus)}
          title={chapter.revisionStatus ? 'Marked for Revision (Click to unmark)' : 'Mark for Revision'}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
            chapter.revisionStatus
              ? 'border-amber-600/80 bg-amber-950/60 text-amber-300 shadow-sm shadow-amber-500/20'
              : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:text-amber-400 hover:border-amber-900'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${chapter.revisionStatus ? 'text-amber-400' : ''}`} />
          <span className="text-[10px] font-mono hidden sm:inline">
            {chapter.revisionStatus ? 'Revision Due' : 'Revise'}
          </span>
        </button>
      </div>

      {/* Chapter Title */}
      <div className="mb-3">
        <h3
          onClick={() => onOpenDetails(chapter)}
          className="text-base sm:text-lg font-bold text-slate-100 hover:text-cyan-300 cursor-pointer transition-colors leading-snug"
        >
          {chapter.name}
        </h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-mono">
          <span>{chapter.totalQuestions} Questions in Bank</span>
          <span>•</span>
          <span className="text-slate-500">Diff: {chapter.difficultyRating || 'Medium'}</span>
        </div>
      </div>

      {/* Progress & Quick Actions */}
      <div className="pt-3 border-t border-slate-900/80 flex flex-col gap-3">
        {/* Status selector */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdateStatus(chapter.id, 'not-started')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                chapter.status === 'not-started'
                  ? 'bg-slate-800 border border-slate-700 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Not Started
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(chapter.id, 'in-progress')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all ${
                chapter.status === 'in-progress'
                  ? 'bg-amber-950/60 border border-amber-700 text-amber-300'
                  : 'text-slate-500 hover:text-amber-300'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(chapter.id, 'completed')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1 ${
                chapter.status === 'completed'
                  ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-300 font-bold'
                  : 'text-slate-500 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Completed (+50 XP)
            </button>
          </div>
        </div>

        {/* Action Buttons: Notes & AI Briefing */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onOpenDetails(chapter)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notes & Resources</span>
            {chapter.notes ? (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Has personal notes" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => onOpenAiBriefing(chapter)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-800/60 bg-gradient-to-r from-cyan-950/50 to-blue-950/50 hover:border-cyan-500/80 text-cyan-300 text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Briefing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
