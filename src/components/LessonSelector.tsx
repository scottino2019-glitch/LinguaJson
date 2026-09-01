import React, { useState, useRef } from 'react';
import { LessonManifestItem, LessonPackage } from '../types';
import { BookOpen, Upload, Search, X, Check, FileJson, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { validateLessonJson } from '../utils/jsonValidator';

interface LessonSelectorProps {
  isOpen: boolean;
  manifest: LessonManifestItem[];
  customLessons: LessonPackage[];
  activeLessonId?: string;
  onSelectLessonFromManifest: (item: LessonManifestItem) => void;
  onSelectCustomLesson: (lesson: LessonPackage) => void;
  onUploadJson: (lesson: LessonPackage) => void;
  onClose: () => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  isOpen,
  manifest,
  customLessons,
  activeLessonId,
  onSelectLessonFromManifest,
  onSelectCustomLesson,
  onUploadJson,
  onClose
}) => {
  const [filterLang, setFilterLang] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.name.endsWith('.json')) {
      setUploadError('Seleziona un file con estensione .json');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validation = validateLessonJson(text);
        if (!validation.isValid || !validation.lesson) {
          setUploadError(validation.errors.join(' | '));
        } else {
          onUploadJson(validation.lesson);
          onClose();
        }
      } catch (err: any) {
        setUploadError(`Errore nella lettura del file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Combine and filter
  const filteredManifest = manifest.filter(item => {
    const matchesLang = filterLang === 'all' || item.language.toLowerCase().includes(filterLang.toLowerCase());
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const filteredCustom = customLessons.filter(lesson => {
    const matchesLang = filterLang === 'all' || filterLang === 'custom' || lesson.language.toLowerCase().includes(filterLang.toLowerCase());
    const matchesSearch = !searchQuery ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div
      id="lesson-selector-modal"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="lesson-selector-content"
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between gap-4 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">Menù Lezioni di Lingua</h3>
              <p className="text-xs text-stone-500">
                Scegli tra le lezioni integrate o carica i tuoi esercizi in formato JSON
              </p>
            </div>
          </div>

          <button
            id="close-lesson-selector-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Language Filters */}
        <div className="p-4 sm:p-5 border-b border-stone-100 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="search-lessons-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per titolo, argomento o vocabolo..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
              />
            </div>

            {/* Language filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                id="filter-lang-all"
                type="button"
                onClick={() => setFilterLang('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filterLang === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tutte
              </button>
              <button
                id="filter-lang-cinese"
                type="button"
                onClick={() => setFilterLang('cinese')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  filterLang === 'cinese' ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🇨🇳</span> Cinese
              </button>
              <button
                id="filter-lang-coreano"
                type="button"
                onClick={() => setFilterLang('coreano')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  filterLang === 'coreano' ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🇰🇷</span> Coreano
              </button>
              <button
                id="filter-lang-russo"
                type="button"
                onClick={() => setFilterLang('russo')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  filterLang === 'russo' ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>🇷🇺</span> Russo
              </button>
              {customLessons.length > 0 && (
                <button
                  id="filter-lang-custom"
                  type="button"
                  onClick={() => setFilterLang('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    filterLang === 'custom' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>📁</span> Caricate ({customLessons.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/30">
          {/* Upload Dropzone */}
          <div
            id="json-upload-dropzone"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'bg-indigo-50 border-indigo-500 scale-[1.01]'
                : 'bg-white border-stone-300 hover:border-indigo-400 hover:bg-indigo-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Upload size={20} />
              </div>
              <div className="text-center sm:text-left">
                <span className="font-bold text-sm text-stone-900 block">
                  Trascina un file JSON qui o fai clic per caricarlo
                </span>
                <span className="text-xs text-stone-500">
                  Supporta qualsiasi set di esercizi (cinese, coreano, russo, drag & drop, ascolto, scrittura...)
                </span>
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 mt-3 text-left">
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          {/* Custom uploaded lessons section if any */}
          {filteredCustom.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                Lezioni Caricate dall'Utente ({filteredCustom.length}):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCustom.map((lesson) => {
                  const isActive = activeLessonId === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      id={`custom-lesson-${lesson.id}`}
                      type="button"
                      onClick={() => {
                        onSelectCustomLesson(lesson);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-150 relative group cursor-pointer shadow-2xs hover:shadow-md ${
                        isActive
                          ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-300'
                          : 'bg-white border-stone-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lesson.flag || '📁'}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            {lesson.level || 'Personalizzata'}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 font-mono font-medium">
                          {lesson.exercises?.length || 0} esercizi
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 mt-2 text-base group-hover:text-amber-800 transition-colors">
                        {lesson.title}
                      </h5>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {lesson.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preloaded lessons section from public/ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
              Lezioni Integrate ({filteredManifest.length}):
            </h4>

            {filteredManifest.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
                <FileJson size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Nessuna lezione trovata con questi filtri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredManifest.map((item) => {
                  const isActive = activeLessonId === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`manifest-lesson-${item.id}`}
                      type="button"
                      onClick={() => {
                        onSelectLessonFromManifest(item);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-150 relative group cursor-pointer shadow-2xs hover:shadow-md ${
                        isActive
                          ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-300'
                          : 'bg-white border-stone-200 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.flag}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                            {item.level}
                          </span>
                          <span className="text-[11px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 font-mono font-medium">
                          {item.exerciseCount} es.
                        </span>
                      </div>

                      <h5 className="font-bold text-stone-900 mt-2.5 text-base group-hover:text-indigo-700 transition-colors flex items-center justify-between">
                        <span>{item.title}</span>
                        <ChevronRight size={16} className="text-stone-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                      </h5>

                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
