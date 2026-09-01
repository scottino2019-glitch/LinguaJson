import React, { useEffect } from 'react';
import { Exercise } from '../types';
import { AudioButton } from './AudioButton';
import { Check } from 'lucide-react';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  languageCode: string;
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({
  exercise,
  languageCode,
  selectedOptions,
  onToggleOption,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const options = exercise.options || [];
  const correctArray = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer
    : [exercise.correctAnswer as string];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked) return;
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= options.length) {
        onToggleOption(options[keyNum - 1]);
      } else if (e.key === 'Enter' && selectedOptions.length > 0) {
        onSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedOptions, isAnswerChecked, onToggleOption, onSubmit]);

  return (
    <div id={`exercise-multiple-choice-${exercise.id}`} className="space-y-6">
      {exercise.targetText && (
        <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
              {exercise.targetText}
            </span>
            <AudioButton
              text={exercise.audioText || exercise.targetText}
              langCode={exercise.audioLang || languageCode}
              size="md"
            />
          </div>
          {exercise.romanization && (
            <p className="text-sm font-medium text-stone-600 bg-white/80 px-3 py-1 rounded-full border border-stone-200">
              {exercise.romanization}
            </p>
          )}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between">
        <span>💡 Seleziona tutte le risposte corrette (possono essere più di una)</span>
        <span className="font-bold">{selectedOptions.length} selezionate</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt, idx) => {
          const isSelected = selectedOptions.includes(opt);
          const isActuallyCorrect = correctArray.includes(opt);

          let buttonStyle = 'bg-white border-stone-200 text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/30';
          if (isSelected) {
            buttonStyle = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300';
          }
          if (isAnswerChecked) {
            if (isActuallyCorrect) {
              buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 font-semibold';
            } else if (isSelected && !isActuallyCorrect) {
              buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through opacity-75';
            } else {
              buttonStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={`${opt}-${idx}`}
              id={`multi-option-btn-${idx}`}
              type="button"
              disabled={isAnswerChecked}
              onClick={() => onToggleOption(opt)}
              className={`p-4 rounded-xl border text-left font-medium text-base transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs cursor-pointer active:scale-[0.99] ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-stone-300'
                }`}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
                <span>{opt}</span>
              </div>
              <span className="text-xs font-mono text-stone-400">{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-multi-choice-btn"
            type="button"
            disabled={selectedOptions.length === 0}
            onClick={onSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer shadow-md ${
              selectedOptions.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Verifica Risposte ({selectedOptions.length})
          </button>
        </div>
      )}
    </div>
  );
};
