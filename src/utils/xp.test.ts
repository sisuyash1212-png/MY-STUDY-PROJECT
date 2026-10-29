import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevel, getLevelProgress, calculateRankTitle, calculateChapterMetrics } from './xp';
import { Chapter } from '../types';

test('calculateLevel works for various XP amounts', () => {
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(50), 1);
  assert.equal(calculateLevel(100), 2);
  assert.equal(calculateLevel(250), 3);
  assert.equal(calculateLevel(999), 10);
});

test('getLevelProgress calculates correct percentage and bounds', () => {
  const p1 = getLevelProgress(50);
  assert.equal(p1.level, 1);
  assert.equal(p1.progressPercent, 50);
  assert.equal(p1.xpInCurrentLevel, 50);

  const p2 = getLevelProgress(175);
  assert.equal(p2.level, 2);
  assert.equal(p2.progressPercent, 75);
  assert.equal(p2.xpInCurrentLevel, 75);
});

test('calculateRankTitle scales with level', () => {
  assert.equal(calculateRankTitle(1), 'Cadet Explorer');
  assert.equal(calculateRankTitle(4), 'Science Officer');
  assert.equal(calculateRankTitle(12), 'Lead Researcher');
  assert.equal(calculateRankTitle(25), 'Chief Science Officer');
  assert.equal(calculateRankTitle(35), 'Quantum Grandmaster');
});

test('calculateChapterMetrics computes counts accurately', () => {
  const sampleChapters: Chapter[] = [
    { id: 1, srNo: 1, name: 'Ch 1', sourceBoard: 'NCERT', weightagePerYear: '4–5 Ques', totalQuestions: 100, status: 'completed', revisionStatus: true, notes: '' },
    { id: 2, srNo: 2, name: 'Ch 2', sourceBoard: 'NCERT', weightagePerYear: '4–5 Ques', totalQuestions: 80, status: 'in-progress', revisionStatus: false, notes: '' },
    { id: 3, srNo: 3, name: 'Ch 3', sourceBoard: 'NCERT', weightagePerYear: '1–2 Ques', totalQuestions: 20, status: 'not-started', revisionStatus: true, notes: '' },
  ];

  const metrics = calculateChapterMetrics(sampleChapters);
  assert.equal(metrics.total, 3);
  assert.equal(metrics.completed, 1);
  assert.equal(metrics.inProgress, 1);
  assert.equal(metrics.remaining, 2);
  assert.equal(metrics.completionPercent, 33);
  assert.equal(metrics.highWeightageRemaining, 1); // Ch 2 has 4-5 ques and not completed
  assert.equal(metrics.revisionDueCount, 2); // Ch 1 and Ch 3 have revisionStatus true
});
