import { useCallback } from 'react';

export function useSound() {
    const playTone = useCallback((frequency, type, duration, startTime = 0) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, []);

    const playStart = useCallback(() => {
        // Power up sound: Low to High
        playTone(220, 'square', 0.1, 0);
        playTone(440, 'square', 0.1, 0.1);
        playTone(880, 'square', 0.2, 0.2);
    }, [playTone]);

    const playPause = useCallback(() => {
        // Power down: High to Low
        playTone(880, 'triangle', 0.1, 0);
        playTone(440, 'triangle', 0.15, 0.1);
    }, [playTone]);

    const playComplete = useCallback(() => {
        // Victory Fanfare
        playTone(523.25, 'square', 0.1, 0); // C5
        playTone(523.25, 'square', 0.1, 0.1);
        playTone(523.25, 'square', 0.1, 0.2);
        playTone(659.25, 'square', 0.4, 0.3); // E5
        playTone(523.25, 'square', 0.1, 0.7); // C5
        playTone(659.25, 'square', 0.6, 0.8); // E5
    }, [playTone]);

    const playLevelUp = useCallback(() => {
        // Magic/Shiny sound (Arpeggio)
        [440, 554, 659, 880, 1108, 1318].forEach((freq, i) => {
            playTone(freq, 'sine', 0.1, i * 0.05);
        });
    }, [playTone]);

    const playClick = useCallback(() => {
        playTone(800, 'square', 0.05, 0);
    }, [playTone]);

    return { playStart, playPause, playComplete, playLevelUp, playClick };
}
