
import React from 'react';
import { UserProgress, UnitConfig, getLevel } from '../types';
import { Trophy, Flame, Crosshair, Zap, Award, Lock, CheckCircle2, TrendingUp, BookOpen, Box, Key, Star, Crown, GraduationCap } from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  unitsConfig: UnitConfig[];
}

const ACHIEVEMENT_LIST = [
    { id: 'first_step', title: 'Hello World', desc: 'Complete your first lesson', icon: <CheckCircle2 />, condition: (p: UserProgress) => p.completedLessons.length >= 1 },
    { id: 'streak_3', title: 'Heating Up', desc: 'Reach a 3 day streak', icon: <Flame />, condition: (p: UserProgress) => p.streak >= 3 },
    { id: 'treasure', title: 'Treasure Hunter', desc: 'Open a Unit Chest', icon: <Box />, condition: (p: UserProgress) => (p.openedChests?.length || 0) > 0 },
    { id: 'level_5', title: 'High Five', desc: 'Reach Level 5', icon: <TrendingUp />, condition: (p: UserProgress) => getLevel(p.xp) >= 5 },
    { id: 'scholar', title: 'Scholar', desc: 'Complete 10 lessons', icon: <BookOpen />, condition: (p: UserProgress) => p.completedLessons.length >= 10 },
    { id: 'secret', title: 'Secret Agent', desc: 'Unlock the Hidden Unit', icon: <Key />, condition: (p: UserProgress) => !!p.hiddenUnitUnlocked },
    { id: 'streak_7', title: 'Unstoppable', desc: 'Reach a 7 day streak', icon: <Zap />, condition: (p: UserProgress) => p.streak >= 7 },
    { id: 'veteran', title: 'Veteran', desc: 'Complete 25 lessons', icon: <Star />, condition: (p: UserProgress) => p.completedLessons.length >= 25 },
    { id: 'streak_14', title: 'Marathon', desc: 'Reach a 14 day streak', icon: <Flame className="text-red-600" />, condition: (p: UserProgress) => p.streak >= 14 },
    { id: 'mentor', title: 'The Mentor', desc: 'Unlock Mentor Mode', icon: <GraduationCap />, condition: (p: UserProgress) => !!p.mentorModeUnlocked },
    { id: 'master', title: 'Python Master', desc: 'Reach Level 20', icon: <Trophy />, condition: (p: UserProgress) => getLevel(p.xp) >= 20 },
    { id: 'legend', title: 'Living Legend', desc: 'Reach Level 50', icon: <Crown />, condition: (p: UserProgress) => getLevel(p.xp) >= 50 },
];

const StatCard = ({ icon, label, value, color, subValue }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} text-white shadow-md`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black text-gray-800 dark:text-white">{value}</h3>
            {subValue && <p className="text-xs text-gray-400 font-medium">{subValue}</p>}
        </div>
    </div>
);

const StatsView: React.FC<StatsViewProps> = ({ progress, unitsConfig }) => {
    const currentLevel = getLevel(progress.xp);
    const totalLessons = progress.completedLessons.length;
    
    // Calculate Total Available Lessons to show percentage
    const totalAvailableLessons = unitsConfig.reduce((acc, unit) => acc + unit.lessons.length, 0);
    const totalCompletion = Math.round((totalLessons / Math.max(totalAvailableLessons, 1)) * 100);

    // Mock Weekly Data (Static for visualization as backend doesn't store daily history yet)
    const weeklyActivity = [20, 45, 0, 120, 60, 30, 80];
    const maxActivity = Math.max(...weeklyActivity);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            
            {/* Header */}
            <div className="text-center sm:text-left">
                <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Your Progress</h2>
                <p className="text-gray-500 dark:text-gray-400">Track your journey to Python mastery.</p>
            </div>

            {/* 1. Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={<Zap size={24} />} 
                    label="Total XP" 
                    value={progress.xp} 
                    color="bg-yellow-500" 
                    subValue="Experience Points"
                />
                <StatCard 
                    icon={<Flame size={24} />} 
                    label="Current Streak" 
                    value={progress.streak} 
                    color="bg-orange-500" 
                    subValue="Days in a row"
                />
                <StatCard 
                    icon={<CheckCircle2 size={24} />} 
                    label="Lessons Done" 
                    value={totalLessons} 
                    color="bg-green-500" 
                    subValue={`${totalCompletion}% Completion`}
                />
                <StatCard 
                    icon={<Crosshair size={24} />} 
                    label="Current Level" 
                    value={currentLevel} 
                    color="bg-blue-500" 
                    subValue="Keep climbing!"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 2. Skill Breakdown (Left Col - 2 spans) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-500" /> Skill Proficiency
                        </h3>
                        <div className="space-y-6">
                            {unitsConfig.map((unit) => {
                                const unitCompleted = unit.lessons.filter(l => progress.completedLessons.includes(l)).length;
                                const unitTotal = unit.lessons.length;
                                const pct = Math.round((unitCompleted / unitTotal) * 100);
                                
                                return (
                                    <div key={unit.id}>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">{unit.title}</span>
                                            <span className="font-mono text-xs text-gray-500">{unitCompleted}/{unitTotal}</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 bg-${unit.color}-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly Activity Graph */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" /> Weekly Activity
                        </h3>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {weeklyActivity.map((val, i) => {
                                const height = (val / maxActivity) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full bg-gray-100 dark:bg-gray-700 rounded-t-lg h-full overflow-hidden flex items-end">
                                            <div 
                                                className="w-full bg-green-500 hover:bg-green-400 transition-all duration-500 rounded-t-lg"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-2 py-1 rounded transition-opacity pointer-events-none">
                                                {val} XP
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {['M','T','W','T','F','S','S'][i]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3. Achievements (Right Col) */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" /> Achievements
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {ACHIEVEMENT_LIST.map((ach) => {
                            const isUnlocked = ach.condition(progress);
                            return (
                                <div 
                                    key={ach.id} 
                                    className={`
                                        flex items-center gap-4 p-3 rounded-xl border-2 transition-all
                                        ${isUnlocked 
                                            ? 'border-yellow-100 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 opacity-100' 
                                            : 'border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-50 grayscale'}
                                    `}
                                >
                                    <div className={`p-2 rounded-full ${isUnlocked ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' : 'bg-gray-200 text-gray-400 dark:bg-gray-700'}`}>
                                        {isUnlocked ? ach.icon : <Lock size={20} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isUnlocked ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500'}`}>{ach.title}</h4>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{ach.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StatsView;
