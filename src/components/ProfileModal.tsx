import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker, AvatarIcon } from './AvatarPicker';
import { getLevelProgress } from '../utils/xp';
import { X, Award, Flame, LogOut, Check, Save, Sparkles, BookOpen } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout, playSound } = useAuth();
  if (!isOpen || !user) return null;

  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [avatar, setAvatar] = useState(user.avatar || 'astronaut-cyan');
  const [bio, setBio] = useState(user.bio || '');
  const [targetExamYear, setTargetExamYear] = useState(user.targetExamYear || '2026');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const progress = getLevelProgress(user.xp);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatar,
        bio: bio.trim(),
        targetExamYear,
      });
      setSavedSuccess(true);
      playSound('complete');
      setTimeout(() => setSavedSuccess(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] rounded-2xl border border-cyan-800/80 bg-slate-950 shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AvatarIcon avatarId={avatar} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user.displayName || user.username}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-300">
                  LV {user.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">@{user.username} • {user.rankTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs font-mono">
          {/* XP & Telemetry Status Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-cyan-400" />
                XP Level Progress
              </span>
              <span className="text-cyan-300 font-bold">
                {user.xp} XP <span className="text-slate-500 font-normal">/ {progress.nextLevelXp} XP</span>
              </span>
            </div>

            <div className="relative w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                <div className="text-sm font-bold text-emerald-400">{user.completedChaptersCount}</div>
                <div className="text-[10px] text-slate-400">Chapters Done</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {user.streakDays}d
                </div>
                <div className="text-[10px] text-slate-400">Streak</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-900">
                <div className="text-sm font-bold text-purple-400">{user.revisionsCount}</div>
                <div className="text-[10px] text-slate-400">Revisions</div>
              </div>
            </div>
          </div>

          {/* Avatar selection */}
          <div>
            <label className="block text-slate-400 mb-2 font-bold">Choose Mission Avatar</label>
            <AvatarPicker selectedId={avatar} onSelect={setAvatar} />
          </div>

          {/* Display Name & Target Exam Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Target Exam Year</label>
              <select
                value={targetExamYear}
                onChange={(e) => setTargetExamYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="2026">2026 Board Exam</option>
                <option value="2027">2027 Board Exam</option>
                <option value="Scholarship">Science Olympiad / NTSE</option>
              </select>
            </div>
          </div>

          {/* Bio / Study Goals */}
          <div>
            <label className="block text-slate-400 mb-1">Squad Bio & Study Goal</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Aiming for 95+ in Science. Focusing on High Weightage Chapters & Physics Numerical derivation."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Achievements / Badges */}
          <div>
            <label className="block text-slate-400 mb-2 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Mission Badges Earned
            </label>
            <div className="flex flex-wrap gap-2">
              {(user.badges || ['Science Cadet']).map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 rounded-lg border border-cyan-800/60 bg-cyan-950/40 text-cyan-300 text-xs flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-cyan-400" />
                  <span>{badge}</span>
                </span>
              ))}
              {user.completedChaptersCount >= 5 && (
                <span className="px-2.5 py-1 rounded-lg border border-purple-800/60 bg-purple-950/40 text-purple-300 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-purple-400" />
                  <span>Chapter Pioneer</span>
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-900">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-rose-400 hover:bg-rose-950/30 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Updating...' : savedSuccess ? 'Updated!' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
