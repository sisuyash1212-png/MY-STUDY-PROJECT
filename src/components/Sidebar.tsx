import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Trophy,
  Target,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'chapters' | 'notes' | 'squads' | 'leaderboard' | 'quizzes' | 'ai-lab';

interface SidebarProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  notesCount?: number;
  roomsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onChangeTab,
  notesCount = 0,
  roomsCount = 0,
}) => {
  const { playSound } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string | number; accent: string }[] = [
    { id: 'dashboard', label: 'Mission HQ', icon: LayoutDashboard, accent: 'cyan' },
    { id: 'chapters', label: '40 Chapters', icon: BookOpen, badge: '40', accent: 'blue' },
    { id: 'notes', label: "Friends' Notes", icon: FileText, badge: notesCount > 0 ? notesCount : undefined, accent: 'emerald' },
    { id: 'squads', label: 'Squad Rooms & Chat', icon: Users, badge: roomsCount > 0 ? roomsCount : undefined, accent: 'purple' },
    { id: 'quizzes', label: 'Quizzes & Missions', icon: Target, accent: 'amber' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, accent: 'yellow' },
    { id: 'ai-lab', label: 'AI Science Lab', icon: Sparkles, badge: 'AI', accent: 'rose' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-900 bg-slate-950/90 min-h-[calc(100vh-57px)] p-3 space-y-6">
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono font-semibold tracking-wider uppercase text-slate-500">
            Navigation Deck
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onChangeTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 border border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Squad Status Mini-Box */}
        <div className="mt-auto p-3.5 rounded-xl border border-cyan-950/60 bg-gradient-to-b from-slate-900/40 to-cyan-950/20 text-xs">
          <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-semibold font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY LINK
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Real-time squad sync active. Notes, rooms, chat, and XP update automatically.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-900 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playSound('click');
                onChangeTab(item.id);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-all relative ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                {item.id === 'dashboard'
                  ? 'HQ'
                  : item.id === 'chapters'
                  ? 'Chapters'
                  : item.id === 'notes'
                  ? 'Notes'
                  : item.id === 'squads'
                  ? 'Squad'
                  : item.id === 'quizzes'
                  ? 'Quiz'
                  : item.id === 'leaderboard'
                  ? 'Ranks'
                  : 'AI'}
              </span>
              {isActive && (
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
