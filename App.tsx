
import React, { useState, useEffect } from 'react';
import { UserProgress, Lesson, User, AppSettings, ExerciseType } from './types';
import Dashboard from './components/Dashboard';
import LessonView from './components/LessonView';
import AuthScreen from './components/AuthScreen';
import PairProgramming from './components/PairProgramming';
import { authService } from './services/authService';
import { dbService } from './services/dbService';
import { soundService } from './services/soundService';
import { networkService } from './services/networkService'; // New import
import { SecretType, decodeSecretId } from './utils/secrets';
import { getLessons, getUnits } from './services/curriculum';

const INITIAL_PROGRESS: UserProgress = {
  xp: 0,
  streak: 1,
  hearts: 5, 
  maxHearts: 5,
  completedLessons: [],
  currentLessonId: null,
  xpMultiplier: 1,
  xpMultiplierEndTime: 0,
  streakFreeze: 0,
  redeemedSecrets: [],
  hiddenUnitUnlocked: false,
  mentorModeUnlocked: false,
  openedChests: [],
  consecutiveFails: 0,
  burnoutEndTime: 0
};

const INITIAL_SETTINGS: AppSettings = {
    bionicReading: false,
    offlineMode: false,
    darkMode: false,
    soundEffects: true,
    font: 'sans',
    language: 'en',
    isPublicProfile: true
};

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'lesson' | 'pair'>('dashboard');
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [lessonMode, setLessonMode] = useState<'LEARN' | 'TEST'>('LEARN');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [godMode, setGodMode] = useState(false);
  const [isOnline, setIsOnline] = useState(networkService.isOnline);

  const currentLessons = getLessons(settings.language);
  const currentUnits = getUnits(settings.language);

  useEffect(() => {
    setMounted(true);
    
    // Listen to network changes
    const unsubNet = networkService.subscribe((status) => {
        setIsOnline(status);
        if (status) {
            // If we came back online and have a user, try to sync
            if (user && user.id !== 'offline-guest') {
                dbService.syncProgress(user.id).then((merged) => {
                    if (merged) setUserProgress(merged);
                });
            }
        } else {
            // Went offline
            setSettings(s => ({ ...s, offlineMode: true }));
        }
    });

    return () => unsubNet();
  }, [user]);

  // --- EASTER EGG: KONAMI CODE ---
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let cursor = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[cursor]) {
        cursor++;
        if (cursor === konamiCode.length) {
          setGodMode(prev => !prev);
          soundService.playComplete();
          cursor = 0;
          if (!godMode) alert("🐍 GOD MODE ENABLED: UNLIMITED POWER!");
        }
      } else {
        cursor = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [godMode]);


  useEffect(() => {
    let unsubscribe: () => void;

    try {
      unsubscribe = authService.subscribe(async (appUser) => {
          if (appUser) {
            setUser(appUser);
            // Load progress (Local first, then Cloud)
            try {
                const progress = await dbService.loadUserProgress(appUser.id);
                if (progress) {
                    setUserProgress(prev => ({ ...prev, ...progress }));
                }
                // Try to sync if we are online now
                if (networkService.isOnline) {
                    dbService.syncProgress(appUser.id);
                }
            } catch (e) {
                console.warn("Failed to load progress:", e);
            }
          } else {
            setUser(null);
          }
          setIsLoadingAuth(false);
      });
    } catch (err: any) {
      console.error("Failed to attach Auth listener:", err);
      handleAuthError(err.message || "Unknown Auth Error");
    }

    if (typeof window !== 'undefined') {
        try {
            const storedSettings = localStorage.getItem('pytholingo_settings');
            if (storedSettings) {
                setSettings({...INITIAL_SETTINGS, ...JSON.parse(storedSettings)});
            }
        } catch(e) {}

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const session = urlParams.get('session');
            if (session) {
                setCurrentSessionId(session);
                setView('pair');
                window.history.replaceState({}, '', '/'); 
            }
        } catch (e) {}
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAuthError = (msg: string) => {
    setAuthError(msg);
    setIsLoadingAuth(false);
    setUser({ id: 'offline-guest', email: 'Guest (Offline)', isAnonymous: true });
    setSettings(prev => ({ ...prev, offlineMode: true }));
  };

  useEffect(() => {
      if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.classList.toggle('dark', settings.darkMode);
      }
  }, [settings.darkMode]);

  useEffect(() => {
      if (typeof document !== 'undefined' && document.body) {
          if (godMode) document.body.classList.add('rainbow-mode');
          else document.body.classList.remove('rainbow-mode');
      }
  }, [godMode]);

  useEffect(() => {
    if (user) {
        // Save to DB (Service handles local vs cloud)
        dbService.saveUserProgress(user.id, userProgress).catch(err => console.warn("Save failed:", err));
    }
  }, [userProgress, user]);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          try {
              localStorage.setItem('pytholingo_settings', JSON.stringify(settings));
          } catch(e) {}
      }
  }, [settings]);

  // Sync Public Visibility to DB
  useEffect(() => {
      if (user && !user.isAnonymous && user.id !== 'offline-guest') {
          dbService.saveUserProfile(user.id, { isPublicProfile: settings.isPublicProfile });
      }
  }, [settings.isPublicProfile, user]);

  const updateSettings = (newSettings: Partial<AppSettings>) => setSettings(p => ({ ...p, ...newSettings }));
  const handleAuthSuccess = () => soundService.playXp();
  const handleLogout = async () => { 
      try {
        await authService.logout(); 
      } catch(e) { console.error("Logout error", e); }
      setView('dashboard'); 
      setUser(null);
  };

  const startLesson = (lessonId: string, mode: 'LEARN' | 'TEST' = 'LEARN') => {
    if (userProgress.burnoutEndTime && userProgress.burnoutEndTime > Date.now()) {
        alert("Pyssss says: Take a break! You are in cooldown.");
        return;
    }

    if (currentLessons[lessonId]) {
      setCurrentLessonId(lessonId);
      setLessonMode(mode);
      setView('lesson');
      soundService.playClick();
    }
  };

  const handleUpdateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
      if (!user) return;
      if (!isOnline) { alert("Cannot update profile while offline."); return; }
      
      setUser(prev => prev ? ({ ...prev, ...updates }) : null);
      try {
        await authService.updateUserProfile(updates);
      } catch (e) {
        console.error("Profile update failed", e);
      }
  };

  const handleCheat = (type: SecretType) => {
      if (type === SecretType.SKIP_LESSON) {
          const allLessonKeys = Object.keys(currentLessons);
          const next = allLessonKeys.find(id => !userProgress.completedLessons.includes(id));
          if (next) {
              const lessonXp = currentLessons[next]?.totalXp || 100;
              setUserProgress(prev => ({
                  ...prev,
                  xp: prev.xp + lessonXp,
                  completedLessons: [...prev.completedLessons, next]
              }));
              alert(`🔥 DEV CHEAT ACTIVATED: Skipped ${next}`);
              soundService.playComplete();
          } else {
              alert("🔥 DEV CHEAT: All lessons already complete!");
          }
      } else if (type === SecretType.FULL_SKIP) {
          const allLessonIds = Object.keys(currentLessons);
          const totalPossibleXp = Object.values(currentLessons).reduce((sum, lesson) => sum + lesson.totalXp, 0);
          setUserProgress(prev => ({
              ...prev,
              xp: Math.max(prev.xp, totalPossibleXp),
              completedLessons: allLessonIds,
              hiddenUnitUnlocked: true
          }));
          alert("⚡ GOD DEV CHEAT: All lessons completed & XP granted!");
          soundService.playComplete();
      }
  };

  const handleRedeemSecret = (secretInput: string): { success: boolean, message: string } => {
    const secretId = decodeSecretId(secretInput as SecretType) || secretInput;
    const redeemed = userProgress.redeemedSecrets || [];
    if (redeemed.includes(secretId)) {
      return { success: false, message: "⚠️ You have already redeemed this secret!" };
    }

    let message = "";
    let updates: Partial<UserProgress> = {};
    let valid = false;

    if (secretId === 'HELLO_WORLD') {
      const duration = 3 * 60 * 1000;
      updates = { xpMultiplier: 2, xpMultiplierEndTime: Date.now() + duration };
      message = "✨ SECRET ACTIVATED: 2x XP enabled for 3 minutes!";
      valid = true;
    } else if (secretId === 'SERBIA') {
      updates = { streakFreeze: (userProgress.streakFreeze || 0) + 1 };
      message = "🇷🇸 Serbia Strong! +1 Day Streak Freeze added to your account.";
      valid = true;
    } else if (secretId === 'ENABLE_MENTOR') {
      updates = { mentorModeUnlocked: true };
      message = "🎓 MENTOR MODE ACTIVATED: You can now help others!";
      valid = true;
    }

    if (valid) {
      setUserProgress(prev => ({
        ...prev,
        ...updates,
        redeemedSecrets: [...(prev.redeemedSecrets || []), secretId]
      }));
      soundService.playComplete();
      return { success: true, message };
    }
    return { success: false, message: "Unknown secret." };
  };

  const handleUnlockHiddenUnit = () => {
    if (!userProgress.hiddenUnitUnlocked) {
      setUserProgress(prev => ({ ...prev, hiddenUnitUnlocked: true }));
      soundService.playComplete();
      return true;
    }
    return false;
  };

  const handleLessonComplete = (baseXp: number) => {
    let earnedXp = baseXp;
    if (userProgress.xpMultiplier && userProgress.xpMultiplierEndTime && Date.now() < userProgress.xpMultiplierEndTime) {
      earnedXp *= userProgress.xpMultiplier;
    }
    setUserProgress(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
      completedLessons: currentLessonId && !prev.completedLessons.includes(currentLessonId) 
        ? [...prev.completedLessons, currentLessonId] 
        : prev.completedLessons,
      consecutiveFails: 0
    }));
    setView('dashboard');
    setCurrentLessonId(null);
  };

  const handleLessonExit = (success: boolean) => {
      if (!success) {
          setUserProgress(prev => {
              const newFails = (prev.consecutiveFails || 0) + 1;
              const updates: Partial<UserProgress> = { consecutiveFails: newFails };
              if (newFails >= 3) {
                  updates.burnoutEndTime = Date.now() + 2 * 60 * 1000;
                  updates.consecutiveFails = 0;
                  updates.lastFailedLessonId = currentLessonId || undefined;
              }
              return { ...prev, ...updates };
          });
      }
      setView('dashboard');
      setCurrentLessonId(null);
  };

  const handleOpenChest = (unitId: string) => {
      if (userProgress.openedChests && userProgress.openedChests.includes(unitId)) return;
      const CHEST_XP = 150;
      let earnedXp = CHEST_XP;
      if (userProgress.xpMultiplier && userProgress.xpMultiplierEndTime && Date.now() < userProgress.xpMultiplierEndTime) {
          earnedXp *= userProgress.xpMultiplier;
      }
      setUserProgress(prev => ({
          ...prev,
          xp: prev.xp + earnedXp,
          openedChests: [...(prev.openedChests || []), unitId]
      }));
      soundService.playComplete();
  };

  if (!mounted) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
           <p className="text-gray-400 font-mono text-sm">Loading...</p>
        </div>
      );
  }

  if (isLoadingAuth) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
           <p className="font-bold text-gray-500 animate-pulse">Waking up Pyssss...</p>
        </div>
      );
  }

  if (!user) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  const fontClass = settings.font === 'serif' ? 'font-serif' : settings.font === 'mono' ? 'font-mono' : settings.font === 'dyslexic' ? 'font-sans' : 'font-sans';

  if (view === 'lesson' && currentLessonId && currentLessons[currentLessonId]) {
    return (
      <div className={fontClass}>
      <LessonView 
        key={currentLessonId}
        lessonTitle={currentLessons[currentLessonId].title}
        learningContent={currentLessons[currentLessonId].learningContent}
        exercises={currentLessons[currentLessonId].exercises}
        onComplete={handleLessonComplete}
        onExit={handleLessonExit}
        loseHeart={() => setUserProgress(p => ({...p}))}
        hearts={godMode ? 999 : userProgress.hearts}
        settings={settings}
        currentXp={userProgress.xp}
        mode={lessonMode}
      />
      </div>
    );
  }

  if (view === 'pair' && currentSessionId) {
      return (
          <div className={fontClass}>
              <PairProgramming 
                  user={user} 
                  sessionId={currentSessionId}
                  onExit={() => { setView('dashboard'); setCurrentSessionId(null); }}
                  onComplete={(xp) => {
                      handleLessonComplete(xp);
                      soundService.playXp();
                  }}
              />
          </div>
      );
  }

  return (
    <div className={fontClass}>
      {!isOnline && (
        <div className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs p-1 text-center font-bold">
          📡 You are OFFLINE. Progress will sync when connection returns.
        </div>
      )}
      <Dashboard 
        user={user}
        progress={godMode ? { ...userProgress, hearts: 999 } : userProgress}
        startLesson={startLesson}
        onLogout={handleLogout}
        settings={{...settings, offlineMode: !isOnline}}
        updateSettings={updateSettings}
        onRedeemSecret={handleRedeemSecret}
        onUnlockHiddenUnit={handleUnlockHiddenUnit}
        onCheat={handleCheat}
        onOpenChest={handleOpenChest}
        onStartPairProgramming={(id) => {
            if (!isOnline) { alert("Requires Internet"); return; }
            setCurrentSessionId(id);
            setView('pair');
        }}
        onUpdateProfile={handleUpdateProfile}
        unitsConfig={currentUnits}
      />
    </div>
  );
}
