/**
 * Resepedia Cozy RPG — Procedural Sound Synthesizer (Web Audio API)
 * Zero external audio files, completely offline, lightweight (< 2 KB).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const prefs = localStorage.getItem('culinary_prefs');
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (typeof parsed.soundEffectsEnabled === 'boolean') {
        return parsed.soundEffectsEnabled;
      }
    }
  } catch {}
  return true; // Default: sound enabled
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const prefs = localStorage.getItem('culinary_prefs');
    const parsed = prefs ? JSON.parse(prefs) : {};
    parsed.soundEffectsEnabled = enabled;
    localStorage.setItem('culinary_prefs', JSON.stringify(parsed));
    window.dispatchEvent(new CustomEvent('sound-pref-changed', { detail: { enabled } }));
  } catch {}
}

/**
 * Ketukan kayu taktil saat menekan tombol, mencentang bahan, atau memilih tab
 */
export function playClickSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {}
}

/**
 * Suara gesekan perkamen / lembar gulungan saat membuka tab atau detail resep
 */
export function playPageTurnSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(540, now + 0.04);
    osc.frequency.linearRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch {}
}

/**
 * Tangga nada Gamelan Pentatonik / RPG Victory Chime
 * Saat pengguna menyelesaikan hidangan di Mode Perapian (+XP)
 */
export function playLevelUpFanfare() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Tangga nada pelog/slendro hangat (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.11);

      const noteStart = now + index * 0.11;
      const noteDuration = 0.35;

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration + 0.02);
    });
  } catch {}
}

/**
 * Lonceng perak saat item bahan dicentang di kotak inventori
 */
export function playChimeSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {}
}
