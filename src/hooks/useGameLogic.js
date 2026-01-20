import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const XP_PER_MINUTE = 10;
// Extended to Level 20 so "Legendary" (Lvl 15) is reachable
const LEVEL_THRESHOLDS = [
    0, 100, 300, 600, 1000,      // 1-5 (Knight at 1000)
    1500, 2100, 2800, 3600, 4500, // 6-10
    5500, 6600, 7800, 9100, 10500, // 11-15 (Legendary at 10500)
    12000, 13600, 15300, 17100, 19000 // 16-20
];

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

    const [questHistory, setQuestHistory] = useState(() => {
        const saved = localStorage.getItem('fq_quests');
        if (saved) return JSON.parse(saved);

        // Default / Pre-load for Demo
        return [{
            id: 1700000000000,
            text: 'Python Quest',
            xp: 300,
            date: new Date().toLocaleDateString()
        }];
    });

    // ---------------------------------------------------------
    // HARD FAIL-SAFE: Sync Coins if missing for Python Quest
    // ---------------------------------------------------------
    useEffect(() => {
        // If we have the Python Quest in history...
        const hasPythonQuest = questHistory.some(q => q.id === 1700000000000);

        // ...but we don't have enough XP/Coins to account for it...
        // (Assuming 300 XP / 30 Coins minimum)
        if (hasPythonQuest && xp < 300) {
            console.log("Restoring missing coins for Python Quest...");
            setXp(prev => prev + 300);
            setCoins(prev => prev + 30);
        }
    }, [questHistory]); // Run on mount (or history change)

    useEffect(() => {
        localStorage.setItem('fq_xp', xp.toString());
        localStorage.setItem('fq_coins', coins.toString());
        localStorage.setItem('fq_themes', JSON.stringify(unlockedThemes));
        localStorage.setItem('fq_theme', currentTheme);
        localStorage.setItem('fq_quests', JSON.stringify(questHistory));

        // Apply theme to body
        document.body.className = currentTheme === 'default' ? '' : `theme-${currentTheme}`;

        const newLevel = LEVEL_THRESHOLDS.findIndex(threshold => xp < threshold);
        setLevel(newLevel === -1 ? LEVEL_THRESHOLDS.length : newLevel);
    }, [xp, coins, unlockedThemes, currentTheme, questHistory]);

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

    const saveQuest = (questName, earnedXp) => {
        const newQuest = {
            id: Date.now(),
            text: questName || 'Focus Session',
            xp: earnedXp,
            date: new Date().toLocaleDateString()
        };
        setQuestHistory(prev => [newQuest, ...prev]);
        return newQuest;
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

    return { xp, level, coins, unlockedThemes, currentTheme, questHistory, addXp, saveQuest, getProgressToNextLevel, buyTheme, equipTheme };
}
