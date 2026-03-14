import { useCallback, useRef, useState, useEffect } from 'react';

export function useSounds() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scorekeeper_sounds');
    if (saved === 'true') setEnabled(true);
  }, []);

  const toggleSounds = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem('scorekeeper_sounds', String(next));
      if (next && !ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return next;
    });
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, time: number, duration: number, vol = 0.1) => {
    if (!enabled) return;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = freq;
    
    const startTime = ctx.currentTime + time;
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }, [enabled]);

  const playSaveRound = useCallback(() => {
    playTone(400, 'sine', 0, 0.1);
    playTone(600, 'sine', 0.1, 0.2);
  }, [playTone]);

  const playRankChange = useCallback(() => {
    playTone(300, 'triangle', 0, 0.1);
    playTone(450, 'triangle', 0.1, 0.2);
  }, [playTone]);

  const playVictory = useCallback(() => {
    [0, 0.2, 0.4].forEach((t, i) => playTone(400 + i * 100, 'square', t, 0.2));
    playTone(800, 'square', 0.6, 0.6, 0.2);
  }, [playTone]);

  return { enabled, toggleSounds, playSaveRound, playRankChange, playVictory };
}
