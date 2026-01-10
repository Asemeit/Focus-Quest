import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const XP_PER_MINUTE = 10;
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

export function useGameLogic() {
    const [xp, setXp] = useState(() => {
        const saved = localStorage.getItem('fq_xp');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [coins, setCoins] = useState(() => {
        const saved = localStorage.getItem('fq_coins');
        return saved ? parseInt(saved, 10) : 0;
    });

    const [unlockedThemes, setUnlockedThemes] = useState(() => {
        const saved = localStorage.getItem('fq_themes');
        return saved ? JSON.parse(saved) : ['default'];
    });

    const [currentTheme, setCurrentTheme] = useState(() => {
        return localStorage.getItem('fq_theme') || 'default';
    });

    const [level, setLevel] = useState(1);

    useEffect(() => {
        localStorage.setItem('fq_xp', xp.toString());
        localStorage.setItem('fq_coins', coins.toString());
        localStorage.setItem('fq_themes', JSON.stringify(unlockedThemes));
        localStorage.setItem('fq_theme', currentTheme);

        // Apply theme to body
        document.body.className = currentTheme === 'default' ? '' : `theme-${currentTheme}`;

        const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => xp < threshold);
        setLevel(newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel);
    }, [xp, coins, unlockedThemes, currentTheme]);

    const addXp = (amount) => {
        const oldLevel = level;
        // 1 XP = 0.1 Coin (or 10 XP = 1 Coin)
        const coinsEarned = Math.floor(amount / 10);

        setCoins(prev => prev + coinsEarned);
        setXp(prev => {
            const newXp = prev + amount;
            // Check for level up immediately with new XP
            const nextLevelIdx = LEVEL_THRESHOLDS.findIndex(threshold => newXp < threshold);
            const nextLevel = nextLevelIdx === -1 ? LEVEL_THRESHOLDS.length : nextLevelIdx;

            if (nextLevel > oldLevel) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            return newXp;
        });
    };

    const buyTheme = (themeId, cost) => {
        if (coins >= cost && !unlockedThemes.includes(themeId)) {
            setCoins(prev => prev - cost);
            setUnlockedThemes(prev => [...prev, themeId]);
            return true;
        }
        return false;
    };

    const equipTheme = (themeId) => {
        if (unlockedThemes.includes(themeId)) {
            setCurrentTheme(themeId);
        }
    };

    const getProgressToNextLevel = () => {
        const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
        const nextThreshold = LEVEL_THRESHOLDS[level] || (currentThreshold + 1000);
        const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        return Math.min(100, Math.max(0, progress));
    };

    return { xp, level, coins, unlockedThemes, currentTheme, addXp, getProgressToNextLevel, buyTheme, equipTheme };
}
