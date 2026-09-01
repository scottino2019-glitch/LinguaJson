export type ExerciseType =
  | 'single_choice'
  | 'multiple_choice'
  | 'drag_sentence'
  | 'matching_pairs'
  | 'listening'
  | 'writing'
  | 'fill_blank';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  leftSub?: string;
  rightSub?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetText?: string;
  romanization?: string;
  translation?: string;
  audioText?: string;
  audioLang?: string;
  options?: string[];
  correctAnswer?: string | string[] | number | number[];
  sentenceParts?: string[]; // for drag_sentence
  correctSentence?: string[]; // ordered tokens
  pairs?: MatchingPair[]; // for matching_pairs
  blankSentence?: string; // e.g. "Saya suka makan [blank] di pagi hari"
  acceptedAnswers?: string[]; // for writing & fill_blank
  caseSensitive?: boolean;
  hint?: string;
  explanation?: string;
  pinyinOrFurigana?: string;
}

export interface LessonPackage {
  id: string;
  title: string;
  description: string;
  language: 'Cinese' | 'Coreano' | 'Russo' | 'Giapponese' | 'Altro' | string;
  languageCode: 'zh-CN' | 'ko-KR' | 'ru-RU' | 'ja-JP' | string;
  flag: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzato';
  category: string;
  tags?: string[];
  author?: string;
  version?: string;
  exercises: Exercise[];
}

export interface LessonManifestItem {
  id: string;
  title: string;
  description: string;
  language: string;
  languageCode: string;
  flag: string;
  level: string;
  category: string;
  exerciseCount: number;
  file: string;
}

export interface UserStats {
  completedLessons: string[];
  totalScore: number;
  totalAnswered: number;
  correctAnswered: number;
  streak: number;
  lastStudyDate?: string;
}
