import { LessonPackage, Exercise } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  lesson?: LessonPackage;
}

/**
 * Parses native JSON errors to extract precise 1-based line & column numbers.
 */
export function parseJsonSyntaxError(errorMsg: string, jsonText: string): { line: number; column?: number; detail: string } {
  // Pattern 1: "at line 15 column 4" or "line 15 column 4"
  const lineColMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    const line = parseInt(lineColMatch[1], 10);
    const column = parseInt(lineColMatch[2], 10);
    return { line, column, detail: errorMsg };
  }

  // Pattern 2: "at line 15" or "line 15"
  const lineMatch = errorMsg.match(/line\s+(\d+)/i);
  if (lineMatch) {
    const line = parseInt(lineMatch[1], 10);
    return { line, detail: errorMsg };
  }

  // Pattern 3: "at position 345" or "position 345" (V8 / Chrome default)
  const posMatch = errorMsg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    if (!isNaN(pos) && pos >= 0) {
      const clampedPos = Math.min(pos, jsonText.length);
      const textBefore = jsonText.slice(0, clampedPos);
      const lines = textBefore.split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      return { line, column, detail: errorMsg };
    }
  }

  return { line: 1, detail: errorMsg };
}

export function validateLessonJson(jsonStringOrObj: string | unknown): ValidationResult {
  const errors: string[] = [];
  let data: any;

  if (typeof jsonStringOrObj === 'string') {
    try {
      data = JSON.parse(jsonStringOrObj);
    } catch (e: any) {
      const errInfo = parseJsonSyntaxError(e.message || '', jsonStringOrObj);
      const colText = errInfo.column ? `, Colonna ${errInfo.column}` : '';
      return {
        isValid: false,
        errors: [`Errore di sintassi JSON a Riga ${errInfo.line}${colText}: ${e.message || 'virgola, parentesi o virgoletta mancante'}`]
      };
    }
  } else {
    data = jsonStringOrObj;
  }

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Il file JSON deve contenere un oggetto principale valido {} a Riga 1.'] };
  }

  // Basic metadata validation
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Campo "title" obbligatorio mancante o non valido (es. "title": "Nome Lezione").');
  }

  if (!data.description || typeof data.description !== 'string') {
    data.description = data.title || 'Lezione personalizzata';
  }

  if (!data.category || typeof data.category !== 'string') {
    data.category = 'Personalizzate';
  }

  if (!data.language || typeof data.language !== 'string') {
    data.language = 'Cinese';
  }

  if (!data.languageCode || typeof data.languageCode !== 'string') {
    data.languageCode = 'zh-CN';
  }

  if (!data.flag) {
    if (String(data.language).toLowerCase().includes('cin')) data.flag = '🇨🇳';
    else if (String(data.language).toLowerCase().includes('cor')) data.flag = '🇰🇷';
    else if (String(data.language).toLowerCase().includes('rus')) data.flag = '🇷🇺';
    else if (String(data.language).toLowerCase().includes('gia')) data.flag = '🇯🇵';
    else data.flag = '🌐';
  }

  if (!data.level || !['Principiante', 'Intermedio', 'Avanzato'].includes(data.level)) {
    data.level = 'Principiante';
  }

  if (!data.id) {
    data.id = 'lesson_' + Date.now();
  }

  // Exercises validation
  if (!Array.isArray(data.exercises) || data.exercises.length === 0) {
    errors.push('Il JSON deve contenere un array "exercises" con almeno 1 esercizio.');
  } else {
    data.exercises.forEach((ex: any, index: number) => {
      const exNum = index + 1;
      if (!ex.id) ex.id = `ex_${index}_${Date.now()}`;
      if (!ex.type) {
        errors.push(`Esercizio #${exNum}: campo "type" mancante.`);
        return;
      }

      if (!ex.prompt) {
        errors.push(`Esercizio #${exNum} (${ex.type}): campo "prompt" mancante.`);
      }

      switch (ex.type) {
        case 'single_choice':
        case 'multiple_choice':
          if (!Array.isArray(ex.options) || ex.options.length < 2) {
            errors.push(`Esercizio #${exNum} (${ex.type}): "options" deve contenere almeno 2 scelte come stringhe.`);
          }
          if (ex.correctAnswer === undefined) {
            errors.push(`Esercizio #${exNum} (${ex.type}): "correctAnswer" mancante.`);
          }
          break;

        case 'drag_sentence':
          if (!Array.isArray(ex.sentenceParts) && !Array.isArray(ex.words)) {
            errors.push(`Esercizio #${exNum} (drag_sentence): campo "sentenceParts" (array di parole) mancante.`);
          } else if (Array.isArray(ex.words) && !Array.isArray(ex.sentenceParts)) {
            ex.sentenceParts = ex.words;
          }

          if (!Array.isArray(ex.correctSentence) && !Array.isArray(ex.correctOrder)) {
            errors.push(`Esercizio #${exNum} (drag_sentence): campo "correctSentence" (array ordinato) mancante.`);
          } else if (Array.isArray(ex.correctOrder) && !Array.isArray(ex.correctSentence)) {
            ex.correctSentence = ex.correctOrder;
          }
          break;

        case 'matching_pairs':
          if (!Array.isArray(ex.pairs) || ex.pairs.length < 2) {
            errors.push(`Esercizio #${exNum} (matching_pairs): "pairs" deve contenere almeno 2 coppie {left, right}.`);
          }
          break;

        case 'listening':
          if (!ex.audioText && !ex.targetText) {
            errors.push(`Esercizio #${exNum} (listening): "audioText" o "targetText" mancante per l'ascolto.`);
          }
          break;

        case 'writing':
          if (ex.correctAnswer === undefined && !Array.isArray(ex.acceptedAnswers)) {
            errors.push(`Esercizio #${exNum} (writing): campo "correctAnswer" o "acceptedAnswers" mancante.`);
          }
          break;

        case 'fill_blank':
          if (!ex.blankSentence) {
            errors.push(`Esercizio #${exNum} (fill_blank): campo "blankSentence" con [blank] mancante.`);
          }
          if (ex.correctAnswer === undefined && !Array.isArray(ex.acceptedAnswers)) {
            errors.push(`Esercizio #${exNum} (fill_blank): campo "correctAnswer" mancante.`);
          }
          break;

        default:
          break;
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    lesson: errors.length === 0 ? (data as LessonPackage) : undefined
  };
}

export const SAMPLE_JSON_TEMPLATE: LessonPackage = {
  id: "custom_demo_lesson",
  title: "Lezione Personalizzata Completa",
  description: "Esempio interattivo con tutti i 7 tipi di esercizi disponibili",
  language: "Cinese",
  languageCode: "zh-CN",
  flag: "🇨🇳",
  level: "Principiante",
  category: "Personalizzate",
  exercises: [
    {
      id: "demo_01",
      type: "single_choice",
      prompt: "Quale carattere rappresenta il numero 1?",
      targetText: "一",
      romanization: "yī",
      translation: "Uno",
      options: ["一", "二", "三", "四"],
      correctAnswer: "一",
      explanation: "一 (yī) è il numero 1 in caratteri cinesi."
    },
    {
      id: "demo_02",
      type: "drag_sentence",
      prompt: "Trascina le parole per formare il saluto 'Ciao a tutti'",
      sentenceParts: ["大家", "好", "早上"],
      correctSentence: ["大家", "好"],
      romanization: "Dàjiā hǎo",
      translation: "Ciao a tutti",
      explanation: "大家好 (Dàjiā hǎo) significa 'Ciao a tutti'."
    },
    {
      id: "demo_03",
      type: "matching_pairs",
      prompt: "Abbina ciascun carattere al suo significato corretto",
      pairs: [
        { id: "p1", left: "一", right: "Uno", leftSub: "yī" },
        { id: "p2", left: "二", right: "Due", leftSub: "èr" },
        { id: "p3", left: "三", right: "Tre", leftSub: "sān" },
        { id: "p4", left: "人", right: "Persona", leftSub: "rén" }
      ]
    },
    {
      id: "demo_04",
      type: "listening",
      prompt: "Ascolta l'audio e seleziona la parola corretta",
      audioText: "你好",
      romanization: "Nǐ hǎo",
      options: ["你好", "再见", "谢谢"],
      correctAnswer: "你好"
    },
    {
      id: "demo_05",
      type: "writing",
      prompt: "Scrivi in pinyin o caratteri il significato di 'Grazie' (Xièxie / 谢谢)",
      targetText: "谢谢",
      romanization: "Xièxie",
      correctAnswer: "xiexie",
      acceptedAnswers: ["xiexie", "xièxie", "谢谢", "xie xie"],
      hint: "Inizia con 'x'"
    },
    {
      id: "demo_06",
      type: "fill_blank",
      prompt: "Completa la frase con la parola mancante",
      blankSentence: "你好，我是 [blank] 国人。",
      options: ["中", "美", "英", "法"],
      correctAnswer: "中",
      romanization: "Zhōngguó rén",
      translation: "Ciao, sono cinese."
    },
    {
      id: "demo_07",
      type: "multiple_choice",
      prompt: "Quali di questi sono numeri cinesi?",
      options: ["一 (1)", "二 (2)", "人 (Persona)", "三 (3)"],
      correctAnswer: ["一 (1)", "二 (2)", "三 (3)"],
      explanation: "一, 二 e 三 sono numeri, mentre 人 significa persona."
    }
  ]
};
