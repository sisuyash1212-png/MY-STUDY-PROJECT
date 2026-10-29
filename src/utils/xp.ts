import { Chapter } from '../types';

export const XP_REWARDS = {
  CHAPTER_COMPLETED: 50,
  REVISION_COMPLETED: 15,
  QUIZ_PARTICIPATION: 10,
  QUIZ_CORRECT_ANSWER: 20,
  SQUAD_MISSION_COMPLETED: 100,
  NOTE_SHARED: 25,
} as const;

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
}

export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  // Progressive curve: each level requires level * 100 XP
  // Total XP for level L = 50 * (L - 1) * L
  // Or simpler predictable student gaming curve: 100 XP per level
  return Math.floor(xp / 100) + 1;
}

export function getLevelProgress(xp: number): LevelProgress {
  const safeXp = Math.max(0, xp);
  const level = calculateLevel(safeXp);
  const currentLevelStartXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const xpInCurrentLevel = safeXp - currentLevelStartXp;
  const xpRequiredForCurrentLevel = 100;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100)));

  return {
    level,
    currentLevelXp: currentLevelStartXp,
    nextLevelXp,
    progressPercent,
    xpInCurrentLevel,
    xpRequiredForCurrentLevel,
  };
}

export function calculateRankTitle(level: number): string {
  if (level >= 30) return 'Quantum Grandmaster';
  if (level >= 20) return 'Chief Science Officer';
  if (level >= 15) return 'Mission Commander';
  if (level >= 10) return 'Lead Researcher';
  if (level >= 6) return 'Laboratory Specialist';
  if (level >= 3) return 'Science Officer';
  return 'Cadet Explorer';
}

export interface ChapterMetrics {
  total: number;
  completed: number;
  inProgress: number;
  remaining: number;
  completionPercent: number;
  highWeightageRemaining: number;
  revisionDueCount: number;
}

export function calculateChapterMetrics(chapters: Chapter[]): ChapterMetrics {
  const total = chapters.length;
  let completed = 0;
  let inProgress = 0;
  let highWeightageRemaining = 0;
  let revisionDueCount = 0;

  for (const ch of chapters) {
    if (ch.status === 'completed') {
      completed++;
    } else if (ch.status === 'in-progress') {
      inProgress++;
    }

    const isHighWeightage = ch.weightagePerYear.includes('4–5') || ch.weightagePerYear.includes('4-5') || ch.weightagePerYear.includes('10');
    if (isHighWeightage && ch.status !== 'completed') {
      highWeightageRemaining++;
    }

    if (ch.revisionStatus) {
      revisionDueCount++;
    }
  }

  const remaining = total - completed;
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    remaining,
    completionPercent,
    highWeightageRemaining,
    revisionDueCount,
  };
}
