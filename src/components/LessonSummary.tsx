import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LessonPackage, Exercise } from '../types';
import { Trophy, CheckCircle, XCircle, RotateCcw, ArrowRight, BookOpen, Flame } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface LessonSummaryProps {
  lesson: LessonPackage;
  totalAnswered: number;
  correctAnswers: number;
  incorrectExercises: Exercise[];
  onRetryLesson: () => void;
  onReviewMistakes: () => void;
  onChooseAnother: () => void;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  lesson,
  totalAnswered,
  correctAnswers,
  incorrectExercises,
  onRetryLesson,
  onReviewMistakes,
  onChooseAnother
}) => {
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const isGreat = accuracy >= 80;

  useEffect(() => {
    if (isGreat) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isGreat]);

  return (
    <div id="lesson-summary-view" className="w-full space-y-5 animate-fade-in">
      {/* Trophy Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shadow-xs">
          <Trophy size={36} className="animate-bounce" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Lezione Completata!
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            {lesson.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {lesson.language} • {lesson.level}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 block">
              {accuracy}%
            </span>
            <span className="text-xs font-semibold text-gray-500">Precisione</span>
          </div>

          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 block">
              {correctAnswers}
            </span>
            <span className="text-xs font-semibold text-emerald-700">Corrette</span>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-2xl sm:text-3xl font-black text-gray-700 block">
              {incorrectExercises.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">Da Rivedere</span>
          </div>
        </div>

        {/* Encouraging message */}
        <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-700 border border-gray-100">
          {accuracy === 100
            ? '🏆 Punteggio perfetto! Hai risposto correttamente a tutti gli esercizi.'
            : accuracy >= 70
              ? '🎉 Ottimo lavoro! Hai una solida comprensione di questa lezione.'
              : '💪 Continua così! Rivedi gli errori per consolidare il vocabolario.'}
        </div>
      </div>

      {/* Mistakes Review List if any */}
      {incorrectExercises.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <XCircle size={16} className="text-rose-500" />
              <span>Domande da rivedere ({incorrectExercises.length}):</span>
            </h4>
            <button
              id="review-mistakes-btn"
              type="button"
              onClick={onReviewMistakes}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              Ripeti solo gli errori
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {incorrectExercises.map((ex, i) => (
              <div
                key={ex.id || i}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1"
              >
                <div className="font-semibold text-gray-800 flex items-center justify-between">
                  <span>{ex.prompt || ex.targetText}</span>
                  {ex.targetText && (
                    <AudioButton
                      text={ex.targetText}
                      langCode={lesson.languageCode}
                      size="sm"
                    />
                  )}
                </div>
                {ex.correctAnswer && (
                  <div className="text-emerald-700 font-medium">
                    Risposta corretta: {Array.isArray(ex.correctAnswer) ? ex.correctAnswer.join(', ') : ex.correctAnswer}
                  </div>
                )}
                {ex.explanation && (
                  <div className="text-gray-500 italic">
                    Nota: {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          id="retry-lesson-btn"
          type="button"
          onClick={onRetryLesson}
          className="flex-1 py-3 px-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
        >
          <RotateCcw size={16} />
          <span>Ripeti Tutta la Lezione</span>
        </button>

        <button
          id="choose-other-lesson-btn"
          type="button"
          onClick={onChooseAnother}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <BookOpen size={16} />
          <span>Scegli un'Altra Lezione</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

