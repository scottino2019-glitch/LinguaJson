import React from 'react';
import { Exercise, LessonPackage } from '../types';
import { AudioButton } from './AudioButton';
import { BookOpen, Sparkles, HelpCircle } from 'lucide-react';

interface ReferenceBoardProps {
  exercise: Exercise | undefined;
  lesson: LessonPackage | null;
}

export const ReferenceBoard: React.FC<ReferenceBoardProps> = ({ exercise, lesson }) => {
  if (!exercise || !lesson) {
    return (
      <div id="bento-reference-board" className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Reference Board
        </h2>
        <div className="text-xs text-gray-400 italic py-6 text-center">
          Nessun dato attivo.
        </div>
      </div>
    );
  }

  // Deconstruct characters/words from target text for Hanzi / Hangul / Cyrillic
  const targetChars = exercise.targetText
    ? Array.from<string>(exercise.targetText.trim()).filter((ch: string) => !/[ ,.?!:;'"，。？！]/.test(ch))
    : [];

  const promptText = exercise.prompt || '';
  const langCode = lesson.languageCode || 'zh-CN';

  return (
    <div id="bento-reference-board" className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Reference Board
          </h2>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
            {lesson.language}
          </span>
        </div>

        {/* Character / Word Breakdown */}
        {targetChars.length > 0 ? (
          <div className="space-y-3 mb-4">
            {targetChars.slice(0, 3).map((ch, idx) => (
              <div key={`${ch}-${idx}`} className="flex items-start gap-3 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
                <div className="text-2xl font-bold text-indigo-600 shrink-0 min-w-8 text-center">
                  {ch}
                </div>
                <div className="text-xs leading-snug text-gray-600 flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Carattere #{idx + 1}</span>
                    <AudioButton text={ch} langCode={langCode} size="sm" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {exercise.romanization ? `Trascrizione: ${exercise.romanization}` : 'Carattere attivo nella frase'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 mb-4">
            <span className="font-semibold text-gray-900 block mb-1">Focus Lezione:</span>
            {promptText || lesson.description}
          </div>
        )}
      </div>

      {/* Transcription Hint or Grammar Note */}
      <div className="pt-3 border-t border-gray-100">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" />
          <span>Nota / Suggerimento</span>
        </h3>
        <p className="text-xs italic font-serif text-gray-700 leading-relaxed bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/70">
          {exercise.explanation || exercise.hint || `Ascolta la pronuncia autentica in ${lesson.language} e osserva la struttura delle particelle e l'ordine dei caratteri.`}
        </p>
      </div>
    </div>
  );
};
