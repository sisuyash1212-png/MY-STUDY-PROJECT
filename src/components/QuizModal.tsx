import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { SAMPLE_QUIZZES } from '../data/quizzes';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { X, Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Zap, Trophy, Timer } from 'lucide-react';

interface QuizModalProps {
  chapterId?: number;
  chapterName?: string;
  onClose: () => void;
  onQuizCompleted?: (score: number, total: number, earnedXp: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  chapterId,
  chapterName,
  onClose,
  onQuizCompleted,
}) => {
  const { user, awardXp, playSound } = useAuth();

  // Filter quizzes for this chapter if provided, otherwise pick from sample
  const availableQuestions = chapterId
    ? SAMPLE_QUIZZES.filter((q) => q.chapterId === chapterId)
    : SAMPLE_QUIZZES;

  const questions: QuizQuestion[] =
    availableQuestions.length > 0 ? availableQuestions : SAMPLE_QUIZZES.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalEarnedXp, setTotalEarnedXp] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (isAnswered || quizFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswered, quizFinished]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    playSound('alert');
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      playSound('complete');
      setScore((s) => s + 1);
      setTotalEarnedXp((x) => x + (currentQ.xpReward || 20));
    } else {
      playSound('alert');
    }
  };

  const handleNext = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
      playSound('click');
    } else {
      // Quiz finished
      setQuizFinished(true);
      playSound('levelUp');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Award XP on server
      if (user) {
        const bonus = 10;
        const totalXp = totalEarnedXp + bonus;
        await awardXp(`quiz_complete_${chapterId || 'general'}_${Date.now()}`, totalXp);
      }

      if (onQuizCompleted) {
        onQuizCompleted(score, questions.length, totalEarnedXp);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTotalEarnedXp(0);
    setQuizFinished(false);
    setTimeLeft(30);
    playSound('click');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-cyan-800/80 bg-slate-950 shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-900 bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-700/60 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                {chapterName ? `Mission Chapter: ${chapterName}` : 'Science Orbital Challenge'}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">Interactive Science Drill</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!quizFinished ? (
          <div className="p-5 sm:p-7 space-y-6">
            {/* Progress & Timer bar */}
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-slate-400">
                Question <span className="font-bold text-cyan-300">{currentIndex + 1}</span> of{' '}
                <span className="text-slate-300">{questions.length}</span>
              </span>

              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                  timeLeft <= 10
                    ? 'border-rose-700 bg-rose-950/60 text-rose-300 animate-pulse'
                    : 'border-slate-800 bg-slate-900 text-slate-300'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/40">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 mb-2">
                {currentQ.chapterName} • +{currentQ.xpReward} XP
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-950/70 text-rose-200 font-bold';
                  } else {
                    btnStyle = 'border-slate-800/40 opacity-40 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-md border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-mono flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-snug">{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card upon answering */}
            {isAnswered && (
              <div className="p-4 rounded-xl border border-cyan-900/60 bg-cyan-950/30 text-xs text-slate-200 space-y-1.5 animate-in fade-in duration-200">
                <div className="font-bold font-mono text-cyan-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Scientific Explanation:
                </div>
                <p className="leading-relaxed font-sans text-slate-300">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Finished Screen */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Mission Drill Complete!</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-mono">
                Knowledge verified by Science Mission HQ
              </p>
            </div>

            {/* Score & XP Earned Badge */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="text-2xl font-extrabold text-cyan-400">
                  {score} / {questions.length}
                </div>
                <div className="text-[11px] font-mono text-slate-400">Correct Answers</div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-800/60 bg-amber-950/40">
                <div className="text-2xl font-extrabold text-amber-400">+{totalEarnedXp + 10}</div>
                <div className="text-[11px] font-mono text-amber-300">Total XP Awarded</div>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono"
              >
                Back to Mission Control
              </button>
            </div>
          </div>
        )}

        {/* Footer Next button */}
        {!quizFinished && isAnswered && (
          <div className="p-4 border-t border-slate-900 bg-slate-950 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
