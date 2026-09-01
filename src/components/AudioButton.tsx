import React, { useState } from 'react';
import { Volume2, Snail } from 'lucide-react';
import { speakText } from '../utils/audio';

interface AudioButtonProps {
  text?: string;
  langCode?: string;
  size?: 'sm' | 'md' | 'lg';
  slow?: boolean;
  className?: string;
  label?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  langCode = 'zh-CN',
  size = 'md',
  slow = false,
  className = '',
  label
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!text) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await speakText(text, langCode, slow ? 0.65 : 1.0);
    } finally {
      setIsPlaying(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1',
    md: 'p-2.5 text-sm gap-2',
    lg: 'p-3.5 text-base gap-2.5'
  }[size];

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  }[size];

  return (
    <button
      id={`audio-btn-${text.slice(0, 8).replace(/\s+/g, '-')}`}
      type="button"
      onClick={handleClick}
      title={slow ? "Ascolta pronuncia lenta (0.7x)" : "Ascolta pronuncia audio"}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 border active:scale-95 cursor-pointer select-none ${
        slow
          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
      } ${isPlaying ? 'ring-2 ring-indigo-400 ring-offset-1 animate-pulse' : ''} ${sizeClasses} ${className}`}
    >
      {slow ? (
        <Snail size={iconSizes} className={isPlaying ? 'animate-bounce' : ''} />
      ) : (
        <Volume2 size={iconSizes} className={isPlaying ? 'animate-pulse text-indigo-600' : ''} />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};
