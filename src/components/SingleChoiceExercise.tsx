import React, { useEffect } from 'react';
import { Exercise } from '../types';
import { AudioButton } from './AudioButton';

interface SingleChoiceExerciseProps {
  exercise: Exercise;
  languageCode: string;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const SingleChoiceExercise: React.FC<SingleChoiceExerciseProps> = ({
  exercise,
  languageCode,
  selectedOption,
  onSelectOption,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const options = exercise.options || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked) return;
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= options.length) {
        onSelectOption(options[keyNum - 1]);
      } else if (e.key === 'Enter' && selectedOption) {
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedOption, isAnswerChecked, onSelectOption, onSubmit]);

  return (
    <div id={`exercise-single-choice-${exercise.id}`} className="space-y-6">
      {/* Target Word/Phrase Card if available */}
      {exercise.targetText && (
        <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 relative">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              {exercise.targetText}
            </span>
            <AudioButton
              text={exercise.audioText || exercise.targetText}
              langCode={exercise.audioLang || languageCode}
              size="md"
            />
            <AudioButton
              text={exercise.audioText || exercise.targetText}
              langCode={exercise.audioLang || languageCode}
              size="md"
              slow={true}
            />
          </div>

          {exercise.romanization && (
            <p className="text-sm font-medium text-stone-600 bg-white/80 px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
              {exercise.romanization}
            </p>
          )}

          {exercise.hint && !isAnswerChecked && (
            <p className="text-xs text-stone-500 italic mt-1">
              Suggerimento: {exercise.hint}
            </p>
          )}
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isThisCorrect = opt === exercise.correctAnswer;

          let buttonStyle = 'bg-white border-stone-200 text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/30';
          if (isSelected) {
            buttonStyle = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300';
          }
          if (isAnswerChecked) {
            if (isThisCorrect) {
              buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through opacity-75';
            } else {
              buttonStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={`${opt}-${idx}`}
              id={`option-btn-${idx}`}
              type="button"
              disabled={isAnswerChecked}
              onClick={() => onSelectOption(opt)}
              className={`p-4 rounded-xl border text-left font-medium text-base transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs active:scale-[0.99] cursor-pointer ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-stone-100 border border-stone-300 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-snug">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-single-choice-btn"
            type="button"
            disabled={!selectedOption}
            onClick={onSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer shadow-md ${
              selectedOption
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Verifica Risposta
          </button>
        </div>
      )}
    </div>
  );
};
