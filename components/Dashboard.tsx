

import React, { useState, useEffect, useRef } from 'react';
import { UserProgress, MascotMood, User, AppSettings, getLevel, getXpInCurrentLevel, XP_PER_LEVEL, getLevelProgress, AppLanguage, AppFont, LeaderboardEntry, Challenge, UnitConfig } from '../types';
import { Flame, Trophy, Zap, Star, LogOut, Settings, X, Eye, Backpack, Moon, Volume2, Home, BarChart2, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, RefreshCw, Send, MessageCircle, Info, Terminal as TerminalIcon, Type, Globe, Shield, Lock, Users, Monitor, Mail, Swords, Box, Calculator, List, Book, Layers, Split, Repeat, RotateCw, Code, ArrowRightLeft, Package, Clock, Hash, MessageSquare, Swords as SwordsIcon, PartyPopper, ClipboardList, Lightbulb, CheckCircle2, XCircle, Play, Loader2, Sparkles, FolderOpen, Skull, Crown, Hammer, GraduationCap, Crosshair, BookOpen, Download, WifiOff, CloudOff } from 'lucide-react';
import Mascot from './Mascot';
import PyssssChat from './PyssssChat';
import { chatWithPyssss, validateCodeWithAI } from '../services/geminiService';
import InfoModal from './InfoModal';
import Terminal from './Terminal';
import BurnoutOverlay from './BurnoutOverlay';
import StatsView from './StatsView';
import CodeEditor from './CodeEditor';
import Playground from './Playground';
import ProjectBuilder from './ProjectBuilder';
import Flashcards from './Flashcards';
import InstallPWA from './InstallPWA';
import { t, LANGUAGES } from '../services/translationService';
import { presenceService } from '../services/presenceService';
import { dbService } from '../services/dbService';
import { checkSecret, SecretType, decodeSecretId } from '../utils/secrets';
import { networkService } from '../services/networkService';

interface DashboardProps {
  user: User;
  progress: UserProgress;
  startLesson: (lessonId: string, mode?: 'LEARN' | 'TEST') => void;
  onLogout: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onRedeemSecret: (secret: string) => { success: boolean, message: string };
  onUnlockHiddenUnit?: () => boolean;
  onStartPairProgramming?: (sessionId: string) => void;
  onCheat?: (type: SecretType) => void;
  onOpenChest?: (unitId: string) => void;
  onUpdateProfile?: (updates: { displayName?: string; photoURL?: string }) => void;
  unitsConfig?: UnitConfig[]; 
}

const DEFAULT_UNITS: UnitConfig[] = [
    {
        id: 'unit-1',
        title: 'Basics',
        description: 'Introduction to Python',
        color: 'green',
        lessons: ['basics-1', 'basics-2', 'basics-3']
    }
];

const getLessonIcon = (lessonId: string) => {
    switch(lessonId) {
        case 'basics-1': return <MessageSquare fill="white" size={36} />;
        case 'basics-2': return <Box fill="white" size={36} />;
        case 'basics-3': return <Calculator fill="white" size={36} />;
        case 'structures-1': return <List fill="white" size={36} />;
        case 'structures-2': return <Book fill="white" size={36} />;
        case 'structures-3': return <Layers fill="white" size={36} />;
        case 'flow-1': return <Split fill="white" size={36} />;
        case 'flow-2': return <Repeat fill="white" size={36} />;
        case 'flow-3': return <RotateCw fill="white" size={36} />;
        case 'func-1': return <Code fill="white" size={36} />;
        case 'func-2': return <ArrowRightLeft fill="white" size={36} />;
        case 'oop-1': return <Home fill="white" size={36} />;
        case 'oop-2': return <Users fill="white" size={36} />;
        case 'adv-1': return <Zap fill="white" size={36} />;
        case 'adv-2': return <Shield fill="white" size={36} />;
        case 'imports-1': return <Package fill="white" size={36} />;
        case 'imports-2': return <Clock fill="white" size={36} />;
        case 'imports-3': return <Hash fill="white" size={36} />;
        case 'func-adv-1': return <Zap fill="white" size={36} />;
        case 'func-adv-2': return <List fill="white" size={36} />;
        case 'py-pro-1': return <Sparkles fill="white" size={36} />; 
        case 'py-pro-2': return <RefreshCw fill="white" size={36} />;
        case 'data-1': return <Split fill="white" size={36} />;
        case 'data-2': return <Box fill="white" size={36} />;
        case 'final-boss': return <Skull fill="white" size={48} />;
        default: return <Star fill="white" size={36} />;
    }
};

const FloatingScript = ({ code, className, delay, style }: { code: string, className?: string, delay: string, style?: React.CSSProperties }) => (
    <div className={`absolute z-0 hidden lg:block font-mono text-[10px] bg-gray-900/90 text-green-400 p-3 rounded-lg shadow-xl border border-gray-700/50 backdrop-blur-sm select-none hover:scale-105 transition-transform duration-500 animate-float pointer-events-none ${className}`} style={{ animationDelay: delay, ...style }}>
        <div className="flex gap-1.5 mb-2 border-b border-gray-800 pb-1.5 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
        </div>
        {code.split('\n').map((line, i) => (
            <div key={i} className={`whitespace-pre leading-relaxed ${line.startsWith('#') ? 'text-gray-500 italic' : line.includes('print') ? 'text-blue-400' : line.includes('def') || line.includes('import') || line.includes('for') ? 'text-purple-400' : 'text-green-300'}`}>
                {line || '\u00A0'}
            </div>
        ))}
    </div>
);

const RailIcon = ({ icon, label, active, onClick, color, badge, className, disabled }: any) => (
  <button 
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`relative group p-3 rounded-xl transition-all ${
      disabled ? 'opacity-40 cursor-not-allowed grayscale' :
      active 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
      : `text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 ${color || ''}`
    } ${className || ''}`}
  >
    {icon}
    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
      {label} {disabled ? '(Online Only)' : ''}
    </span>
    {badge && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
    )}
  </button>
);

const ActionRail = ({ settings, updateSettings, onLogout, setView, currentView, openTerminal, lang, onPairClick, openInbox, hasBattle, openSettings, openCheatsheet, hasProjects, hasMentor }: any) => {
    const isOffline = settings.offlineMode;
    return (
      <div className="fixed left-0 top-0 h-full w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 gap-4 z-50 hidden md:flex shadow-sm">
        <div className="text-2xl hover:scale-110 transition-transform cursor-pointer pb-2" onClick={() => setView('home')}>🐍</div>
        <div className="flex flex-col gap-3 w-full items-center flex-1">
          <RailIcon icon={<Home size={24} />} label={t("home", lang)} active={currentView === 'home'} onClick={() => setView('home')} />
          <RailIcon className="lg:hidden" icon={<Trophy size={24} />} label={t("leaderboard", lang)} active={currentView === 'leaderboard'} onClick={() => setView('leaderboard')} disabled={isOffline} />
          <RailIcon icon={<BarChart2 size={24} />} label={t("stats", lang)} active={currentView === 'stats'} onClick={() => setView('stats')} />
          <RailIcon icon={<FolderOpen size={24} />} label="Playground" active={currentView === 'playground'} onClick={() => setView('playground')} />
          <RailIcon icon={<Layers size={24} />} label="Flashcards" active={currentView === 'flashcards'} onClick={() => setView('flashcards')} />
          {hasProjects && <RailIcon icon={<Hammer size={24} />} label="Projects" active={currentView === 'projects'} onClick={() => setView('projects')} color="text-indigo-500" />}
          {hasMentor && <RailIcon icon={<GraduationCap size={24} />} label="Mentor" active={currentView === 'mentor'} onClick={() => setView('mentor')} color="text-yellow-500" disabled={isOffline} />}
          <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
          <RailIcon icon={<Book size={24} />} label="Cheatsheet" onClick={openCheatsheet} />
          <RailIcon icon={<TerminalIcon size={24} />} label={t("terminal", lang)} onClick={openTerminal} />
          <RailIcon icon={<Mail size={24} />} label="Inbox" onClick={openInbox} disabled={isOffline} />
          {hasBattle && <div className="animate-pulse"><RailIcon icon={<Swords size={24} />} label="Battle Ready" onClick={openInbox} color="text-red-500" badge={true} disabled={isOffline} /></div>}
          <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
          <RailIcon icon={<Users size={24} />} label="Pair Code" onClick={onPairClick} color="text-indigo-500" disabled={isOffline} />
          <div className="mt-auto flex flex-col gap-3">
            <InstallPWA className="flex items-center justify-center p-2" buttonText="" />
            <RailIcon icon={<Settings size={24} />} label={t("settings", lang)} onClick={openSettings} />
            {isOffline && <div title="Offline" className="p-2 text-amber-500 flex justify-center animate-pulse"><WifiOff size={24} /></div>}
            <RailIcon icon={<Moon size={24} />} label={t("dark", lang)} active={settings.darkMode} onClick={() => updateSettings({ darkMode: !settings.darkMode })} />
          </div>
        </div>
        <button onClick={onLogout} className="mb-4 text-gray-400 hover:text-red-500 transition-colors p-2"><LogOut size={24} /></button>
      </div>
    );
};

const SettingsToggle = ({ icon, label, desc, checked, onChange, colorClass }: any) => {
    const getColor = (c: string) => {
        const map: any = { stone: 'bg-stone-500', gray: 'bg-gray-500', blue: 'bg-blue-500', orange: 'bg-orange-500', red: 'bg-red-500', green: 'bg-green-500', purple: 'bg-purple-500' };
        return map[c] || 'bg-green-500';
    };
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white ${getColor(colorClass)} shadow-sm`}>{icon}</div>
                <div className="text-left">
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
            </div>
            <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full transition-colors relative ${checked ? getColor(colorClass) : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
            </button>
        </div>
    );
};

const SettingsSelect = ({ icon, label, value, options, onChange, colorClass }: any) => {
    const getColor = (c: string) => {
        const map: any = { purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30', green: 'text-green-500 bg-green-100 dark:bg-green-900/30' };
        return map[c] || 'text-gray-500 bg-gray-100';
    };
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getColor(colorClass)}`}>{icon}</div>
                <p className="font-bold text-gray-800 dark:text-white text-sm">{label}</p>
             </div>
             <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-green-500">
                 {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
             </select>
        </div>
    );
};

// --- CONNECTING LINE COMPONENT ---
const Connector = ({ start, end, color, offset = 80 }: { start: number, end: number, color: string, offset?: number }) => {
    // 0 = Center, 1 = Right, -1 = Left
    // Positions relative to center (0px). 
    // Left (-1) is -offset, Right (1) is +offset.
    // SVG width 300px, center is 150px.
    
    // Fix: We map the logical offset (80) to the responsive offsets (48 mobile, 80 desktop)
    // Mobile: 48px / 80px = 0.6 scale
    // We use vectorEffect="non-scaling-stroke" to ensure line thickness remains constant despite scaling.
    
    const getX = (pos: number) => 150 + (pos * offset);
    const x1 = getX(start);
    const x2 = getX(end);
    
    // Increased height to connect centers of large icons (96px/112px) with a gap
    const y1 = 0;
    const y2 = 120; 
    
    // Bezier curve control points for smooth s-curve
    const cp1y = y1 + 60;
    const cp2y = y2 - 60;

    return (
        <div className="w-[300px] h-[120px] z-0 pointer-events-none flex justify-center">
            <svg 
                width="300" 
                height="120" 
                className="overflow-visible transition-transform duration-300 transform scale-x-[0.6] sm:scale-x-100 origin-center"
            >
                <path 
                    d={`M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="16 8"
                    vectorEffect="non-scaling-stroke"
                    className={`text-${color}-300/50 dark:text-${color}-700/50`}
                    style={{ stroke: 'currentColor', opacity: 0.5 }} // Fallback if color class fails
                />
            </svg>
        </div>
    );
};

const LessonNode = ({ id, title, icon, color, completed, active, locked, offsetClass, onClick, offlineMode }: any) => {
    return (
        <div className={`relative flex flex-col items-center z-10 transform transition-transform duration-300 ${offsetClass || ''}`}>
             <button
                onClick={(!locked || completed) ? onClick : undefined}
                disabled={locked && !completed}
                className={`
                    w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center
                    shadow-[0_8px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[8px]
                    transition-all duration-150 relative group border-4 border-black/5 dark:border-white/5
                    ${completed ? 'bg-yellow-400 text-white' : active ? (offlineMode ? 'bg-stone-500 text-white' : color) : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
                `}
             >
                 {completed && (
                     <div className="absolute -right-2 -top-2 bg-white text-yellow-500 rounded-full p-1.5 border-2 border-yellow-100 shadow-sm animate-bounce z-20">
                         <Star fill="currentColor" size={20} />
                     </div>
                 )}
                 <div className="transform group-hover:scale-110 transition-transform">
                     {locked && !completed ? <Lock size={40} /> : icon}
                 </div>
                 {active && !completed && <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>}
             </button>
             <span className="mt-3 font-bold text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 px-4 py-1.5 rounded-xl backdrop-blur-sm text-sm shadow-md border border-gray-100 dark:border-gray-700 z-20">
                 {title}
             </span>
        </div>
    );
};

const ChestNode = ({ unitId, isOpen, isLocked, isShaking, onClick }: any) => {
    return (
         <div className={`relative flex flex-col items-center z-10 py-6 ${isShaking ? 'animate-shake' : ''}`}>
             <button
                onClick={(!isLocked && !isOpen) ? onClick : undefined}
                disabled={isLocked || isOpen}
                className={`
                    w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center
                    shadow-xl transition-transform duration-300 border-b-8 border-black/10
                    ${isOpen ? 'bg-transparent border-none shadow-none' : isLocked ? 'bg-gray-300 dark:bg-gray-700 grayscale opacity-50' : 'bg-gradient-to-b from-yellow-300 to-orange-500 hover:scale-105 cursor-pointer'}
                `}
             >
                 {isOpen ? (
                     <div className="text-yellow-500 opacity-50"><Box size={60} /></div>
                 ) : (
                     <div className="text-white drop-shadow-md">
                         {isLocked ? <Lock size={32} /> : <Box size={48} fill="currentColor" />}
                     </div>
                 )}
             </button>
             {!isOpen && !isLocked && <div className="mt-2 text-sm font-bold text-yellow-800 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full animate-bounce border border-yellow-200 dark:border-yellow-700">Bonus Chest</div>}
         </div>
    );
};

const CodeSmell = ({ lang }: any) => {
    const smells = [
        "Long Functions: If it doesn't fit on screen, split it up.",
        "Magic Numbers: Use named constants instead of raw numbers.",
        "Duplicated Code: Don't repeat yourself (DRY).",
        "Deep Nesting: Avoid too many if/for inside each other.",
        "Vague Names: 'x' is bad. 'user_age' is good.",
        "Global Variables: They make debugging a nightmare."
    ];
    const idx = new Date().getDate() % smells.length;
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
                 <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg text-purple-600 dark:text-purple-400"><Sparkles size={16} /></div>
                 <h3 className="font-bold text-gray-800 dark:text-white text-sm">{t("smell", lang)}</h3>
             </div>
             <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">"{smells[idx]}"</p>
        </div>
    );
};

const StreakHeatMap = ({ streak, lang }: any) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
             <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                     <Flame className="text-orange-500" size={20} />
                     <h3 className="font-bold text-gray-800 dark:text-white">{t("activity", lang)}</h3>
                 </div>
                 <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                     {streak} {t("streak", lang)}
                 </span>
             </div>
             <div className="flex justify-between gap-1">
                 {[...Array(7)].map((_, i) => (
                     <div key={i} className={`h-8 w-full rounded-md ${i < (streak % 7) || streak > 7 ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                 ))}
             </div>
        </div>
    );
};

// --- PLACEHOLDER COMPONENTS ---
// These were missing in the original file snippet
const DailyChallengeWidget = () => (
    <div className="bg-blue-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={64} /></div>
        <h3 className="font-bold text-lg mb-1">Daily Challenge</h3>
        <p className="text-blue-100 text-xs mb-3">Solve the puzzle to win 50 XP!</p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold">Start</button>
    </div>
);

const RealLeaderboard = ({ user, lang }: any) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    useEffect(() => {
        dbService.getLeaderboard().then(setEntries);
    }, []);
    return (
        <div className="space-y-2">
            {entries.slice(0, 5).map((e, i) => (
                <div key={e.userId} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 text-center ${i===0 ? 'text-yellow-500' : 'text-gray-500'}`}>{i+1}</span>
                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden"><img src={e.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.userId}`} alt="" /></div>
                        <span className="text-sm font-bold text-gray-800 dark:text-white">{e.displayName}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{e.xp} XP</span>
                </div>
            ))}
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ 
    user, progress, startLesson, onLogout, settings, updateSettings, 
    onRedeemSecret, onUnlockHiddenUnit, onCheat, onOpenChest, 
    onStartPairProgramming, unitsConfig = DEFAULT_UNITS 
}) => {
    const [view, setView] = useState<'home' | 'stats' | 'leaderboard' | 'playground' | 'flashcards' | 'projects' | 'mentor'>('home');
    const [showTerminal, setShowTerminal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showCheatsheet, setShowCheatsheet] = useState(false);
    
    // --- Render Logic for Home Map ---
    const renderHome = () => {
        let isPreviousLessonCompleted = true; // First lesson is always available

        return (
            <div className="max-w-2xl mx-auto w-full pb-20 space-y-12">
                {unitsConfig.map((unit, unitIndex) => {
                    const isHidden = unit.id === 'unit-hidden' && !progress.hiddenUnitUnlocked;
                    if (isHidden) return null;

                    const unitComplete = unit.lessons.every(l => progress.completedLessons.includes(l));
                    
                    return (
                        <div key={unit.id} className="relative">
                            <div className={`mb-8 text-center rounded-2xl py-4 px-6 border-b-4 ${unitComplete ? `bg-${unit.color}-500 border-${unit.color}-700 text-white` : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500'}`}>
                                <h2 className="text-xl font-black uppercase tracking-widest">{unit.title}</h2>
                                <p className="text-sm opacity-80 font-medium">{unit.description}</p>
                            </div>
                            
                            <div className="space-y-0">
                                {unit.lessons.map((lessonId, index) => {
                                    const isCompleted = progress.completedLessons.includes(lessonId);
                                    
                                    // Strictly lock if previous is not completed
                                    // Current lesson is unlocked ONLY if previous was completed
                                    const isLocked = !isCompleted && !isPreviousLessonCompleted;

                                    const getNodeOffset = (idx: number) => {
                                        const pattern = [0, -1, 0, 1]; 
                                        return pattern[idx % pattern.length];
                                    };
                                    const offset = getNodeOffset(index);
                                    const offsetClass = offset === -1 ? '-translate-x-12 sm:-translate-x-20' : offset === 1 ? 'translate-x-12 sm:translate-x-20' : '';

                                    // Capture current completion status for the *next* iteration
                                    const currentLessonCompleted = isCompleted;

                                    const lessonNode = (
                                        <div key={lessonId} className="flex flex-col items-center relative z-10">
                                            <LessonNode 
                                                id={lessonId}
                                                title={`Lesson ${index + 1}`}
                                                icon={getLessonIcon(lessonId)}
                                                color={`bg-${unit.color}-500`}
                                                completed={isCompleted}
                                                active={!isLocked && !isCompleted}
                                                locked={isLocked}
                                                offsetClass={offsetClass}
                                                onClick={() => startLesson(lessonId)}
                                                offlineMode={settings.offlineMode}
                                            />
                                            {(index < unit.lessons.length - 1) && (
                                                <div className="-mt-12 -mb-12 sm:-mt-14 sm:-mb-14 z-0 relative">
                                                    <Connector 
                                                        start={getNodeOffset(index)} 
                                                        end={getNodeOffset(index + 1)} 
                                                        color={unit.color} 
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );

                                    isPreviousLessonCompleted = currentLessonCompleted;
                                    return lessonNode;
                                })}
                                
                                {/* Bonus Chest at end of unit */}
                                <div className="flex justify-center mt-8">
                                    <ChestNode 
                                        unitId={unit.id}
                                        isOpen={progress.openedChests?.includes(unit.id)}
                                        isLocked={!unitComplete}
                                        onClick={() => onOpenChest && onOpenChest(unit.id)}
                                        isShaking={unitComplete && !progress.openedChests?.includes(unit.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`flex h-screen ${settings.darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
            <ActionRail 
                settings={settings}
                updateSettings={updateSettings}
                onLogout={onLogout}
                setView={setView}
                currentView={view}
                openTerminal={() => setShowTerminal(true)}
                lang={settings.language}
                onPairClick={() => onStartPairProgramming?.('new')}
                openInbox={() => {}}
                hasBattle={false}
                openSettings={() => setShowSettings(true)}
                openCheatsheet={() => setShowCheatsheet(true)}
                hasProjects={true}
                hasMentor={progress.mentorModeUnlocked}
            />
            
            <div className="flex-1 flex flex-col h-full relative overflow-hidden md:ml-16">
                 {/* Top Bar for Mobile */}
                 <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-20">
                     <button onClick={() => setShowSettings(true)}><Settings /></button>
                     <div className="font-bold">Pythonlingo</div>
                     <div className="flex items-center gap-2">
                         <Flame size={16} className="text-orange-500" /> {progress.streak}
                         <Zap size={16} className="text-yellow-500" /> {progress.xp}
                     </div>
                 </div>

                 {/* Main Content Scroll Area */}
                 <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                    
                    {/* Floating Scripts (Visual Flair) */}
                    <FloatingScript code={`def learn():\n  return "Fun"`} delay="0s" className="top-10 left-10" />
                    <FloatingScript code={`import success`} delay="2s" className="top-40 right-20" />

                    {view === 'home' && renderHome()}
                    {view === 'stats' && <StatsView progress={progress} unitsConfig={unitsConfig} />}
                    {view === 'leaderboard' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">Leaderboard</h2>
                            <RealLeaderboard user={user} lang={settings.language} />
                        </div>
                    )}
                    {view === 'playground' && <Playground />}
                    {view === 'flashcards' && <Flashcards />}
                    {view === 'projects' && <ProjectBuilder />}
                    {view === 'mentor' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <GraduationCap size={64} className="text-yellow-500 mb-4" />
                            <h2 className="text-2xl font-bold dark:text-white">Mentor Mode</h2>
                            <p className="text-gray-500">Help other students review their code. (Coming Soon)</p>
                        </div>
                    )}
                 </div>
                 
                 {/* Right Sidebar (Desktop) */}
                 <div className="hidden lg:flex w-80 flex-col gap-6 p-6 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                     
                     {/* Profile Card */}
                     <div className="flex items-center gap-3 mb-2">
                         <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-700 border-2 border-green-200">
                             {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-800 dark:text-white">{user.displayName || 'Pythonista'}</h3>
                             <p className="text-xs text-gray-500">Lvl {getLevel(progress.xp)} • {getXpInCurrentLevel(progress.xp)}/{XP_PER_LEVEL} XP</p>
                         </div>
                     </div>

                     <StreakHeatMap streak={progress.streak} lang={settings.language} />
                     <DailyChallengeWidget />
                     <CodeSmell lang={settings.language} />
                     
                     {/* Pyssss Chat Widget */}
                     <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-2">
                             <MessageCircle size={16} className="text-green-500" />
                             <span className="text-xs font-bold text-gray-500 uppercase">Chat with Pyssss</span>
                        </div>
                        <div className="relative h-40 w-full">
                            <PyssssChat onFiveClicks={() => onUnlockHiddenUnit ? onUnlockHiddenUnit() : false} />
                        </div>
                     </div>
                 </div>
            </div>

            {/* Overlays */}
            {showTerminal && (
                <Terminal 
                    onClose={() => setShowTerminal(false)} 
                    font={settings.font}
                    onRedeemSecret={onRedeemSecret}
                    onCheat={onCheat}
                />
            )}
            
            {progress.burnoutEndTime && progress.burnoutEndTime > Date.now() && (
                <BurnoutOverlay 
                    endTime={progress.burnoutEndTime} 
                    failedLessonId={progress.lastFailedLessonId}
                    onComplete={() => { /* Handled by timer usually */ }}
                />
            )}

            {/* Settings Modal (Simplified) */}
            {showSettings && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">Settings</h2>
                            <button onClick={() => setShowSettings(false)}><X className="dark:text-white" /></button>
                        </div>
                        <div className="space-y-3">
                            <SettingsToggle 
                                icon={<Volume2 size={18} />} 
                                label="Sound Effects" 
                                desc="Play sounds on interactions"
                                checked={settings.soundEffects} 
                                onChange={(v: boolean) => updateSettings({ soundEffects: v })} 
                                colorClass="blue"
                            />
                            <SettingsToggle 
                                icon={<Eye size={18} />} 
                                label="Bionic Reading" 
                                desc="Highlight first letters"
                                checked={settings.bionicReading} 
                                onChange={(v: boolean) => updateSettings({ bionicReading: v })} 
                                colorClass="purple"
                            />
                             <SettingsSelect
                                icon={<Globe size={18} />}
                                label="Language"
                                value={settings.language}
                                options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))}
                                onChange={(v: any) => updateSettings({ language: v })}
                                colorClass="green"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
