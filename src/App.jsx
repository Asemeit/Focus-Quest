import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Coffee, Zap, Brain, Trophy, ShoppingBag, Lock, Check } from 'lucide-react'
import { useTimer } from './hooks/useTimer'
import { useGameLogic } from './hooks/useGameLogic'
import { useSound } from './hooks/useSound'
import './index.css'

const THEMES = [
  { id: 'default', name: 'Cyberpunk', cost: 0, color: '#d600ff' },
  { id: 'matrix', name: 'Matrix', cost: 50, color: '#00ff00' },
  { id: 'ice', name: 'Ice', cost: 100, color: '#00ffff' },
  { id: 'gold', name: 'Midas', cost: 500, color: '#ffd700' },
];

function App() {
  const { xp, level, coins, unlockedThemes, currentTheme, addXp, getProgressToNextLevel, buyTheme, equipTheme } = useGameLogic();
  const { playStart, playPause, playComplete, playLevelUp, playClick } = useSound();

  // Track previous level to play sound on level up
  const [prevLevel, setPrevLevel] = useState(level);
  const [showShop, setShowShop] = useState(false);
  const [questName, setQuestName] = useState('');

  useEffect(() => {
    if (level > prevLevel) {
      playLevelUp();
      setPrevLevel(level);
    }
  }, [level, prevLevel, playLevelUp]);

  const onTimerComplete = (mode) => {
    playComplete();
    if (mode === 'FOCUS') {
      let earnedXp = 250;
      if (questName.trim()) {
        earnedXp += 50; // Bonus for named quest
      }
      addXp(earnedXp);
      console.log(`Focus session complete! +${earnedXp} XP`);
    }
  };

  const { timeLeft, isActive, toggleTimer, resetTimer, mode, setTimerMode } = useTimer(25, onTimerComplete);

  const handleToggleTimer = () => {
    if (!isActive) {
      if (mode === 'FOCUS' && !questName.trim()) {
        // Optional: Encourage naming, but allow starting without
      }
      playStart();
    } else {
      playPause();
    }
    toggleTimer();
  };


  const handleModeChange = (newMode) => {
    playClick();
    setTimerMode(newMode);
  };

  const handleBuy = (id, cost) => {
    if (buyTheme(id, cost)) {
      playLevelUp(); // Success sound
    } else {
      // Fail sound?
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvatar = () => {
    if (level >= 15) return '/assets/avatar_master_1768066997846.png';
    if (level >= 5) return '/assets/avatar_adept_1768066981656.png';
    return '/assets/avatar_novice_1768066967102.png';
  };

  const getRankTitle = () => {
    if (level >= 15) return 'LEGENDARY';
    if (level >= 5) return 'KNIGHT';
    return 'NOVICE';
  };

  // Calculate Boss HP based on time left (Focus mode only)
  const totalTime = 25 * 60;
  const bossHpPercentage = Math.min(100, (timeLeft / totalTime) * 100);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, textShadow: '4px 4px 0 #000' }}>FOCUS QUEST</h1>
        <button className="pixel-btn secondary" onClick={() => setShowShop(!showShop)} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ShoppingBag size={20} style={{ marginRight: '5px' }} /> SHOP
        </button>
      </div>

      {showShop ? (
        <div className="pixel-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>MERCHANT ({coins} COINS)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {THEMES.map(theme => {
              const isUnlocked = unlockedThemes.includes(theme.id);
              const isEquipped = currentTheme === theme.id;

              return (
                <div key={theme.id} className="pixel-card" style={{ padding: '1rem', border: `2px solid ${theme.color}` }}>
                  <div style={{ color: theme.color, fontWeight: 'bold', marginBottom: '0.5rem' }}>{theme.name}</div>
                  {isUnlocked ? (
                    <button
                      className={`pixel-btn ${isEquipped ? '' : 'secondary'}`}
                      style={{ width: '100%', fontSize: '0.8rem', padding: '5px' }}
                      onClick={() => equipTheme(theme.id)}
                      disabled={isEquipped}
                    >
                      {isEquipped ? <><Check size={14} inline /> EQUIPPED</> : 'EQUIP'}
                    </button>
                  ) : (
                    <button
                      className="pixel-btn"
                      style={{ width: '100%', fontSize: '0.8rem', padding: '5px', filter: coins < theme.cost ? 'grayscale(1)' : 'none' }}
                      onClick={() => handleBuy(theme.id, theme.cost)}
                      disabled={coins < theme.cost}
                    >
                      <Lock size={14} inline style={{ marginRight: '4px' }} /> {theme.cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button className="pixel-btn secondary" onClick={() => setShowShop(false)} style={{ marginTop: '1rem' }}>CLOSE</button>
        </div>
      ) : (
        <>
          {mode === 'FOCUS' && isActive ? (
            <div className="boss-container pixel-card" style={{ marginBottom: '2rem', borderColor: 'var(--danger-color)', boxShadow: '0 0 20px var(--danger-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img
                  src="/assets/boss_cyber_dragon_1768072954913.png"
                  alt="Cyber Dragon Boss"
                  style={{ width: '100px', height: '100px', imageRendering: 'pixelated', animation: 'float 3s ease-in-out infinite' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                    <span>CYBER DRAGON</span>
                    <span>{Math.ceil(bossHpPercentage)}% HP</span>
                  </div>
                  <div className="xp-bar-container" style={{ borderColor: 'var(--danger-color)', boxShadow: 'none' }}>
                    <div
                      className="xp-bar-fill"
                      style={{
                        width: `${bossHpPercentage}%`,
                        background: 'var(--danger-color)',
                        boxShadow: '0 0 10px var(--danger-color)',
                        transition: 'width 1s linear'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <div>RANK</div>
                <div className="stat-value">{getRankTitle()}</div>
              </div>
              <div className="stat-item">
                <div>LEVEL</div>
                <div className="stat-value">{level}</div>
              </div>
            </div>
          )}

          {mode !== 'FOCUS' && (
            <div className="avatar-frame">
              <img src={getAvatar()} alt="Character Avatar" />
            </div>
          )}

          <div className="pixel-card">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <button
                className={`pixel-btn ${mode === 'FOCUS' ? '' : 'secondary'}`}
                onClick={() => handleModeChange('FOCUS')}
              >
                <Brain size={18} style={{ marginRight: '8px' }} /> Focus
              </button>
              <button
                className={`pixel-btn ${mode === 'SHORT_BREAK' ? '' : 'secondary'}`}
                onClick={() => handleModeChange('SHORT_BREAK')}
              >
                <Coffee size={18} style={{ marginRight: '8px' }} /> Short Break
              </button>
              <button
                className={`pixel-btn ${mode === 'LONG_BREAK' ? '' : 'secondary'}`}
                onClick={() => handleModeChange('LONG_BREAK')}
              >
                <Zap size={18} style={{ marginRight: '8px' }} /> Long Break
              </button>
            </div>


            <div style={{ fontSize: '5rem', fontWeight: 'bold', margin: '1rem 0', textShadow: '4px 4px 0 #000' }}>
              {formatTime(timeLeft)}
            </div>

            {mode === 'FOCUS' && !isActive ? (
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  className="pixel-input"
                  placeholder="ENTER QUEST NAME..."
                  value={questName}
                  onChange={(e) => setQuestName(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '2px solid var(--accent-color)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    width: '100%',
                    outline: 'none',
                    textTransform: 'uppercase'
                  }}
                />
                {questName && <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginTop: '5px' }}>+50 XP BONUS ACTIVATED</div>}
              </div>
            ) : (
              mode === 'FOCUS' && (
                <div style={{ marginBottom: '20px', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                  QUEST: {questName || 'UNKNOWN MISSION'}
                </div>
              )
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button className="pixel-btn" onClick={handleToggleTimer} style={{ minWidth: '120px' }}>
                {isActive ? <><Pause inline /> PAUSE</> : <><Play inline /> FIGHT</>}
              </button>
              <button className="pixel-btn secondary" onClick={() => { playClick(); resetTimer(mode === 'FOCUS' ? 25 : mode === 'SHORT_BREAK' ? 5 : 15); }}>
                <RotateCcw inline /> RESET
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>XP Progress</span>
              <span>{xp} XP / {coins} Coins</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{ width: `${getProgressToNextLevel()}%` }}></div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Focus for 25m to earn 250 XP & 25 Coins
            </div>
          </div>
        </>
      )}

      {/* Debug/Cheat for Demo */}
      <button
        style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.2 }}
        onClick={() => { playClick(); addXp(100); }}
      >
        +100 XP
      </button>
    </div>
  )
}

export default App
