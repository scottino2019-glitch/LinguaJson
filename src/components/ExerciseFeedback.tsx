import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Volume2 } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface ExerciseFeedbackProps {
  isAnswerChecked: boolean;
  isCorrect: boolean;
  correctAnswerText?: string;
  explanation?: string;
  targetText?: string;
  romanization?: string;
  languageCode?: string;
  onNext: () => void;
  isLastQuestion?: boolean;
}

export const ExerciseFeedback: React.FC<ExerciseFeedbackProps> = ({
  isAnswerChecked,
  isCorrect,
  correctAnswerText,
  explanation,
  targetText,
  romanization,
  languageCode = 'zh-CN',
  onNext,
  isLastQuestion = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked && e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, onNext]);

  if (!isAnswerChecked) return null;

  return (
    <div
      id="exercise-feedback-panel"
      className={`fixed bottom-0 left-0 right-0 z-40 border-t p-4 sm:p-5 shadow-2xl transition-all duration-300 ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
          : 'bg-rose-50 border-rose-300 text-rose-950'
      }`}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className={`p-2 rounded-full mt-0.5 shrink-0 ${
            isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-base sm:text-lg flex items-center gap-2">
              {isCorrect ? 'Corretto! Ottimo lavoro' : 'Non del tutto corretto'}
              {targetText && (
                <AudioButton
                  text={targetText}
                  langCode={languageCode}
                  size="sm"
                  className="ml-1"
                />
              )}
            </h4>

            {!isCorrect && correctAnswerText && (
              <div className="text-sm">
                <span className="font-semibold text-rose-800">Risposta esatta: </span>
                <span className="font-medium text-rose-900 bg-white/70 px-2 py-0.5 rounded border border-rose-200">
                  {correctAnswerText}
                </span>
              </div>
            )}

            {romanization && (
              <div className="text-xs text-stone-600 italic">
                Pronuncia / Trascrizione: <span className="font-medium text-stone-800 not-italic">{romanization}</span>
              </div>
            )}

            {explanation && (
              <div className="flex items-start gap-1.5 text-xs text-stone-700 mt-1 bg-white/60 p-2 rounded-lg border border-stone-200/60">
                <Lightbulb size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          <button
            id="feedback-continue-btn"
            type="button"
            onClick={onNext}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer ${
              isCorrect
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            <span>{isLastQuestion ? 'Termina Lezione' : 'Continua'}</span>
            <span className="hidden sm:inline text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded">↵ Invio</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
