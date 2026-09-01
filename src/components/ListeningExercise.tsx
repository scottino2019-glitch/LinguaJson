import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { Volume2, Snail, Headphones } from 'lucide-react';
import { speakText } from '../utils/audio';

interface ListeningExerciseProps {
  exercise: Exercise;
  languageCode: string;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const ListeningExercise: React.FC<ListeningExerciseProps> = ({
  exercise,
  languageCode,
  selectedOption,
  onSelectOption,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  const phraseToPlay = exercise.audioText || exercise.targetText || '';
  const lang = exercise.audioLang || languageCode;
  const options = exercise.options || [];

  const handlePlay = async (rate: number = 1.0) => {
    if (isPlaying || !phraseToPlay) return;
    setIsPlaying(true);
    try {
      await speakText(phraseToPlay, lang, rate);
      setPlayCount(c => c + 1);
    } finally {
      setIsPlaying(false);
    }
  };

  // Autoplay on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlay(1.0);
    }, 300);
    return () => clearTimeout(timer);
  }, [exercise.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswerChecked) return;
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= options.length) {
        onSelectOption(options[keyNum - 1]);
      } else if (e.key === 'Enter' && selectedOption) {
        onSubmit();
      } else if (e.key === ' ' && !e.repeat) {
        // Spacebar to replay audio
        e.preventDefault();
        handlePlay(1.0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedOption, isAnswerChecked, onSelectOption, onSubmit, isPlaying]);

  return (
    <div id={`exercise-listening-${exercise.id}`} className="space-y-6">
      {/* Listening Audio Control Hub */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
          <Headphones size={15} />
          <span>Esercizio di Ascolto & Comprensione</span>
        </div>

        <p className="text-stone-300 text-sm max-w-md">
          {exercise.prompt || 'Ascolta attentamente la traccia audio e seleziona l\'opzione corretta:'}
        </p>

        {/* Audio buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            id="listening-play-normal-btn"
            type="button"
            onClick={() => handlePlay(1.0)}
            className={`px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-indigo-500 ring-4 ring-indigo-400/40 animate-pulse text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
            }`}
          >
            <Volume2 size={22} className={isPlaying ? 'animate-bounce' : ''} />
            <span>Ascolta (1.0x)</span>
          </button>

          <button
            id="listening-play-slow-btn"
            type="button"
            onClick={() => handlePlay(0.65)}
            title="Ascolta a velocità rallentata (0.65x)"
            className="px-4 py-3.5 rounded-2xl font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Snail size={20} className="text-amber-400" />
            <span className="text-sm">Lento (0.65x)</span>
          </button>
        </div>

        <div className="text-[11px] text-stone-400">
          Suggerimento: Premi la <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700 font-mono text-stone-300">barra spazio</kbd> per riascoltare l'audio
        </div>

        {/* After answer is checked, reveal text */}
        {isAnswerChecked && exercise.targetText && (
          <div className="mt-3 pt-3 border-t border-stone-800 w-full max-w-md">
            <span className="text-2xl font-bold text-white block">
              {exercise.targetText}
            </span>
            {exercise.romanization && (
              <span className="text-xs text-indigo-300 block mt-0.5">
                {exercise.romanization}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Multiple choice options for listening */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isThisCorrect = opt === exercise.correctAnswer;

          let buttonStyle = 'bg-white border-stone-200 text-stone-800 hover:border-indigo-300 hover:bg-indigo-50/30';
          if (isSelected) {
            buttonStyle = 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300';
          }
          if (isAnswerChecked) {
            if (isThisCorrect) {
              buttonStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300 font-semibold';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'bg-rose-50 border-rose-400 text-rose-950 line-through opacity-75';
            } else {
              buttonStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
            }
          }

          return (
            <button
              key={`${opt}-${idx}`}
              id={`listening-opt-${idx}`}
              type="button"
              disabled={isAnswerChecked}
              onClick={() => onSelectOption(opt)}
              className={`p-4 rounded-xl border text-left font-medium text-base transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs cursor-pointer active:scale-[0.99] ${buttonStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-stone-100 border border-stone-300 text-stone-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-listening-btn"
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
