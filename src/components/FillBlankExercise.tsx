import React, { useState } from 'react';
import { Exercise } from '../types';
import { AudioButton } from './AudioButton';

interface FillBlankExerciseProps {
  exercise: Exercise;
  languageCode: string;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const FillBlankExercise: React.FC<FillBlankExerciseProps> = ({
  exercise,
  languageCode,
  selectedOption,
  onSelectOption,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const options = exercise.options || [];
  const sentence = exercise.blankSentence || exercise.targetText || '...';
  const parts = sentence.split(/\[blank\]/i);

  return (
    <div id={`exercise-fill-blank-${exercise.id}`} className="space-y-6">
      {/* Prompt Card with Blank Slot */}
      <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-6 text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          {exercise.prompt || 'Completa la frase con la parola corretta:'}
        </p>

        <div className="text-xl sm:text-2xl font-bold text-stone-900 flex flex-wrap items-center justify-center gap-2 leading-relaxed">
          {parts.map((segment, idx) => (
            <React.Fragment key={`seg-${idx}`}>
              <span>{segment}</span>
              {idx < parts.length - 1 && (
                <span
                  className={`inline-block min-w-20 px-3 py-1 rounded-xl border-2 border-dashed font-mono text-center text-lg transition-all ${
                    selectedOption
                      ? isAnswerChecked
                        ? isCorrect
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                          : 'bg-rose-100 border-rose-500 text-rose-950 font-bold'
                        : 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs'
                      : 'bg-white border-stone-300 text-stone-400'
                  }`}
                >
                  {selectedOption || '___'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {exercise.romanization && (
          <p className="text-xs text-stone-500 italic">
            ({exercise.romanization})
          </p>
        )}

        {exercise.targetText && (
          <div className="flex justify-center pt-1">
            <AudioButton
              text={exercise.targetText.replace(/\[blank\]/gi, (exercise.correctAnswer as string) || '')}
              langCode={exercise.audioLang || languageCode}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Choice Options */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
          Scegli la parola corretta:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isThisCorrect = opt === exercise.correctAnswer;

            let buttonStyle = 'bg-white border-stone-200 text-stone-800 hover:border-indigo-300 hover:bg-stone-50';
            if (isSelected) {
              buttonStyle = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300 font-bold';
            }
            if (isAnswerChecked) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 font-bold';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through opacity-75';
              } else {
                buttonStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
              }
            }

            return (
              <button
                key={`${opt}-${idx}`}
                id={`fill-blank-opt-${idx}`}
                type="button"
                disabled={isAnswerChecked}
                onClick={() => onSelectOption(opt)}
                className={`p-3.5 rounded-xl border text-center font-medium text-base transition-all duration-150 shadow-2xs active:scale-95 cursor-pointer ${buttonStyle}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-fill-blank-btn"
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
