import React, { useState, useEffect } from 'react';
import { Exercise } from '../types';
import { RotateCcw, Volume2, Sparkles, GripVertical } from 'lucide-react';
import { AudioButton } from './AudioButton';

interface DragSentenceExerciseProps {
  exercise: Exercise;
  languageCode: string;
  assembledSentence: string[];
  onUpdateAssembled: (parts: string[]) => void;
  isAnswerChecked: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
}

export const DragSentenceExercise: React.FC<DragSentenceExerciseProps> = ({
  exercise,
  languageCode,
  assembledSentence,
  onUpdateAssembled,
  isAnswerChecked,
  isCorrect,
  onSubmit
}) => {
  const [availableWords, setAvailableWords] = useState<{ id: string; text: string }[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize pool of words
  useEffect(() => {
    if (exercise.sentenceParts) {
      // Shuffle slightly or keep initial pool
      const pool = exercise.sentenceParts.map((word, index) => ({
        id: `word-${index}-${word}`,
        text: word
      }));
      setAvailableWords(pool);
      onUpdateAssembled([]);
    }
  }, [exercise.id]);

  const handleSelectWord = (wordObj: { id: string; text: string }) => {
    if (isAnswerChecked) return;
    setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));
    onUpdateAssembled([...assembledSentence, wordObj.text]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    if (isAnswerChecked) return;
    const removedText = assembledSentence[wordIndex];
    const newAssembled = assembledSentence.filter((_, idx) => idx !== wordIndex);
    onUpdateAssembled(newAssembled);
    setAvailableWords(prev => [...prev, { id: `word-${Date.now()}-${removedText}`, text: removedText }]);
  };

  const handleReset = () => {
    if (isAnswerChecked) return;
    if (exercise.sentenceParts) {
      const pool = exercise.sentenceParts.map((word, index) => ({
        id: `word-${index}-${word}`,
        text: word
      }));
      setAvailableWords(pool);
      onUpdateAssembled([]);
    }
  };

  // Drag & drop handlers for reordering inside the slot
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isAnswerChecked) return;
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (isAnswerChecked || draggedIndex === null || draggedIndex === targetIndex) return;
    const updated = [...assembledSentence];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    onUpdateAssembled(updated);
    setDraggedIndex(null);
  };

  return (
    <div id={`exercise-drag-sentence-${exercise.id}`} className="space-y-6">
      {/* Target translation prompt */}
      {exercise.prompt && (
        <div className="bg-stone-100/80 border border-stone-200/80 rounded-2xl p-5 text-center">
          <p className="text-lg sm:text-xl font-bold text-stone-900">
            {exercise.prompt}
          </p>
          {exercise.targetText && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200">
                Frase target: {exercise.targetText}
              </span>
              <AudioButton
                text={exercise.targetText}
                langCode={exercise.audioLang || languageCode}
                size="sm"
              />
            </div>
          )}
          {exercise.romanization && (
            <p className="text-xs text-stone-500 italic mt-1.5">
              ({exercise.romanization})
            </p>
          )}
        </div>
      )}

      {/* Assembly Zone */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider px-1">
          <span>La tua frase:</span>
          {assembledSentence.length > 0 && !isAnswerChecked && (
            <button
              id="reset-drag-sentence-btn"
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-stone-500 hover:text-rose-600 font-medium lowercase transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>svuota</span>
            </button>
          )}
        </div>

        <div
          id="drag-sentence-dropzone"
          className={`min-h-24 p-4 rounded-2xl border-2 border-dashed flex flex-wrap gap-2.5 items-center transition-colors ${
            isAnswerChecked
              ? isCorrect
                ? 'bg-emerald-50/70 border-emerald-400'
                : 'bg-rose-50/70 border-rose-400'
              : assembledSentence.length === 0
                ? 'bg-stone-50/70 border-stone-300 text-stone-400 justify-center'
                : 'bg-white border-indigo-300 shadow-inner'
          }`}
        >
          {assembledSentence.length === 0 ? (
            <p className="text-sm text-stone-400 italic pointer-events-none select-none">
              Tocca o trascina le parole qui sotto per comporre la frase nell'ordine corretto
            </p>
          ) : (
            assembledSentence.map((word, idx) => (
              <div
                key={`placed-${idx}-${word}`}
                id={`placed-word-${idx}`}
                draggable={!isAnswerChecked}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => handleRemoveWord(idx)}
                title={isAnswerChecked ? '' : 'Clicca per rimuovere o trascina per riordinare'}
                className={`group px-3.5 py-2.5 rounded-xl font-bold text-base sm:text-lg flex items-center gap-1.5 transition-all shadow-xs border select-none ${
                  isAnswerChecked
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                      : 'bg-rose-100 border-rose-300 text-rose-950'
                    : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 active:scale-95 cursor-pointer'
                }`}
              >
                {!isAnswerChecked && (
                  <GripVertical size={14} className="opacity-60 group-hover:opacity-100" />
                )}
                <span>{word}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Word Bank */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider px-1">
          Parole disponibili:
        </span>
        <div className="min-h-16 p-3 bg-stone-100/70 rounded-2xl border border-stone-200 flex flex-wrap gap-2.5 items-center">
          {availableWords.length === 0 ? (
            <span className="text-xs text-stone-400 italic px-2">
              Tutte le parole sono state posizionate! Clicca su "Verifica".
            </span>
          ) : (
            availableWords.map((item, idx) => (
              <button
                key={item.id}
                id={`word-token-${idx}`}
                type="button"
                disabled={isAnswerChecked}
                onClick={() => handleSelectWord(item)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-stone-300 hover:border-indigo-400 font-bold text-stone-800 text-base sm:text-lg shadow-2xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {item.text}
              </button>
            ))
          )}
        </div>
      </div>

      {!isAnswerChecked && (
        <div className="flex justify-end pt-4">
          <button
            id="check-drag-sentence-btn"
            type="button"
            disabled={assembledSentence.length === 0}
            onClick={onSubmit}
            className={`px-7 py-3 rounded-xl font-bold text-white transition-all duration-150 cursor-pointer shadow-md ${
              assembledSentence.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Verifica Ordine Frase
          </button>
        </div>
      )}
    </div>
  );
};
