import React from 'react';
import { LeaderboardEntry } from '../types';
import { AvatarIcon } from '../components/AvatarPicker';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Flame, BookOpen, Award, Crown } from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard }) => {
  const { user } = useAuth();

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" />
          Science Mission HQ — Live Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
          Real-time global & squad rankings based on verified chapter completions, revision streaks, and quiz drills.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="sm:order-1 p-5 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900/60 to-slate-950/80 text-center space-y-3 relative overflow-hidden shadow-lg">
              <div className="w-10 h-10 rounded-full bg-slate-700/80 border border-slate-500 text-slate-200 flex items-center justify-center font-extrabold font-mono text-sm mx-auto shadow-md">
                2
              </div>
              <AvatarIcon avatarId={top3[1].avatar} size="lg" className="mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white truncate">{top3[1].displayName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">@{top3[1].username}</p>
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mt-1">
                  LV {top3[1].level} • {top3[1].rankTitle}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs font-mono font-bold text-amber-300">
                {top3[1].xp} XP
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top3[0] && (
            <div className="sm:order-2 p-6 rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-950 text-center space-y-3 relative overflow-hidden shadow-2xl shadow-amber-500/10 sm:-translate-y-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black font-mono text-base mx-auto shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6 fill-slate-950" />
              </div>
              <AvatarIcon avatarId={top3[0].avatar} size="xl" className="mx-auto ring-4 ring-amber-500/30" />
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 border border-amber-600 text-amber-300 mb-1">
                  CHAMPION
                </span>
                <h3 className="text-base font-bold text-white truncate">{top3[0].displayName}</h3>
                <p className="text-xs text-slate-400 font-mono">@{top3[0].username}</p>
                <div className="text-xs font-mono text-amber-400 font-semibold mt-1">
                  LV {top3[0].level} • {top3[0].rankTitle}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-sm font-mono font-extrabold text-amber-400">
                {top3[0].xp} XP
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="sm:order-3 p-5 rounded-2xl border border-amber-900/60 bg-gradient-to-b from-amber-950/20 to-slate-950/80 text-center space-y-3 relative overflow-hidden shadow-lg">
              <div className="w-10 h-10 rounded-full bg-amber-900/80 border border-amber-700 text-amber-300 flex items-center justify-center font-extrabold font-mono text-sm mx-auto shadow-md">
                3
              </div>
              <AvatarIcon avatarId={top3[2].avatar} size="lg" className="mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-white truncate">{top3[2].displayName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">@{top3[2].username}</p>
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mt-1">
                  LV {top3[2].level} • {top3[2].rankTitle}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs font-mono font-bold text-amber-300">
                {top3[2].xp} XP
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Rankings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-900 bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            All Mission Cadets & Squad Leaderboard
          </span>
          <span className="text-xs font-mono text-cyan-400">Total: {leaderboard.length} Cadets</span>
        </div>

        <div className="divide-y divide-slate-900/80">
          {leaderboard.map((entry, index) => {
            const isMe = user && entry.id === user.id;

            return (
              <div
                key={entry.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                  isMe
                    ? 'bg-cyan-950/30 border-l-4 border-l-cyan-400'
                    : 'hover:bg-slate-900/40'
                }`}
              >
                {/* Rank & User details */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm ${
                      index === 0
                        ? 'bg-amber-500 text-slate-950'
                        : index === 1
                        ? 'bg-slate-400 text-slate-950'
                        : index === 2
                        ? 'bg-amber-800 text-amber-100'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <AvatarIcon avatarId={entry.avatar} size="sm" />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-100">
                        {entry.displayName || entry.username}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-900 text-cyan-300 border border-cyan-600">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs font-mono text-slate-400 flex items-center gap-2">
                      <span>@{entry.username}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{entry.rankTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Level, Chapters Done & XP */}
                <div className="flex items-center gap-4 sm:gap-6 text-right font-mono">
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-emerald-400">
                      {entry.completedChaptersCount || 0}
                    </div>
                    <div className="text-[10px] text-slate-500">Chapters</div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {entry.streakDays || 1}d
                    </div>
                    <div className="text-[10px] text-slate-500">Streak</div>
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-amber-300">
                      {entry.xp} XP
                    </div>
                    <div className="text-[10px] text-cyan-400 font-semibold">LV {entry.level}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
