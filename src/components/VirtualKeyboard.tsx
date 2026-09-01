import React, { useState } from 'react';
import { Keyboard, ChevronDown, ChevronUp } from 'lucide-react';

interface VirtualKeyboardProps {
  languageCode: string;
  onInsertChar: (char: string) => void;
}

const PINYIN_CHARS = [
  'ā', 'á', 'ǎ', 'à',
  'ē', 'é', 'ě', 'è',
  'ī', 'í', 'ǐ', 'ì',
  'ō', 'ó', 'ǒ', 'ò',
  'ū', 'ú', 'ǔ', 'ù',
  'ǖ', 'ǘ', 'ǚ', 'ǜ'
];

const RUSSIAN_CHARS = [
  'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й',
  'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф',
  'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'
];

const KOREAN_CHARS = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
  'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅒ', 'ㅖ'
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  languageCode,
  onInsertChar
}) => {
  const [isOpen, setIsOpen] = useState(false);

  let chars: string[] = [];
  let title = 'Caratteri speciali';

  if (languageCode.startsWith('zh')) {
    chars = PINYIN_CHARS;
    title = 'Toni Pinyin (ā, á, ǎ, à...)';
  } else if (languageCode.startsWith('ru')) {
    chars = RUSSIAN_CHARS;
    title = 'Tastierino Cirillico';
  } else if (languageCode.startsWith('ko')) {
    chars = KOREAN_CHARS;
    title = 'Tastierino Hangul';
  } else {
    chars = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];
    title = 'Caratteri speciali';
  }

  return (
    <div id="virtual-keyboard-container" className="mt-3 border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
      <button
        id="toggle-virtual-keyboard-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100/70 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Keyboard size={15} className="text-stone-500" />
          <span>{title}</span>
          <span className="text-stone-400 font-normal">({chars.length} simboli)</span>
        </span>
        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {isOpen && (
        <div className="p-2.5 bg-white border-t border-stone-200 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {chars.map((char, index) => (
            <button
              key={`${char}-${index}`}
              id={`vk-char-${index}`}
              type="button"
              onClick={() => onInsertChar(char)}
              className="px-2.5 py-1.5 text-sm font-medium bg-stone-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-stone-200 rounded-lg transition-colors active:scale-95 shadow-2xs font-mono"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
