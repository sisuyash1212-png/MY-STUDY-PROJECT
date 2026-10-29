import React, { useState, useMemo } from 'react';
import { Chapter, ChapterStatus } from '../types';
import { ChapterCard } from '../components/ChapterCard';
import { calculateChapterMetrics } from '../utils/xp';
import { parseWeightageScore } from '../data/chapters';
import { Search, Filter, ArrowUpDown, BookOpen, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

interface ChaptersViewProps {
  chapters: Chapter[];
  onUpdateStatus: (chapterId: number, status: ChapterStatus) => void;
  onToggleRevision: (chapterId: number, current: boolean) => void;
  onOpenDetails: (chapter: Chapter) => void;
  onOpenAiBriefing: (chapter: Chapter) => void;
  onTakeQuiz: (chapter: Chapter) => void;
}

type FilterOption = 'all' | 'highest-weightage' | 'ncert' | 'state-board' | 'common' | 'completed' | 'incomplete' | 'needs-revision';
type SortOption = 'srNo' | 'weightage' | 'questions';

export const ChaptersView: React.FC<ChaptersViewProps> = ({
  chapters,
  onUpdateStatus,
  onToggleRevision,
  onOpenDetails,
  onOpenAiBriefing,
  onTakeQuiz,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('srNo');

  const metrics = calculateChapterMetrics(chapters);

  const filteredChapters = useMemo(() => {
    let result = [...chapters];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.sourceBoard.toLowerCase().includes(q) ||
          ch.srNo.toString() === q
      );
    }

    // Category / Board filter
    switch (activeFilter) {
      case 'highest-weightage':
        result = result.filter(
          (c) =>
            c.weightagePerYear.includes('4–5') ||
            c.weightagePerYear.includes('4-5') ||
            c.weightagePerYear.includes('10')
        );
        break;
      case 'ncert':
        result = result.filter((c) => c.sourceBoard.includes('NCERT'));
        break;
      case 'state-board':
        result = result.filter((c) => c.sourceBoard.includes('State Board'));
        break;
      case 'common':
        result = result.filter((c) => c.sourceBoard.includes('Common'));
        break;
      case 'completed':
        result = result.filter((c) => c.status === 'completed');
        break;
      case 'incomplete':
        result = result.filter((c) => c.status !== 'completed');
        break;
      case 'needs-revision':
        result = result.filter((c) => c.revisionStatus);
        break;
      default:
        break;
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'weightage') {
        const scoreA = parseWeightageScore(a.weightagePerYear);
        const scoreB = parseWeightageScore(b.weightagePerYear);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.totalQuestions - a.totalQuestions;
      }
      if (sortBy === 'questions') {
        return b.totalQuestions - a.totalQuestions;
      }
      // default: srNo
      return a.srNo - b.srNo;
    });

    return result;
  }, [chapters, searchQuery, activeFilter, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Chapter Dashboard Telemetry */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              Science Chapter Library — All 40 Chapters
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
              Historical weightage analysis, multi-board alignment, and persistent account-level mastery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl border border-cyan-800 bg-cyan-950/60 text-cyan-300">
              Showing <strong className="text-white">{filteredChapters.length}</strong> of 40 Chapters
            </span>
          </div>
        </div>

        {/* Top 7 Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 p-3 rounded-2xl border border-slate-900 bg-slate-950/60">
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Total</div>
            <div className="text-lg font-extrabold text-white">40</div>
          </div>
          <div className="p-2.5 rounded-xl border border-emerald-900/60 bg-emerald-950/30 text-center">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Completed</div>
            <div className="text-lg font-extrabold text-emerald-300">{metrics.completed}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-amber-900/60 bg-amber-950/30 text-center">
            <div className="text-[10px] font-mono text-amber-400 uppercase">In Progress</div>
            <div className="text-lg font-extrabold text-amber-300">{metrics.inProgress}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Remaining</div>
            <div className="text-lg font-extrabold text-slate-200">{metrics.remaining}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-cyan-900/60 bg-cyan-950/30 text-center">
            <div className="text-[10px] font-mono text-cyan-400 uppercase">Completion</div>
            <div className="text-lg font-extrabold text-cyan-300">{metrics.completionPercent}%</div>
          </div>
          <div className="p-2.5 rounded-xl border border-rose-900/60 bg-rose-950/30 text-center">
            <div className="text-[10px] font-mono text-rose-400 uppercase">High Weightage Left</div>
            <div className="text-lg font-extrabold text-rose-300">{metrics.highWeightageRemaining}</div>
          </div>
          <div className="p-2.5 rounded-xl border border-amber-800/60 bg-amber-950/30 text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono text-amber-300 uppercase">Revision Due</div>
            <div className="text-lg font-extrabold text-amber-400">{metrics.revisionDueCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters by title, board, or number (e.g. Acids, Motion, 17)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="srNo">Sr. Number (#1 to #40)</option>
              <option value="weightage">Annual Weightage (High to Low)</option>
              <option value="questions">Question Bank Count (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>

          {[
            { id: 'all', label: 'All Chapters (40)' },
            { id: 'highest-weightage', label: 'Highest Weightage (4-5 & 10 Qs)' },
            { id: 'ncert', label: 'NCERT' },
            { id: 'state-board', label: 'State Board' },
            { id: 'common', label: 'Common' },
            { id: 'completed', label: 'Completed' },
            { id: 'incomplete', label: 'Incomplete' },
            { id: 'needs-revision', label: 'Needs Revision' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as FilterOption)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                activeFilter === f.id
                  ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 font-semibold shadow-sm shadow-cyan-500/20'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Grid */}
      {filteredChapters.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 text-slate-500 font-mono text-sm">
          No chapters matched your search query or selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onUpdateStatus={onUpdateStatus}
              onToggleRevision={onToggleRevision}
              onOpenDetails={onOpenDetails}
              onOpenAiBriefing={onOpenAiBriefing}
              onTakeQuiz={onTakeQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
};
