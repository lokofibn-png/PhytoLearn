
import React, { useState, useEffect, useRef } from 'react';
import { UserProgress, MascotMood, User, AppSettings, getLevel, getXpInCurrentLevel, XP_PER_LEVEL, AppLanguage, LeaderboardEntry, UnitConfig } from '../types';
import { SecretType } from '../utils/secrets';
import { Flame, Trophy, Zap, Star, LogOut, Settings, X, Eye, Moon, Volume2, Home, BarChart2, MessageCircle, Terminal as TerminalIcon, Sparkles, Box, Lock, GraduationCap, Layers, Hammer, Mail, Swords, Book, Users, MessageSquareText, Send, User as UserIcon, Camera, Type, Languages, Menu } from 'lucide-react';
import Mascot from './Mascot';
import PyssssChat from './PyssssChat';
import { chatWithPyssss } from '../services/geminiService';
import Terminal from './Terminal';
import BurnoutOverlay from './BurnoutOverlay';
import StatsView from './StatsView';
import Playground from './Playground';
import ProjectBuilder from './ProjectBuilder';
import Flashcards from './Flashcards';
import InstallPWA from './InstallPWA';
import { t, LANGUAGES } from '../services/translationService';
import { dbService } from '../services/dbService';

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

// --- ICONS MAPPING ---
const getLessonIcon = (lessonId: string) => {
    return <Star fill="white" size={32} />;
};

// --- SUB-COMPONENTS ---

// Simple icon replacement for missing imports
const FolderIcon = ({size}: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;

const ActionRail = ({ settings, updateSettings, onLogout, setView, currentView, openTerminal, lang, onPairClick, openSettings, hasProjects, hasMentor, isOpen, setIsOpen }: any) => {
    const isOffline = settings.offlineMode;
    
    const NavItem = ({ icon, label, id, onClick, color, disabled }: any) => {
        const active = currentView === id;
        return (
             <button 
                onClick={() => {
                    if (!disabled && onClick) onClick();
                    if (window.innerWidth < 768) setIsOpen(false); // Close drawer on mobile click
                }}
                disabled={disabled}
                className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative font-bold text-sm
                    ${active 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-l-4 border-green-500' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                `}
             >
                <div className={`${active ? '' : 'group-hover:scale-110 transition-transform'} ${color || ''}`}>
                    {icon}
                </div>
                <span className="uppercase tracking-wide">{label}</span>
             </button>
        );
    };

    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />
        )}

        <aside className={`
            fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
            flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
            ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800" onClick={() => setView('home')}>
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/20">
                        🐍
                    </div>
                    <span className="font-black text-xl tracking-tight text-gray-800 dark:text-white">
                        Python<span className="text-green-500">lingo</span>
                    </span>
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                <NavItem icon={<Home size={20} />} label={t("home", lang)} id="home" onClick={() => setView('home')} />
                <NavItem icon={<Trophy size={20} />} label={t("leaderboard", lang)} id="leaderboard" onClick={() => setView('leaderboard')} disabled={isOffline} />
                <NavItem icon={<BarChart2 size={20} />} label={t("stats", lang)} id="stats" onClick={() => setView('stats')} />
                <NavItem icon={<MessageSquareText size={20} />} label="Chat AI" id="chat" onClick={() => setView('chat')} />
                
                <div className="my-4 border-t border-gray-100 dark:border-gray-800 mx-2"></div>
                
                <NavItem icon={<FolderIcon size={20} />} label="Playground" id="playground" onClick={() => setView('playground')} />
                <NavItem icon={<Layers size={20} />} label="Flashcards" id="flashcards" onClick={() => setView('flashcards')} />
                {hasProjects && <NavItem icon={<Hammer size={20} />} label="Projects" id="projects" onClick={() => setView('projects')} color="text-indigo-500" />}
                {hasMentor && <NavItem icon={<GraduationCap size={20} />} label="Mentor" id="mentor" onClick={() => setView('mentor')} color="text-yellow-500" disabled={isOffline} />}
                
                <div className="my-4 border-t border-gray-100 dark:border-gray-800 mx-2"></div>
                
                <NavItem icon={<TerminalIcon size={20} />} label={t("terminal", lang)} onClick={openTerminal} />
                <NavItem icon={<Users size={20} />} label="Pair Code" onClick={onPairClick} color="text-indigo-500" disabled={isOffline} />
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2 bg-gray-50 dark:bg-gray-900/50">
                <InstallPWA className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-green-500/20" buttonText="Install App" />
                <NavItem icon={<Settings size={20} />} label={t("settings", lang)} onClick={openSettings} />
            </div>
        </aside>
      </>
    );
};

const Connector = ({ color, startOffset, endOffset }: { color: string, startOffset: number, endOffset: number }) => {
    // width needs to be wide enough to encompass the zig-zag
    const width = 240; 
    const height = 64; 
    const centerX = width / 2;
    const stepX = 64; // Distance for each step (-1, 0, 1)

    const x1 = centerX + (startOffset * stepX);
    const x2 = centerX + (endOffset * stepX);
    
    // Bezier Curve Logic
    const cp1y = height * 0.5;
    const cp2y = height * 0.5;

    return (
        <div className="w-full flex justify-center h-[64px] overflow-visible -my-1 z-0 relative">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <path 
                    d={`M ${x1} 0 C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${height}`}
                    stroke="currentColor" 
                    strokeWidth="5" 
                    strokeDasharray="10 10" 
                    fill="none"
                    className={`text-${color}-300 dark:text-${color}-700 opacity-60`} 
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

const LessonNode = ({ id, title, icon, color, completed, active, locked, onClick, lockedMessage, offset }: any) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    // Map visual offset steps to Tailwind translate classes
    // 0 = center, -1 = left, 1 = right
    const getTranslateX = (step: number) => {
        if (step === -1) return '-translate-x-16';
        if (step === 1) return 'translate-x-16';
        return 'translate-x-0';
    };

    const handleClick = (e: React.MouseEvent) => {
        if (locked && !completed) {
            e.stopPropagation();
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000);
        } else {
            onClick();
        }
    };

    return (
        <div className={`relative flex flex-col items-center z-10 transform transition-transform duration-300 ${getTranslateX(offset)}`}>
             <button onClick={handleClick} className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-[0_6px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[6px] transition-all duration-150 relative group border-b-4 border-black/5 dark:border-white/5 ${completed ? 'bg-yellow-400 text-white' : active ? color : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}>
                 {completed && <div className="absolute -right-1 -top-1 bg-white text-yellow-500 rounded-full p-1 border-2 border-yellow-100 shadow-sm animate-bounce z-20"><Star fill="currentColor" size={16} /></div>}
                 <div className="transform group-hover:scale-110 transition-transform">{locked && !completed ? <Lock size={32} /> : icon}</div>
                 {active && !completed && <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>}
                 {(locked && !completed) && (
                    <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-xs font-bold rounded-xl py-2 px-3 transition-all duration-200 z-50 shadow-xl border border-gray-700 pointer-events-none flex items-center justify-center text-center ${showTooltip ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}>
                        <span>{lockedMessage}</span>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                 )}
             </button>
             {/* Simple Title Below Node */}
             <div className="mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm">
                {title}
             </div>
        </div>
    );
};

const RealLeaderboard = ({ user, lang }: any) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    useEffect(() => { dbService.getLeaderboard().then(setEntries); }, []);
    return (
        <div className="space-y-2">
            {entries.slice(0, 50).map((e, i) => (
                <div key={e.userId} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className={`font-bold w-6 text-center text-lg ${i===0 ? 'text-yellow-500' : i===1 ? 'text-gray-400' : i===2 ? 'text-amber-700' : 'text-gray-500'}`}>{i+1}</span>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white dark:border-gray-600">
                             <img src={e.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.userId}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className={`font-bold ${e.userId === user.id ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>{e.displayName} {e.userId === user.id && '(You)'}</span>
                    </div>
                    <span className="font-mono font-bold text-yellow-500">{e.xp} XP</span>
                </div>
            ))}
        </div>
    );
};

// --- CHAT COMPONENT ---
const ChatView = ({ user, lang }: { user: User, lang: string }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: `Sssssup ${user.displayName || 'Human'}! 🐍 I am Pyssss. Ask me anything about Python!` }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);
        
        try {
            const response = await chatWithPyssss(userMsg, lang);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: "Hiss... my brain is offline." }]);
        }
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 md:rounded-3xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="bg-green-500 p-4 text-white font-bold flex items-center gap-2 shadow-sm">
                <Mascot mood={MascotMood.HAPPY} className="w-10 h-10 bg-white/20 rounded-full p-1" />
                <span>Pyssss (AI Tutor)</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none shadow-sm'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-700">
                             <div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div>
                         </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Python..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={handleSend} disabled={!input.trim() || isTyping} className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50">
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ 
    user, progress, startLesson, onLogout, settings, updateSettings, 
    onRedeemSecret, onUnlockHiddenUnit, onCheat, onOpenChest, 
    onStartPairProgramming, onUpdateProfile, unitsConfig = DEFAULT_UNITS 
}) => {
    const [view, setView] = useState<'home' | 'stats' | 'leaderboard' | 'playground' | 'flashcards' | 'projects' | 'mentor' | 'chat'>('home');
    const [showTerminal, setShowTerminal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    // Profile Edit State
    const [editName, setEditName] = useState(user.displayName || '');
    const [editPhoto, setEditPhoto] = useState(user.photoURL || '');

    // --- Render Logic for Home Map ---
    const renderHome = () => {
        let isPreviousLessonCompleted = true;
        let previousLessonTitle = "Start";
        
        // Define Zig-Zag pattern: Center (0) -> Left (-1) -> Center (0) -> Right (1)
        const pattern = [0, -1, 0, 1];
        let globalIndex = 0; // Tracks position in pattern across all units

        return (
            <div className="max-w-md mx-auto w-full pb-32 space-y-12 pt-8 flex flex-col items-center">
                {unitsConfig.map((unit, unitIndex) => {
                    const isHidden = unit.id === 'unit-hidden' && !progress.hiddenUnitUnlocked;
                    if (isHidden) return null;
                    const unitComplete = unit.lessons.every(l => progress.completedLessons.includes(l));
                    
                    return (
                        <div key={unit.id} className="w-full flex flex-col items-center">
                            <div className={`mb-12 w-full text-center rounded-3xl py-6 px-6 border-b-8 shadow-sm ${unitComplete ? `bg-${unit.color}-500 border-${unit.color}-700 text-white` : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500'}`}>
                                <h2 className="text-2xl font-black uppercase tracking-widest">{unit.title}</h2>
                                <p className="text-sm opacity-80 font-medium mt-1">{unit.description}</p>
                            </div>
                            <div className="space-y-0 flex flex-col items-center w-full">
                                {unit.lessons.map((lessonId, index) => {
                                    const isCompleted = progress.completedLessons.includes(lessonId);
                                    const isLocked = !isCompleted && !isPreviousLessonCompleted;
                                    const displayTitle = `Lesson ${index + 1}`;
                                    const lockedMessage = `Complete "${previousLessonTitle}" to unlock`;
                                    
                                    // Calculate Offset
                                    const currentOffset = pattern[globalIndex % pattern.length];
                                    const nextOffset = pattern[(globalIndex + 1) % pattern.length];
                                    
                                    const lessonNode = (
                                        <div key={lessonId} className="flex flex-col items-center relative z-10 w-full">
                                            <LessonNode 
                                                id={lessonId} 
                                                title={displayTitle} 
                                                icon={getLessonIcon(lessonId)} 
                                                color={`bg-${unit.color}-500`} 
                                                completed={isCompleted} 
                                                active={!isLocked && !isCompleted} 
                                                locked={isLocked} 
                                                lockedMessage={lockedMessage} 
                                                onClick={() => startLesson(lessonId)}
                                                offset={currentOffset}
                                            />
                                            {/* Connector to next lesson */}
                                            {(index < unit.lessons.length - 1) && (
                                                <Connector color={unit.color} startOffset={currentOffset} endOffset={nextOffset} />
                                            )}
                                        </div>
                                    );
                                    
                                    isPreviousLessonCompleted = isCompleted;
                                    previousLessonTitle = `${unit.title} - ${displayTitle}`;
                                    globalIndex++;
                                    return lessonNode;
                                })}
                                
                                {/* Connector to Chest */}
                                <div className="w-full">
                                     <Connector color={unit.color} startOffset={pattern[(globalIndex - 1) % pattern.length]} endOffset={0} />
                                </div>
                                
                                {/* Chest Node (Centered) */}
                                <div className="flex justify-center">
                                    <div className={`relative flex flex-col items-center z-10 py-2`}>
                                        <button onClick={(!unitComplete && !progress.openedChests?.includes(unit.id)) ? undefined : () => onOpenChest && onOpenChest(unit.id)} disabled={!unitComplete || progress.openedChests?.includes(unit.id)} className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-xl transition-transform duration-300 border-b-8 border-black/10 ${progress.openedChests?.includes(unit.id) ? 'bg-transparent border-none shadow-none' : !unitComplete ? 'bg-gray-300 dark:bg-gray-700 grayscale opacity-50' : 'bg-gradient-to-b from-yellow-300 to-orange-500 hover:scale-105 cursor-pointer animate-bounce'}`}>
                                            {progress.openedChests?.includes(unit.id) ? <div className="text-yellow-500 opacity-50"><Box size={60} /></div> : <div className="text-white drop-shadow-md"><Box size={48} fill="currentColor" /></div>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const handleSaveProfile = () => {
        if (onUpdateProfile) {
            onUpdateProfile({ displayName: editName, photoURL: editPhoto });
            alert("Profile updated!");
        }
    };

    return (
        <div className={`flex h-screen ${settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            
            <ActionRail 
                settings={settings} 
                updateSettings={updateSettings} 
                onLogout={onLogout} 
                setView={setView} 
                currentView={view} 
                openTerminal={() => setShowTerminal(true)} 
                lang={settings.language} 
                onPairClick={() => onStartPairProgramming?.('new')} 
                openSettings={() => setShowSettings(true)} 
                hasProjects={true} 
                hasMentor={progress.mentorModeUnlocked}
                isOpen={isMobileSidebarOpen}
                setIsOpen={setIsMobileSidebarOpen}
            />
            
            <div className="flex-1 flex flex-col h-full relative overflow-hidden md:ml-64 transition-all duration-300">
                 {/* Mobile Header - Simple Menu Trigger */}
                 <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white z-20 shadow-sm sticky top-0">
                     <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                         <Menu size={24} />
                     </button>
                     <div className="flex items-center gap-2 ml-4 font-bold text-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm">🐍</div>
                        <span>Pythonlingo</span>
                     </div>
                 </div>

                 {/* Content Area */}
                 <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative">
                    {view === 'home' && renderHome()}
                    {view === 'stats' && <StatsView progress={progress} unitsConfig={unitsConfig} />}
                    {view === 'leaderboard' && (
                        <div className="max-w-2xl mx-auto pb-20">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Trophy className="text-yellow-500" /> Leaderboard</h2>
                            <RealLeaderboard user={user} lang={settings.language} />
                        </div>
                    )}
                    {view === 'chat' && <ChatView user={user} lang={settings.language} />}
                    {view === 'playground' && <Playground />}
                    {view === 'flashcards' && <Flashcards />}
                    {view === 'projects' && <ProjectBuilder />}
                    {view === 'mentor' && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8"><GraduationCap size={64} className="text-yellow-500 mb-4" /><h2 className="text-2xl font-bold">Mentor Mode</h2><p className="text-gray-500">Coming Soon</p></div>
                    )}
                 </div>
                 
                 {/* Pyssss Chat Widget - Self Positioning */}
                 <PyssssChat onFiveClicks={() => onUnlockHiddenUnit ? onUnlockHiddenUnit() : false} />
            </div>

            {/* Terminal Overlay */}
            {showTerminal && <Terminal onClose={() => setShowTerminal(false)} font={settings.font} onRedeemSecret={onRedeemSecret} onCheat={onCheat} />}
            
            {progress.burnoutEndTime && progress.burnoutEndTime > Date.now() && <BurnoutOverlay endTime={progress.burnoutEndTime} onComplete={() => {}} />}

            {/* Settings Modal - WITH PROFILE EDITOR */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><Settings size={20}/> Settings</h2>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white"><X size={20} /></button>
                        </div>

                        {/* Profile Section */}
                        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                             <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><UserIcon size={14}/> Profile</h3>
                             <div className="space-y-3">
                                 <div>
                                     <label className="text-xs font-bold text-gray-400 block mb-1">Display Name</label>
                                     <input 
                                         value={editName}
                                         onChange={e => setEditName(e.target.value)}
                                         className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white"
                                     />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-gray-400 block mb-1">Avatar URL (Try: https://api.dicebear.com/7.x/avataaars/svg?seed=YourName)</label>
                                     <div className="flex gap-2">
                                         <input 
                                             value={editPhoto}
                                             onChange={e => setEditPhoto(e.target.value)}
                                             className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white"
                                         />
                                         <button onClick={() => setEditPhoto(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)} className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xl" title="Randomize"><Camera size={18}/></button>
                                     </div>
                                 </div>
                                 <button onClick={handleSaveProfile} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-sm">Save Profile</button>
                             </div>
                        </div>

                        {/* General Settings */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 text-blue-500 rounded-lg"><Volume2 size={18}/></div><span className="font-bold text-sm dark:text-white">Sound Effects</span></div>
                                <button onClick={() => updateSettings({ soundEffects: !settings.soundEffects })} className={`w-10 h-5 rounded-full relative transition-colors ${settings.soundEffects ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.soundEffects ? 'translate-x-5' : ''}`} /></button>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 text-purple-500 rounded-lg"><Eye size={18}/></div><span className="font-bold text-sm dark:text-white">Bionic Reading</span></div>
                                <button onClick={() => updateSettings({ bionicReading: !settings.bionicReading })} className={`w-10 h-5 rounded-full relative transition-colors ${settings.bionicReading ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.bionicReading ? 'translate-x-5' : ''}`} /></button>
                            </div>
                            
                            {/* Dark Mode Toggle - Added for Mobile Access */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-lg">
                                        <Moon size={18}/>
                                    </div>
                                    <span className="font-bold text-sm dark:text-white">Dark Mode</span>
                                </div>
                                <button 
                                    onClick={() => updateSettings({ darkMode: !settings.darkMode })} 
                                    className={`w-10 h-5 rounded-full relative transition-colors ${settings.darkMode ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* FONT SELECTOR */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 text-indigo-500 rounded-lg"><Type size={18}/></div><span className="font-bold text-sm dark:text-white">App Font</span></div>
                                <select 
                                    value={settings.font}
                                    onChange={(e) => updateSettings({ font: e.target.value as any })}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm p-1 dark:text-white"
                                >
                                    <option value="sans">Sans</option>
                                    <option value="serif">Serif</option>
                                    <option value="mono">Mono</option>
                                    <option value="dyslexic">Dyslexic</option>
                                </select>
                            </div>

                            {/* LANGUAGE SELECTOR */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                                <div className="flex items-center gap-3"><div className="p-2 bg-pink-100 text-pink-500 rounded-lg"><Languages size={18}/></div><span className="font-bold text-sm dark:text-white">Language</span></div>
                                <select 
                                    value={settings.language}
                                    onChange={(e) => updateSettings({ language: e.target.value as any })}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm p-1 dark:text-white max-w-[120px]"
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l.code} value={l.code}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button onClick={onLogout} className="w-full mt-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
