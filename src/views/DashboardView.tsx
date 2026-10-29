import React from 'react';
import { Chapter, StudyNote, StudyRoom } from '../types';
import { calculateChapterMetrics, getLevelProgress } from '../utils/xp';
import { useAuth } from '../context/AuthContext';
import { AvatarIcon } from './../components/AvatarPicker';
import {
  Rocket,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Flame,
  Users,
  Target,
  Zap,
} from 'lucide-react';

interface DashboardViewProps {
  chapters: Chapter[];
  notes: StudyNote[];
  rooms: StudyRoom[];
  onNavigateTab: (tab: any) => void;
  onOpenChapterDetails: (chapter: Chapter) => void;
  onOpenAiBriefing: (chapter: Chapter) => void;
  onOpenNoteReader: (note: StudyNote) => void;
  onOpenCreateNote: () => void;
  onSelectRoom: (room: StudyRoom) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  chapters,
  notes,
  rooms,
  onNavigateTab,
  onOpenChapterDetails,
  onOpenAiBriefing,
  onOpenNoteReader,
  onOpenCreateNote,
  onSelectRoom,
}) => {
  const { user } = useAuth();
  const metrics = calculateChapterMetrics(chapters);
  const xp = user?.xp || 0;
  const progress = getLevelProgress(xp);

  // Highest weightage chapters that are still incomplete
  const priorityChapters = chapters
    .filter((c) => (c.weightagePerYear.includes('4–5') || c.weightagePerYear.includes('10')) && c.status !== 'completed')
    .slice(0, 4);

  const revisionDueChapters = chapters.filter((c) => c.revisionStatus).slice(0, 3);
  const recentSharedNotes = notes.filter((n) => !n.isDraft && n.visibility !== 'personal').slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Mission Control Banner */}
      <div className="relative rounded-3xl border border-cyan-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-700/80 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              ORBITAL EXAM PREPARATION PROTOCOL
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Science Mission Control <span className="text-cyan-400">HQ</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Target all 40 Science chapters with squad notes, revision trackers, real-time study rooms, and verified XP leaderboards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('chapters')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open 40-Chapter Matrix</span>
              </button>

              <button
                type="button"
                onClick={onOpenCreateNote}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600/80 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold text-xs sm:text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>+ Share Notes with Squad</span>
              </button>
            </div>
          </div>

          {/* HUD Progress Dial */}
          <div className="flex-shrink-0 flex items-center justify-center p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-cyan-400 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - metrics.completionPercent / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{metrics.completionPercent}%</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">Syllabus</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400">
                <span className="text-emerald-400 font-bold">{metrics.completed}</span> / {metrics.total} Chapters Done
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 7 Metrics HUD Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Chapters</div>
          <div className="text-2xl font-extrabold text-white mt-1">40</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Official Syllabus</div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-900/60 bg-emerald-950/20">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Completed</div>
          <div className="text-2xl font-extrabold text-emerald-300 mt-1">{metrics.completed}</div>
          <div className="text-[10px] text-emerald-500 font-mono mt-0.5">+{metrics.completed * 50} XP Gained</div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20">
          <div className="text-[11px] font-mono text-amber-400 uppercase">In Progress</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1">{metrics.inProgress}</div>
          <div className="text-[10px] text-amber-500 font-mono mt-0.5">Active studying</div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Remaining</div>
          <div className="text-2xl font-extrabold text-slate-200 mt-1">{metrics.remaining}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">To master</div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/20">
          <div className="text-[11px] font-mono text-rose-400 uppercase">High Weightage Left</div>
          <div className="text-2xl font-extrabold text-rose-300 mt-1">{metrics.highWeightageRemaining}</div>
          <div className="text-[10px] text-rose-500 font-mono mt-0.5">4-5 & 10 Qs Chapters</div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-800/60 bg-amber-950/30">
          <div className="text-[11px] font-mono text-amber-300 uppercase">Revision Due</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{metrics.revisionDueCount}</div>
          <div className="text-[10px] text-amber-500 font-mono mt-0.5">Flagged for review</div>
        </div>

        <div className="p-3.5 rounded-xl border border-cyan-900/60 bg-cyan-950/20 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-mono text-cyan-400 uppercase">Mastery Index</div>
          <div className="text-2xl font-extrabold text-cyan-300 mt-1">{metrics.completionPercent}%</div>
          <div className="text-[10px] text-cyan-500 font-mono mt-0.5">Target: 100%</div>
        </div>
      </div>

      {/* Main Grid: Priority High Weightage + Shared Notes Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Weightage Chapters Recon */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Priority High-Weightage Chapters
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('chapters')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All 40</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {priorityChapters.map((ch) => (
              <div
                key={ch.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/60 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      CH #{ch.srNo}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-700 bg-amber-950 text-amber-300">
                      {ch.weightagePerYear}
                    </span>
                  </div>
                  <h3
                    onClick={() => onOpenChapterDetails(ch)}
                    className="text-sm font-bold text-slate-100 hover:text-cyan-300 cursor-pointer"
                  >
                    {ch.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    {ch.sourceBoard} • {ch.totalQuestions} Questions in Bank
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenAiBriefing(ch)}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:underline font-mono"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Briefing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenChapterDetails(ch)}
                    className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono"
                  >
                    Details & Notes
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Revision Due Strip */}
          {revisionDueChapters.length > 0 && (
            <div className="p-4 rounded-2xl border border-amber-900/60 bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  REVISION DUE RADAR ({revisionDueChapters.length})
                </span>
                <span className="text-[10px] font-mono text-amber-400">Review to maintain 100% recall</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {revisionDueChapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => onOpenChapterDetails(ch)}
                    className="px-3 py-1.5 rounded-xl border border-amber-800/80 bg-amber-950/60 hover:bg-amber-900/60 text-amber-200 text-xs font-mono flex items-center gap-1.5"
                  >
                    <span>#{ch.srNo} {ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Active Squad Rooms & Recent Shared Notes */}
        <div className="space-y-6">
          {/* Active Squad Rooms Widget */}
          <div className="p-5 rounded-2xl border border-purple-900/60 bg-slate-950/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-mono">Active Study Squads</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('squads')}
                className="text-xs font-mono text-purple-400 hover:underline"
              >
                Join / Create
              </button>
            </div>

            <div className="space-y-2">
              {rooms.slice(0, 2).map((room) => (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-purple-600/60 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{room.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                      {room.members?.length || 1} online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{room.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Friends' Shared Notes Quick Feed */}
          <div className="p-5 rounded-2xl border border-emerald-900/60 bg-slate-950/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono">Friends' Notes Stream</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('notes')}
                className="text-xs font-mono text-emerald-400 hover:underline"
              >
                View Library
              </button>
            </div>

            <div className="space-y-2.5">
              {recentSharedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onOpenNoteReader(note)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-600/60 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-200 truncate">{note.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 flex-shrink-0">
                      CH #{note.chapterId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <AvatarIcon avatarId={note.authorAvatar} size="sm" />
                    <span>{note.authorName}</span>
                    <span>•</span>
                    <span>{note.likes?.length || 0} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
