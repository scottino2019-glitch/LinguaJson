import React from 'react';
import { BookOpen, Upload, Code2, Flame } from 'lucide-react';
import { LessonPackage, UserStats } from '../types';

interface HeaderProps {
  currentLesson: LessonPackage | null;
  currentIndex: number;
  totalExercises: number;
  stats: UserStats;
  onOpenSelector: () => void;
  onOpenJsonEditor: () => void;
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLesson,
  stats,
  onOpenSelector,
  onOpenJsonEditor,
  onUploadClick
}) => {
  return (
    <header id="main-header" className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-30 shadow-2xs">
      {/* Left brand & Active Lesson Title */}
      <div className="flex items-center min-w-0 flex-1 mr-3">
        <button
          id="header-brand-btn"
          type="button"
          onClick={onOpenSelector}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group text-left max-w-full"
          title="Apri selezione lezioni"
        >
          {/* Logo / Flag Icon */}
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
            {currentLesson?.flag ? currentLesson.flag : 'L'}
          </div>

          {/* App / Lesson Title */}
          <div className="flex items-baseline gap-1.5 min-w-0 truncate">
            <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#1A1A1A] truncate">
              {currentLesson ? currentLesson.title : 'PolyglotStudio'}
            </h1>
            <span className="text-gray-400 font-normal text-xs sm:text-sm hidden lg:inline shrink-0">
              / Lab
            </span>
          </div>
        </button>
      </div>

      {/* Right controls matching Bento design */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Streak Flame Badge */}
        {stats.streak > 0 && (
          <div
            id="streak-badge"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold whitespace-nowrap shrink-0"
            title="Esercizi corretti consecutivi"
          >
            <Flame size={13} className="text-amber-500 fill-amber-500 shrink-0" />
            <span>{stats.streak}</span>
            <span className="hidden xl:inline">Streak</span>
          </div>
        )}

        {/* Saved Exercises / Catalog */}
        <button
          id="header-saved-exercises-btn"
          type="button"
          onClick={onOpenSelector}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 bg-white text-gray-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
        >
          <BookOpen size={14} className="text-gray-500 shrink-0" />
          <span className="hidden sm:inline">Saved Exercises</span>
          <span className="sm:hidden">Libreria</span>
        </button>

        {/* Import JSON CTA */}
        <button
          id="header-import-json-btn"
          type="button"
          onClick={onUploadClick}
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0"
        >
          <Upload size={14} className="shrink-0" />
          <span className="hidden md:inline">Import JSON</span>
          <span className="md:hidden">Import</span>
        </button>

        {/* JSON Editor Button */}
        <button
          id="header-json-editor-btn"
          type="button"
          onClick={onOpenJsonEditor}
          className="px-2.5 sm:px-3 py-1.5 sm:py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          title="Modifica JSON"
        >
          <Code2 size={14} className="text-indigo-600 shrink-0" />
          <span className="hidden lg:inline">JSON Editor</span>
          <span className="lg:hidden">Editor</span>
        </button>
      </div>
    </header>
  );
};
