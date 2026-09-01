import React, { useState, useEffect, useCallback } from 'react';
import { LessonPackage, LessonManifestItem, Exercise, UserStats } from './types';
import { Header } from './components/Header';
import { LessonSelector } from './components/LessonSelector';
import { JsonEditorModal } from './components/JsonEditorModal';
import { ExerciseFeedback } from './components/ExerciseFeedback';
import { LessonSummary } from './components/LessonSummary';
import { ReferenceBoard } from './components/ReferenceBoard';
import { JsonMetaCard } from './components/JsonMetaCard';
import { SingleChoiceExercise } from './components/SingleChoiceExercise';
import { MultipleChoiceExercise } from './components/MultipleChoiceExercise';
import { DragSentenceExercise } from './components/DragSentenceExercise';
import { MatchingPairsExercise } from './components/MatchingPairsExercise';
import { ListeningExercise } from './components/ListeningExercise';
import { WritingExercise } from './components/WritingExercise';
import { FillBlankExercise } from './components/FillBlankExercise';
import { soundEffects } from './utils/audio';
import { BookOpen, Upload, Code2, AlertCircle, Loader2, Sparkles, ChevronRight, ArrowRight, SkipForward } from 'lucide-react';

const STATS_STORAGE_KEY = 'linguajson_stats_v1';
const CUSTOM_LESSONS_KEY = 'linguajson_custom_lessons_v1';

export default function App() {
  const [manifest, setManifest] = useState<LessonManifestItem[]>([]);
  const [customLessons, setCustomLessons] = useState<LessonPackage[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonPackage | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState<boolean>(false);

  // Active exercise state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<string[]>([]);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [userWrittenText, setUserWrittenText] = useState<string>('');

  // Checking & feedback state
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isLessonFinished, setIsLessonFinished] = useState<boolean>(false);

  // Session stats & mistakes
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectExercises, setIncorrectExercises] = useState<Exercise[]>([]);

  // Persistent user stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      completedLessons: [],
      totalScore: 0,
      totalAnswered: 0,
      correctAnswered: 0,
      streak: 0
    };
  });

  // Load manifest & custom lessons on startup
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        // Load custom lessons from localStorage
        try {
          const savedCustom = localStorage.getItem(CUSTOM_LESSONS_KEY);
          if (savedCustom) {
            setCustomLessons(JSON.parse(savedCustom));
          }
        } catch {}

        // Fetch manifest
        const res = await fetch('/lessons/manifest.json');
        if (!res.ok) throw new Error(`Errore caricamento manifest: ${res.status}`);
        const manifestData: LessonManifestItem[] = await res.json();
        setManifest(manifestData);

        if (manifestData.length > 0) {
          // Load default first lesson
          await loadLessonFromFile(manifestData[0].file);
        }
      } catch (err: any) {
        console.error('Failed to load lessons:', err);
        setLoadError('Impossibile caricare le lezioni integrate. Puoi caricare direttamente un file JSON.');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Save persistent stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  // Load lesson JSON from URL
  const loadLessonFromFile = async (fileUrl: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lessonData: LessonPackage = await res.json();
      startLesson(lessonData);
    } catch (err: any) {
      setLoadError(`Errore caricamento lezione: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startLesson = (lesson: LessonPackage) => {
    setCurrentLesson(lesson);
    setCurrentExerciseIndex(0);
    setIsLessonFinished(false);
    setCorrectCount(0);
    setIncorrectExercises([]);
    resetExerciseInputs();
  };

  const resetExerciseInputs = () => {
    setSelectedOption(null);
    setSelectedMultiOptions([]);
    setAssembledSentence([]);
    setMatchedPairIds([]);
    setUserWrittenText('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
  };

  const currentExercise = currentLesson?.exercises[currentExerciseIndex];

  // Answer Validation
  const handleCheckAnswer = useCallback(() => {
    if (!currentExercise || isAnswerChecked) return;

    let correct = false;
    const ex = currentExercise;

    switch (ex.type) {
      case 'single_choice':
      case 'listening':
      case 'fill_blank': {
        correct = selectedOption === ex.correctAnswer;
        break;
      }
      case 'multiple_choice': {
        const correctAnswers = Array.isArray(ex.correctAnswer)
          ? ex.correctAnswer
          : [ex.correctAnswer as string];
        const hasAll = correctAnswers.every(a => selectedMultiOptions.includes(a));
        const noExtra = selectedMultiOptions.every(a => correctAnswers.includes(a));
        correct = hasAll && noExtra;
        break;
      }
      case 'drag_sentence': {
        const targetSentence = ex.correctSentence || [];
        correct =
          assembledSentence.length === targetSentence.length &&
          assembledSentence.every((w, i) => w.trim() === targetSentence[i].trim());
        break;
      }
      case 'matching_pairs': {
        const totalPairs = ex.pairs?.length || 0;
        correct = matchedPairIds.length === totalPairs;
        break;
      }
      case 'writing': {
        const cleanInput = userWrittenText.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
        const accepted = (ex.acceptedAnswers || []).map(a =>
          a.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
        );
        if (ex.correctAnswer && typeof ex.correctAnswer === 'string') {
          accepted.push(ex.correctAnswer.trim().toLowerCase());
        }
        if (ex.targetText) {
          accepted.push(ex.targetText.trim().toLowerCase());
        }
        correct = accepted.some(ans => ans === cleanInput || cleanInput.includes(ans) || ans.includes(cleanInput));
        break;
      }
      default:
        correct = true;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      soundEffects.playSuccess();
      setCorrectCount(c => c + 1);
      setStats(prev => ({
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        correctAnswered: prev.correctAnswered + 1,
        totalScore: prev.totalScore + 10,
        streak: prev.streak + 1
      }));
    } else {
      soundEffects.playIncorrect();
      setIncorrectExercises(prev => [...prev, ex]);
      setStats(prev => ({
        ...prev,
        totalAnswered: prev.totalAnswered + 1,
        streak: 0
      }));
    }
  }, [
    currentExercise,
    isAnswerChecked,
    selectedOption,
    selectedMultiOptions,
    assembledSentence,
    matchedPairIds,
    userWrittenText
  ]);

  const handleNextExercise = () => {
    if (!currentLesson) return;

    if (currentExerciseIndex < currentLesson.exercises.length - 1) {
      setCurrentExerciseIndex(i => i + 1);
      resetExerciseInputs();
    } else {
      // Lesson Finished!
      setIsLessonFinished(true);
      resetExerciseInputs();
      if (currentLesson.id) {
        setStats(prev => ({
          ...prev,
          completedLessons: Array.from(new Set([...prev.completedLessons, currentLesson.id]))
        }));
      }
    }
  };

  const handleSkipExercise = () => {
    if (!currentLesson || isAnswerChecked) return;
    if (currentExercise) {
      setIncorrectExercises(prev => [...prev, currentExercise]);
    }
    handleNextExercise();
  };

  const handleUploadCustomLesson = (lesson: LessonPackage) => {
    const updated = [lesson, ...customLessons.filter(l => l.id !== lesson.id)];
    setCustomLessons(updated);
    try {
      localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(updated));
    } catch {}
    startLesson(lesson);
  };

  const handleReviewMistakes = () => {
    if (!currentLesson || incorrectExercises.length === 0) return;
    const mistakesLesson: LessonPackage = {
      ...currentLesson,
      title: `Ripasso: ${currentLesson.title}`,
      exercises: [...incorrectExercises]
    };
    startLesson(mistakesLesson);
  };

  // Helper for feedback correct answer display
  const getCorrectAnswerDisplay = () => {
    if (!currentExercise) return '';
    const ex = currentExercise;
    if (ex.type === 'drag_sentence') {
      return (ex.correctSentence || []).join(' ');
    }
    if (ex.type === 'multiple_choice') {
      return Array.isArray(ex.correctAnswer) ? ex.correctAnswer.join(' | ') : String(ex.correctAnswer);
    }
    if (ex.type === 'writing') {
      return (ex.acceptedAnswers || [])[0] || (ex.correctAnswer as string) || ex.targetText || '';
    }
    return String(ex.correctAnswer || ex.targetText || '');
  };

  const totalExercises = currentLesson?.exercises.length || 0;
  const answeredInSession = currentExerciseIndex + (isAnswerChecked ? 1 : 0);
  const currentAccuracy = answeredInSession > 0 ? Math.round((correctCount / answeredInSession) * 100) : 100;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1A1A] font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Bento Header */}
      <Header
        currentLesson={currentLesson}
        currentIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        stats={stats}
        onOpenSelector={() => setIsSelectorOpen(true)}
        onOpenJsonEditor={() => setIsJsonEditorOpen(true)}
        onUploadClick={() => setIsSelectorOpen(true)}
      />

      {/* Main Bento Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-12 gap-5 lg:gap-6 max-w-[1600px] w-full mx-auto">
        {/* Left Column: Public Library & File Status */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-5 order-2 lg:order-1">
          {/* Bento Card 1: Public Library */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex-1 flex flex-col shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Public Library
              </h2>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                Vedi tutte
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[340px] pr-1">
              {/* Manifest Lessons */}
              {manifest.map((item) => {
                const isActive = currentLesson?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => loadLessonFromFile(item.file)}
                    className={`p-3 rounded-xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-100'
                        : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>
                        {item.title}
                      </p>
                      <span className="text-xs ml-1 shrink-0">{item.flag}</span>
                    </div>
                    <p className={`text-[11px] uppercase font-bold mt-1 tracking-wider ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {item.language} • {item.level}
                    </p>
                  </div>
                );
              })}

              {/* Custom uploaded lessons */}
              {customLessons.map((item) => {
                const isActive = currentLesson?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => startLesson(item)}
                    className={`p-3 rounded-xl transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-100'
                        : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono">Custom</span>
                    </div>
                    <p className={`text-[11px] uppercase font-bold mt-1 tracking-wider ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {item.language} • {item.exercises.length} Qs
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bento Card 2: File Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shrink-0 shadow-2xs">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              File Status
            </h2>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
              <span className="text-gray-700 font-medium truncate">
                {currentLesson?.id ? `${currentLesson.id}.json` : 'lesson_package.json'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 font-mono">
              {currentLesson ? `${currentLesson.language} | ${currentLesson.level} | ${totalExercises} Questions` : 'Ready to load'}
            </p>
          </div>
        </aside>

        {/* Center Column: Exercise Bento Arena & Score Hub */}
        <section className="col-span-12 lg:col-span-6 flex flex-col gap-5 order-1 lg:order-2">
          {/* Main Exercise Arena Card */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col justify-between relative shadow-2xs min-h-[440px]">
            {isLoading ? (
              <div className="text-center py-24 space-y-3 m-auto">
                <Loader2 size={36} className="animate-spin mx-auto text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Caricamento lezione...</p>
              </div>
            ) : loadError ? (
              <div className="text-center py-16 space-y-4 m-auto max-w-sm">
                <AlertCircle size={40} className="mx-auto text-rose-500" />
                <h3 className="text-lg font-bold text-gray-900">Errore di Caricamento</h3>
                <p className="text-xs text-gray-500">{loadError}</p>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-xs cursor-pointer hover:bg-indigo-700"
                >
                  Sfoglia Lezioni
                </button>
              </div>
            ) : isLessonFinished && currentLesson ? (
              <LessonSummary
                lesson={currentLesson}
                totalAnswered={currentLesson.exercises.length}
                correctAnswers={correctCount}
                incorrectExercises={incorrectExercises}
                onRetryLesson={() => startLesson(currentLesson)}
                onReviewMistakes={handleReviewMistakes}
                onChooseAnother={() => setIsSelectorOpen(true)}
              />
            ) : currentExercise && currentLesson ? (
              <div className="flex flex-col justify-between h-full space-y-4">
                {/* Question metadata badge */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    QUESTION {String(currentExerciseIndex + 1).padStart(2, '0')} / {String(totalExercises).padStart(2, '0')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                      {currentLesson.flag} {currentLesson.language}
                    </span>
                    <span className="text-xs text-gray-400 capitalize hidden sm:inline">
                      • {currentExercise.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Main Dynamic Exercise Runner */}
                <div className="flex-1 py-2">
                  {currentExercise.type === 'single_choice' && (
                    <SingleChoiceExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      selectedOption={selectedOption}
                      onSelectOption={setSelectedOption}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'multiple_choice' && (
                    <MultipleChoiceExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      selectedOptions={selectedMultiOptions}
                      onToggleOption={(opt) => {
                        if (isAnswerChecked) return;
                        setSelectedMultiOptions(prev =>
                          prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                        );
                      }}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'drag_sentence' && (
                    <DragSentenceExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      assembledSentence={assembledSentence}
                      onUpdateAssembled={setAssembledSentence}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'matching_pairs' && (
                    <MatchingPairsExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      matchedPairIds={matchedPairIds}
                      onUpdateMatched={setMatchedPairIds}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'listening' && (
                    <ListeningExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      selectedOption={selectedOption}
                      onSelectOption={setSelectedOption}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'writing' && (
                    <WritingExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      userText={userWrittenText}
                      onUpdateText={setUserWrittenText}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}

                  {currentExercise.type === 'fill_blank' && (
                    <FillBlankExercise
                      exercise={currentExercise}
                      languageCode={currentLesson.languageCode}
                      selectedOption={selectedOption}
                      onSelectOption={setSelectedOption}
                      isAnswerChecked={isAnswerChecked}
                      isCorrect={isCorrect}
                      onSubmit={handleCheckAnswer}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Bento Card 2: Bento Score & Action Hub */}
          <div className="h-24 bg-indigo-900 rounded-2xl p-5 sm:p-6 flex items-center justify-between text-white shrink-0 shadow-xs">
            <div>
              <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">
                {isLessonFinished ? 'Risultato Finale' : 'Current Score'}
              </p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                {currentAccuracy}%{' '}
                <span className="text-xs sm:text-sm font-normal opacity-70 ml-2">
                  {correctCount}/{totalExercises} Corrette
                  {stats.streak > 0 && ` • 🔥 ${stats.streak}`}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isLessonFinished ? (
                <>
                  <button
                    id="bento-retry-btn"
                    type="button"
                    onClick={() => currentLesson && startLesson(currentLesson)}
                    className="px-3.5 sm:px-4 py-2 bg-indigo-800/90 hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer text-indigo-100 hover:text-white"
                  >
                    Ripeti
                  </button>
                  <button
                    id="bento-change-lesson-btn"
                    type="button"
                    onClick={() => setIsSelectorOpen(true)}
                    className="px-4 sm:px-5 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Altre Lezioni</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <>
                  {!isAnswerChecked && currentExercise && (
                    <button
                      id="bento-skip-btn"
                      type="button"
                      onClick={handleSkipExercise}
                      className="px-4 sm:px-5 py-2 bg-indigo-800/90 hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer text-indigo-200 hover:text-white"
                    >
                      Salta
                    </button>
                  )}

                  {isAnswerChecked && (
                    <button
                      id="bento-next-btn"
                      type="button"
                      onClick={handleNextExercise}
                      className="px-5 sm:px-6 py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{currentExerciseIndex === totalExercises - 1 ? 'Termina Lezione' : 'Prossimo Esercizio'}</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Reference Board & JSON Metadata */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-5 order-3">
          <ReferenceBoard exercise={currentExercise} lesson={currentLesson} />
          <JsonMetaCard
            lesson={currentLesson}
            currentExercise={currentExercise}
            onOpenJsonEditor={() => setIsJsonEditorOpen(true)}
          />
        </aside>
      </main>

      {/* Floating Bottom Feedback Banner (Active when checked and lesson is in progress) */}
      {!isLessonFinished && currentExercise && (
        <ExerciseFeedback
          isAnswerChecked={isAnswerChecked}
          isCorrect={isCorrect}
          correctAnswerText={getCorrectAnswerDisplay()}
          explanation={currentExercise.explanation}
          targetText={currentExercise.targetText}
          romanization={currentExercise.romanization}
          languageCode={currentLesson?.languageCode}
          onNext={handleNextExercise}
          isLastQuestion={
            Boolean(currentLesson && currentExerciseIndex === currentLesson.exercises.length - 1)
          }
        />
      )}

      {/* Lesson Selector Modal */}
      <LessonSelector
        isOpen={isSelectorOpen}
        manifest={manifest}
        customLessons={customLessons}
        activeLessonId={currentLesson?.id}
        onSelectLessonFromManifest={(item) => loadLessonFromFile(item.file)}
        onSelectCustomLesson={(lesson) => startLesson(lesson)}
        onUploadJson={handleUploadCustomLesson}
        onClose={() => setIsSelectorOpen(false)}
      />

      {/* JSON Editor Modal */}
      <JsonEditorModal
        isOpen={isJsonEditorOpen}
        currentLesson={currentLesson}
        onApplyJson={handleUploadCustomLesson}
        onClose={() => setIsJsonEditorOpen(false)}
      />
    </div>
  );
}
