// Web Speech Synthesis & Web Audio API sound effects for study mode

class SoundEngine {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore audio context errors if browser blocks audio
    }
  }

  playIncorrect() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.15); // C4
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio context errors
    }
  }

  playClick() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEngine();

export function speakText(text: string, langCode: string = 'zh-CN', rate: number = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === '') {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = Math.max(0.5, Math.min(rate, 1.5));
    utterance.pitch = 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const normalizedLang = langCode.toLowerCase().replace('_', '-');
    const matchedVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === normalizedLang || vLang.startsWith(normalizedLang.slice(0, 2));
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // Fallback timer in case onend is dropped by some browsers
    const timer = setTimeout(() => {
      resolve();
    }, 8000);

    utterance.onend = () => {
      clearTimeout(timer);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function getLanguageCode(langName: string): string {
  const lower = langName.toLowerCase();
  if (lower.includes('cin') || lower.includes('chinese') || lower.includes('zh')) return 'zh-CN';
  if (lower.includes('cor') || lower.includes('korean') || lower.includes('ko')) return 'ko-KR';
  if (lower.includes('rus') || lower.includes('russian') || lower.includes('ru')) return 'ru-RU';
  if (lower.includes('gia') || lower.includes('japan') || lower.includes('ja')) return 'ja-JP';
  if (lower.includes('ita') || lower.includes('italian') || lower.includes('it')) return 'it-IT';
  if (lower.includes('ing') || lower.includes('eng') || lower.includes('en')) return 'en-US';
  if (lower.includes('spa') || lower.includes('es')) return 'es-ES';
  if (lower.includes('fra') || lower.includes('fr')) return 'fr-FR';
  if (lower.includes('ted') || lower.includes('ger') || lower.includes('de')) return 'de-DE';
  return 'zh-CN';
}
