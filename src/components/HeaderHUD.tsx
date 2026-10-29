import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getLevelProgress } from '../utils/xp';
import { AvatarIcon } from './AvatarPicker';
import { Volume2, VolumeX, Flame, Zap, Award, User, LogIn, Orbit } from 'lucide-react';

interface HeaderHUDProps {
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  activeRoomName?: string;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onOpenAuth,
  onOpenProfile,
  activeRoomName,
}) => {
  const { user, soundEnabled, toggleSound, playSound } = useAuth();
  const xp = user?.xp || 0;
  const progress = getLevelProgress(xp);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Mission Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/20 via-blue-900/40 to-slate-900 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
            <Orbit className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
            <div className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400">
                SCIENCE MISSION HQ
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
              Orbital Study Command • 40 Chapters Matrix
            </p>
          </div>
        </div>

        {/* Center: XP Progress HUD */}
        {user ? (
          <div className="hidden md:flex flex-col items-center max-w-xs w-full px-4">
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                {user.rankTitle}
              </span>
              <span className="text-slate-400">
                {user.xp} XP <span className="text-slate-600">/</span> {progress.nextLevelXp} XP
              </span>
            </div>

            <div className="relative w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-sm shadow-cyan-400/50 transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Right side controls: Sound, Streak, User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => {
              toggleSound();
              playSound('click');
            }}
            title={soundEnabled ? 'Mute futuristic UI audio' : 'Unmute futuristic UI audio'}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-400 hover:border-cyan-800/60 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Active room indicator */}
          {activeRoomName && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-800/60 bg-purple-950/40 text-purple-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Squad: <span className="font-bold text-purple-200">{activeRoomName}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Streak */}
              <div
                title={`${user.streakDays} Day Study Streak`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border border-amber-900/60 bg-amber-950/30 text-amber-400 text-xs font-mono"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold">{user.streakDays}d</span>
              </div>

              {/* Profile Avatar Trigger */}
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onOpenProfile();
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-cyan-800/60 bg-slate-900/70 hover:border-cyan-500/80 hover:bg-slate-800/80 transition-all text-left group"
              >
                <AvatarIcon avatarId={user.avatar} size="sm" />
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      {user.displayName || user.username}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                      LV {user.level}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/60 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-cyan-500/10 hover:border-cyan-400 transition-all"
            >
              <LogIn className="w-4 h-4 text-cyan-400" />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
