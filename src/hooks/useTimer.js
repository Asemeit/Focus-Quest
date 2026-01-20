import { useState, useEffect, useRef } from 'react';

export function useTimer(initialMinutes = 25, onComplete) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('FOCUS'); // FOCUS, SHORT_BREAK, LONG_BREAK

  // Use a Ref to store the target end time to prevent re-renders breaking logic
  const endTimeRef = useRef(null);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      // 1. If we don't have a target time yet (just started/resumed), calculate it
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      // 2. Run interval slightly faster (e.g. 200ms) to prevent "skipping" a second visually
      // but only update state when the integer second changes.
      interval = setInterval(() => {
        const now = Date.now();
        const diff = endTimeRef.current - now;
        const secondsRemaining = Math.max(0, Math.ceil(diff / 1000));

        // Only update state if it changed to avoid unnecessary renders
        setTimeLeft(prev => {
          if (prev !== secondsRemaining) return secondsRemaining;
          return prev;
        });

        if (secondsRemaining <= 0) {
          setIsActive(false);
          endTimeRef.current = null;
          if (onComplete) onComplete(mode);
          clearInterval(interval);
        }
      }, 100);

    } else {
      // Paused or Finished: Clear the target so we recalculate on resume
      endTimeRef.current = null;
    }

    return () => clearInterval(interval);
  }, [isActive, mode]); // Removed timeLeft from dependency to prevent interval recreation

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = (newMinutes) => {
    setIsActive(false);
    endTimeRef.current = null; // Clear target
    setTimeLeft(newMinutes * 60);
  };

  const setTimerMode = (newMode) => {
    setMode(newMode);
    switch (newMode) {
      case 'FOCUS':
        resetTimer(25);
        break;
      case 'SHORT_BREAK':
        resetTimer(5);
        break;
      case 'LONG_BREAK':
        resetTimer(15);
        break;
      default:
        resetTimer(25);
    }
  };

  return { timeLeft, isActive, toggleTimer, resetTimer, mode, setTimerMode };
}
