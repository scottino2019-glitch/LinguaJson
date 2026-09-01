import React, { useState, useEffect } from 'react';
import { Exercise, MatchingPair } from '../types';
import { AudioButton } from './AudioButton';
import { Check, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface MatchingPairsExerciseProps {
  exercise: Exercise;
  languageCode: string;
  matchedPairIds: string[];
  onUpdateMatched: (pairIds: string[]) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const MatchingPairsExercise: React.FC<MatchingPairsExerciseProps> = ({
  exercise,
  languageCode,
  matchedPairIds,
  onUpdateMatched,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const pairs = exercise.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string; sub?: string }[]>([]);
  const [wrongPairAnimation, setWrongPairAnimation] = useState<boolean>(false);

  // Shuffle right items on initial load
  useEffect(() => {
    if (pairs.length > 0) {
      const rights = pairs.map(p => ({ id: p.id, text: p.right, sub: p.rightSub }));
      // Fisher-yates shuffle
      for (let i = rights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rights[i], rights[j]] = [rights[j], rights[i]];
      }
      setShuffledRights(rights);
      onUpdateMatched([]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [exercise.id]);

  const handleSelectLeft = (pairId: string) => {
    if (isAnswerChecked || matchedPairIds.includes(pairId)) return;
    soundEffects.playClick();
    setSelectedLeft(pairId);

    if (selectedRight) {
      checkMatch(pairId, selectedRight);
    }
  };

  const handleSelectRight = (pairId: string) => {
    if (isAnswerChecked || matchedPairIds.includes(pairId)) return;
    soundEffects.playClick();
    setSelectedRight(pairId);

    if (selectedLeft) {
      checkMatch(selectedLeft, pairId);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct Match!
      soundEffects.playSuccess();
      const updated = [...matchedPairIds, leftId];
      onUpdateMatched(updated);
      setSelectedLeft(null);
      setSelectedRight(null);

      // If all matched, auto complete
      if (updated.length === pairs.length) {
        setTimeout(() => {
          onSubmit();
        }, 400);
      }
    } else {
      // Wrong Match
      soundEffects.playIncorrect();
      setWrongPairAnimation(true);
      setTimeout(() => {
        setWrongPairAnimation(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  return (
    <div id={`exercise-matching-pairs-${exercise.id}`} className="space-y-6">
      <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-4 text-center">
        <p className="text-base sm:text-lg font-bold text-stone-900">
          {exercise.prompt || 'Collega tutte le coppie corrispondenti:'}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-stone-500 font-medium">
          <span>{matchedPairIds.length} di {pairs.length} coppie completate</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column (Target Language) */}
        <div className="space-y-3">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
            Lingua di studio:
          </span>
          {pairs.map((pair, idx) => {
            const isMatched = matchedPairIds.includes(pair.id);
            const isSelected = selectedLeft === pair.id;

            return (
              <div
                key={`left-${pair.id}`}
                id={`pair-left-${idx}`}
                role="button"
                tabIndex={isMatched || isAnswerChecked ? -1 : 0}
                aria-disabled={isMatched || isAnswerChecked}
                onClick={() => handleSelectLeft(pair.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectLeft(pair.id);
                  }
                }}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left font-bold transition-all duration-150 flex items-center justify-between gap-2 shadow-2xs ${
                  isMatched || isAnswerChecked ? 'cursor-default' : 'cursor-pointer select-none'
                } ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-60'
                    : isSelected
                      ? wrongPairAnimation
                        ? 'bg-rose-100 border-rose-400 text-rose-900 animate-shake'
                        : 'bg-indigo-100 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300 scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-900 hover:border-indigo-300 hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="text-base sm:text-lg">{pair.left}</div>
                  {pair.leftSub && (
                    <div className="text-xs font-normal text-stone-500">{pair.leftSub}</div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <AudioButton
                    text={pair.left}
                    langCode={languageCode}
                    size="sm"
                  />
                  {isMatched && <Check size={16} className="text-emerald-600 shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (Translation / Definition) */}
        <div className="space-y-3">
          <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
            Significato / Traduzione:
          </span>
          {shuffledRights.map((item, idx) => {
            const isMatched = matchedPairIds.includes(item.id);
            const isSelected = selectedRight === item.id;

            return (
              <button
                key={`right-${item.id}-${idx}`}
                id={`pair-right-${idx}`}
                type="button"
                disabled={isMatched || isAnswerChecked}
                onClick={() => handleSelectRight(item.id)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left font-medium transition-all duration-150 flex items-center justify-between gap-2 shadow-2xs cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 opacity-60'
                    : isSelected
                      ? wrongPairAnimation
                        ? 'bg-rose-100 border-rose-400 text-rose-900 animate-shake'
                        : 'bg-indigo-100 border-indigo-500 text-indigo-950 ring-2 ring-indigo-300 scale-[1.02]'
                      : 'bg-white border-stone-200 text-stone-800 hover:border-indigo-300 hover:bg-stone-50'
                }`}
              >
                <span className="text-sm sm:text-base leading-snug">{item.text}</span>
                {isMatched && <Check size={16} className="text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-matching-pairs-btn"
            type="button"
            disabled={matchedPairIds.length < pairs.length}
            onClick={onSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer shadow-md ${
              matchedPairIds.length === pairs.length
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Completa ({matchedPairIds.length}/{pairs.length})
          </button>
        </div>
      )}
    </div>
  );
};
