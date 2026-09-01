import React, { useState, useRef, useEffect } from 'react';
import { Exercise } from '../types';
import { AudioButton } from './AudioButton';
import { VirtualKeyboard } from './VirtualKeyboard';
import { HelpCircle, Sparkles } from 'lucide-react';

interface WritingExerciseProps {
  exercise: Exercise;
  languageCode: string;
  userText: string;
  onUpdateText: (text: string) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const WritingExercise: React.FC<WritingExerciseProps> = ({
  exercise,
  languageCode,
  userText,
  onUpdateText,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAnswerChecked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [exercise.id, isAnswerChecked]);

  const handleInsertChar = (char: string) => {
    if (isAnswerChecked) return;
    const newText = userText + char;
    onUpdateText(newText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isAnswerChecked && userText.trim().length > 0) {
        onSubmit();
      }
    }
  };

  return (
    <div id={`exercise-writing-${exercise.id}`} className="space-y-6">
      {/* Target prompt */}
      <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2">
        <p className="text-base sm:text-lg font-bold text-stone-900">
          {exercise.prompt}
        </p>

        {exercise.targetText && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900">
              {exercise.targetText}
            </span>
            <AudioButton
              text={exercise.audioText || exercise.targetText}
              langCode={exercise.audioLang || languageCode}
              size="md"
            />
          </div>
        )}

        {exercise.romanization && (
          <span className="text-xs font-medium text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
            {exercise.romanization}
          </span>
        )}

        {exercise.hint && !isAnswerChecked && (
          <div className="pt-2">
            {!showHint ? (
              <button
                id="show-writing-hint-btn"
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>Mostra suggerimento</span>
              </button>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                💡 {exercise.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div className="relative">
          <input
            id="writing-answer-input"
            ref={inputRef}
            type="text"
            disabled={isAnswerChecked}
            value={userText}
            onChange={(e) => onUpdateText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi qui la risposta..."
            className={`w-full px-5 py-4 rounded-2xl border-2 text-lg sm:text-xl font-medium transition-all shadow-inner outline-none ${
              isAnswerChecked
                ? isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                  : 'bg-rose-50 border-rose-400 text-rose-950 line-through'
                : 'bg-white border-stone-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-stone-900'
            }`}
          />
        </div>

        {/* Quick virtual keyboard helper for accents/characters */}
        {!isAnswerChecked && (
          <VirtualKeyboard
            languageCode={exercise.audioLang || languageCode}
            onInsertChar={handleInsertChar}
          />
        )}
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-2">
          <button
            id="check-writing-btn"
            type="button"
            disabled={userText.trim().length === 0}
            onClick={onSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer shadow-md ${
              userText.trim().length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Verifica Scrittura
          </button>
        </div>
      )}
    </div>
  );
};
