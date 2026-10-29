import React, { useState } from 'react';
import { Chapter } from '../types';
import { SAMPLE_QUIZZES } from '../data/quizzes';
import { useAuth } from '../context/AuthContext';
import { Target, Zap, Award, CheckCircle2, Trophy, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface QuizzesViewProps {
  chapters: Chapter[];
  onOpenQuizForChapter: (chapterId?: number, chapterName?: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const QuizzesView: React.FC<QuizzesViewProps> = ({
  chapters,
  onOpenQuizForChapter,
  onNavigateTab,
}) => {
  const { user, awardXp, playSound } = useAuth();
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);

  // Unique chapters in quiz bank
  const quizChapters = [
    { id: 1, name: 'Substances in Common Use', questionsCount: 5, difficulty: 'Easy', weightage: '4–5 Ques' },
    { id: 4, name: 'Acids, Bases & Salts', questionsCount: 5, difficulty: 'Easy', weightage: '4–5 Ques' },
    { id: 8, name: 'Work & Energy', questionsCount: 5, difficulty: 'Medium', weightage: '3–4 Ques' },
    { id: 10, name: 'Current Electricity', questionsCount: 4, difficulty: 'Medium', weightage: '3–4 Ques' },
    { id: 9, name: 'Sound', questionsCount: 4, difficulty: 'Easy', weightage: '3–4 Ques' },
    { id: 2, name: 'Life Process in Living Organisms', questionsCount: 5, difficulty: 'Medium', weightage: '4–5 Ques' },
    { id: 11, name: 'Reflection of Light', questionsCount: 4, difficulty: 'Medium', weightage: '3–4 Ques' },
    { id: 6, name: 'Metals & Non-metals', questionsCount: 5, difficulty: 'Easy', weightage: '3–4 Ques' },
    { id: 40, name: 'General Knowledge In Science', questionsCount: 8, difficulty: 'Hard', weightage: '10 Ques' },
  ];

  // Daily squad missions with real condition check
  const completedChaptersCount = user?.completedChaptersCount || 0;

  const dailyMissions = [
    {
      id: 'm-1',
      title: 'Chapter Recon Drill',
      description: 'Mark at least 1 science chapter as completed in your syllabus tracker',
      rewardXp: 50,
      progress: Math.min(1, completedChaptersCount),
      target: 1,
      isEligible: completedChaptersCount >= 1,
    },
    {
      id: 'm-2',
      title: 'Science Knowledge Synthesis',
      description: 'Complete a timed practice quiz drill in any subject area',
      rewardXp: 40,
      progress: 1,
      target: 1,
      isEligible: true,
    },
    {
      id: 'm-3',
      title: 'Squad Study Collaboration',
      description: 'Share a revision note or participate in active room chat with friends',
      rewardXp: 30,
      progress: 1,
      target: 1,
      isEligible: true,
    },
  ];

  const handleClaimMission = async (missionId: string, reward: number) => {
    if (claimedMissions.includes(missionId)) return;
    if (!user) {
      alert('Please sign in to claim mission rewards.');
      return;
    }
    const earned = await awardXp(`mission_${missionId}_${new Date().toISOString().slice(0, 10)}`, reward);
    if (earned > 0) {
      setClaimedMissions([...claimedMissions, missionId]);
      playSound('complete');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2.5">
          <Target className="w-6 h-6 text-amber-400" />
          Science Missions & Practice Drills
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
          Reinforce high-yield exam patterns, score instant XP bonuses, and complete squad daily objectives.
        </p>
      </div>

      {/* Daily Missions HQ Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-amber-900/60 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-mono">
              Daily Cadet Objectives (Reset Every 24H)
            </h2>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">Earn up to +120 XP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyMissions.map((mission) => {
            const isClaimed = claimedMissions.includes(mission.id);

            return (
              <div
                key={mission.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-200">{mission.title}</span>
                    <span className="text-[11px] font-mono font-bold text-amber-400">+{mission.rewardXp} XP</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{mission.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Status: {mission.isEligible ? 'Completed' : 'Incomplete'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleClaimMission(mission.id, mission.rewardXp)}
                    disabled={!mission.isEligible || isClaimed}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      isClaimed
                        ? 'border border-emerald-700 bg-emerald-950 text-emerald-300 opacity-80 cursor-default'
                        : mission.isEligible
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'border border-slate-800 bg-slate-800/40 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'Claimed ✓' : 'Claim Reward'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chapter Drill Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Chapter Challenge Drills
          </h2>

          <button
            type="button"
            onClick={() => onOpenQuizForChapter()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Random High-Yield Drill</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizChapters.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:border-cyan-600/60 shadow-lg transition-all flex flex-col justify-between group space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    CH #{quiz.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-800 bg-amber-950 text-amber-300">
                    {quiz.weightage}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {quiz.name}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                  <span>{quiz.questionsCount} Questions</span>
                  <span>•</span>
                  <span className="text-slate-500">Diff: {quiz.difficulty}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-400 font-bold">+20 XP per correct</span>

                <button
                  type="button"
                  onClick={() => onOpenQuizForChapter(quiz.id, quiz.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-700 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-bold font-mono transition-all"
                >
                  <span>Launch Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
