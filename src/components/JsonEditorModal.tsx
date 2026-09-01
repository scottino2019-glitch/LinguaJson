import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LessonPackage } from '../types';
import { Code2, Play, Download, Copy, Check, AlertCircle, X, Sparkles, Wand2, FileCode } from 'lucide-react';
import { validateLessonJson, parseJsonSyntaxError, SAMPLE_JSON_TEMPLATE } from '../utils/jsonValidator';

interface JsonEditorModalProps {
  isOpen: boolean;
  currentLesson: LessonPackage | null;
  onApplyJson: (lesson: LessonPackage) => void;
  onClose: () => void;
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  isOpen,
  currentLesson,
  onApplyJson,
  onClose
}) => {
  const [jsonCode, setJsonCode] = useState<string>(() => {
    return JSON.stringify(currentLesson || SAMPLE_JSON_TEMPLATE, null, 2);
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setJsonCode(JSON.stringify(currentLesson || SAMPLE_JSON_TEMPLATE, null, 2));
      setErrors([]);
    }
  }, [isOpen, currentLesson]);

  // Synchronize scroll between gutter and textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Update cursor position line & column
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const linesBefore = text.slice(0, selStart).split('\n');
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  // Handle Tab key inside textarea to insert 2 spaces without losing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setJsonCode(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      }, 0);
    }
  };

  // Calculate lines array
  const lines = useMemo(() => jsonCode.split('\n'), [jsonCode]);
  const totalLines = lines.length;

  if (!isOpen) return null;

  const handleApply = () => {
    const res = validateLessonJson(jsonCode);
    if (!res.isValid || !res.lesson) {
      setErrors(res.errors);
    } else {
      setErrors([]);
      onApplyJson(res.lesson);
      onClose();
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonCode);
      setJsonCode(JSON.stringify(parsed, null, 2));
      setErrors([]);
      setFormatSuccess(true);
      setTimeout(() => setFormatSuccess(false), 1500);
    } catch (err: any) {
      const errInfo = parseJsonSyntaxError(err.message || '', jsonCode);
      const colText = errInfo.column ? `, Colonna ${errInfo.column}` : '';
      const errMsg = `Errore di sintassi a Riga ${errInfo.line}${colText}: ${err.message || 'virgola, parentesi o virgoletta mancante'}`;
      setErrors([errMsg]);
    }
  };

  const handleLoadTemplate = () => {
    setJsonCode(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2));
    setErrors([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    try {
      const parsed = JSON.parse(jsonCode);
      const filename = `${parsed.id || 'lezione_personalizzata'}.json`;
      const blob = new Blob([jsonCode], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Impossibile scaricare: verifica che il codice JSON sia sintatticamente valido.');
    }
  };

  return (
    <div
      id="json-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Card */}
      <div
        id="json-editor-content"
        className="relative bg-[#1E1E1E] rounded-2xl sm:rounded-3xl w-full max-w-5xl h-[92dvh] sm:h-[88vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden z-10 text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-800 flex items-center justify-between gap-2 sm:gap-3 bg-[#181818] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Code2 size={18} className="sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  Editor & Creatore JSON
                </h3>
                <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded hidden sm:inline">
                  {totalLines} righe
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate hidden sm:block">
                Con numeri di riga e segnalazione precisa di riga e colonna degli errori
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="editor-format-btn"
              type="button"
              onClick={handleFormat}
              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800/80 hover:bg-indigo-900/80 rounded-lg sm:rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Formatta e indenta il JSON automaticamente (Bacchetta Magica)"
            >
              {formatSuccess ? <Check size={14} className="text-emerald-400" /> : <Wand2 size={14} className="text-indigo-400" />}
              <span className="hidden md:inline">{formatSuccess ? 'Formattato!' : 'Formatta'}</span>
            </button>

            <button
              id="editor-template-btn"
              type="button"
              onClick={handleLoadTemplate}
              className="px-2.5 py-1.5 text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg sm:rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Carica template con tutti i 7 tipi di esercizi (Stellina)"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Template Esempi</span>
            </button>

            <button
              id="editor-copy-btn"
              type="button"
              onClick={handleCopy}
              className="p-1.5 sm:p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Copia codice JSON negli appunti"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>

            <button
              id="editor-download-btn"
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:p-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Scarica file .json su disco"
            >
              <Download size={16} />
            </button>

            <button
              id="close-json-editor-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
              title="Chiudi editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Documentation Banner */}
        <div className="px-3 sm:px-4 py-2 bg-[#141414] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar">
            <span className="font-bold text-[11px] text-gray-300 shrink-0">Tipi Supportati:</span>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">single_choice</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">multiple_choice</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">drag_sentence</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">matching_pairs</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">listening</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">writing</code>
            <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded border border-gray-800 font-mono text-[10px] sm:text-[11px]">fill_blank</code>
          </div>
        </div>

        {/* Professional Code Editor with Line Numbers Gutter */}
        <div className="flex-1 bg-[#1E1E1E] overflow-hidden relative flex flex-row font-mono text-sm leading-[1.6]">
          {/* Line Numbers Gutter */}
          <div
            ref={gutterRef}
            className="w-11 sm:w-14 bg-[#181818] border-r border-gray-800 text-gray-500 py-3 select-none overflow-hidden text-right pr-2 sm:pr-3 shrink-0"
            style={{ fontSize: '13px', lineHeight: '1.6' }}
            aria-hidden="true"
          >
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const isCurrentLine = cursorPos.line === lineNum;
              return (
                <div
                  key={lineNum}
                  className={`transition-colors ${
                    isCurrentLine ? 'text-indigo-400 font-bold' : ''
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>

          {/* Code Textarea Area */}
          <textarea
            ref={textareaRef}
            id="json-textarea-input"
            value={jsonCode}
            onChange={(e) => {
              setJsonCode(e.target.value);
              updateCursorPosition();
            }}
            onScroll={handleScroll}
            onClick={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            className="flex-1 w-full bg-transparent text-emerald-300 font-mono text-base sm:text-sm leading-[1.6] py-3 px-3 sm:px-4 resize-none outline-none overflow-y-auto whitespace-pre selection:bg-indigo-900 selection:text-white"
            placeholder="Incolla o digita qui il tuo JSON..."
          />
        </div>

        {/* Editor Status Bar */}
        <div className="px-3 sm:px-4 py-1.5 bg-[#141414] border-t border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileCode size={13} className="text-indigo-400" />
              <span>JSON</span>
            </span>
            <span>
              Riga: <strong className="text-gray-200">{cursorPos.line}</strong>, Colonna: <strong className="text-gray-200">{cursorPos.col}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>UTF-8</span>
            <span>2 Spazi</span>
          </div>
        </div>

        {/* Clean Errors list with clear Line and Column indicator */}
        {errors.length > 0 && (
          <div className="p-3 bg-rose-950/80 border-t border-rose-800/80 text-rose-200 text-xs max-h-32 overflow-y-auto space-y-1.5 shrink-0">
            <div className="font-bold flex items-center gap-1.5 text-rose-300">
              <AlertCircle size={14} className="text-rose-400 shrink-0" />
              <span>Dettagli errore:</span>
            </div>
            <ul className="space-y-1 pl-1">
              {errors.map((err, i) => (
                <li key={i} className="flex items-start gap-1.5 p-1 rounded text-rose-100">
                  <span className="text-rose-400 select-none">•</span>
                  <span className="flex-1 font-mono text-xs">{err}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-gray-800 bg-[#181818] flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] sm:text-xs text-gray-400 truncate hidden md:inline">
            Premi <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded border border-gray-700 text-[10px]">Tab</kbd> per indentare di 2 spazi.
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="cancel-json-btn"
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm whitespace-nowrap"
            >
              Annulla
            </button>
            <button
              id="apply-test-json-btn"
              type="button"
              onClick={handleApply}
              className="px-4 sm:px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-900/50 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm whitespace-nowrap"
            >
              <Play size={15} />
              <span>Avvia Lezione</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
