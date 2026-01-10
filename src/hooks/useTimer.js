import { useState, useEffect, useRef } from 'react';

export function useTimer(initialMinutes = 25, onComplete) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('FOCUS'); // FOCUS, SHORT_BREAK, LONG_BREAK

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onComplete && onComplete(mode);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onComplete]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = (newMinutes = 25) => {
    setIsActive(false);
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
