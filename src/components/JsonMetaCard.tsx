import React from 'react';
import { LessonPackage, Exercise } from '../types';
import { Code2, ExternalLink } from 'lucide-react';

interface JsonMetaCardProps {
  lesson: LessonPackage | null;
  currentExercise: Exercise | undefined;
  onOpenJsonEditor: () => void;
}

export const JsonMetaCard: React.FC<JsonMetaCardProps> = ({
  lesson,
  currentExercise,
  onOpenJsonEditor
}) => {
  const lessonId = lesson?.id || 'lesson_001';
  const language = lesson?.language || 'Korean';
  const level = lesson?.level || 'Beginner';
  const type = currentExercise?.type || 'single_choice';
  const qText = currentExercise?.prompt || currentExercise?.targetText || '안녕하세요';

  return (
    <div id="bento-json-metadata" className="bg-[#1A1A1A] rounded-2xl p-5 text-white flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Code2 size={13} className="text-indigo-400" />
            <span>JSON Metadata</span>
          </h2>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded font-semibold">
            VALID
          </span>
        </div>

        {/* Syntax-highlighted live JSON preview */}
        <div className="font-mono text-[11px] leading-tight space-y-0.5 overflow-x-auto bg-black/30 p-2.5 rounded-xl border border-gray-800">
          <p className="text-blue-400">&#123;</p>
          <p className="pl-3 text-emerald-400">
            "id": <span className="text-amber-300">"{lessonId}"</span>,
          </p>
          <p className="pl-3 text-emerald-400">
            "language": <span className="text-amber-300">"{language}"</span>,
          </p>
          <p className="pl-3 text-emerald-400">
            "level": <span className="text-amber-300">"{level}"</span>,
          </p>
          <p className="pl-3 text-emerald-400">
            "type": <span className="text-amber-300">"{type}"</span>,
          </p>
          <p className="pl-3 text-purple-400">"active_q": &#123;</p>
          <p className="pl-6 text-emerald-400">
            "target": <span className="text-orange-300">"{qText.slice(0, 18)}"</span>
          </p>
          <p className="pl-3 text-purple-400">&#125;</p>
          <p className="text-blue-400">&#125;</p>
        </div>
      </div>

      <button
        id="bento-edit-json-trigger"
        type="button"
        onClick={onOpenJsonEditor}
        className="mt-3 pt-3 border-t border-gray-800 text-[11px] text-gray-400 hover:text-white flex items-center justify-between transition-colors w-full cursor-pointer group"
      >
        <span className="group-hover:text-indigo-400 transition-colors">Click to edit JSON directly</span>
        <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
