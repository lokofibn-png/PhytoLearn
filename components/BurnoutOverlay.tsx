
import React, { useState, useEffect } from 'react';
import { MascotMood } from '../types';
import Mascot from './Mascot';
import { Clock, PlayCircle, Quote, X } from 'lucide-react';
import { chatWithPyssss } from '../services/geminiService';

interface BurnoutOverlayProps {
    endTime: number;
    failedLessonId?: string;
    onComplete: () => void;
}

const MEMES_AND_CLIPS = [
    { type: 'JOKE', content: 'Why did the programmer quit his job? Because he didn\'t get arrays.' },
    { type: 'JOKE', content: 'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?"' },
    { type: 'FACT', content: 'Did you know? Python is named after Monty Python\'s Flying Circus, not the snake!' },
    { type: 'QUOTE', content: '"The only way to do great work is to love what you do." - Steve Jobs' },
    { type: 'FACT', content: 'In Python, `import this` displays the Zen of Python.' },
    { type: 'JOKE', content: 'Why do Python programmers prefer dark mode? Because light attracts bugs.' }
];

const BurnoutOverlay: React.FC<BurnoutOverlayProps> = ({ endTime, failedLessonId, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    const [aiTip, setAiTip] = useState<string>("Analyzing your brain waves... 🧠");
    const [contentIdx, setContentIdx] = useState(0);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const seconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            setTimeLeft(seconds);
            
            if (seconds <= 0) {
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    // AI Tip Fetcher
    useEffect(() => {
        const fetchTip = async () => {
            const context = failedLessonId 
                ? `The student just failed lesson '${failedLessonId}'. They are burned out.`
                : `The student is burned out from coding.`;
            
            const prompt = `${context} Give a very short, funny, encouraging 1-sentence tip to relax. Don't teach code right now, just emotional support.`;
            
            try {
                const response = await chatWithPyssss(prompt);
                setAiTip(response);
            } catch (e) {
                setAiTip("Take a deep breath. You got this!");
            }
        };
        fetchTip();
    }, [failedLessonId]);

    // Content Rotator
    useEffect(() => {
        const rotator = setInterval(() => {
            setContentIdx(prev => (prev + 1) % MEMES_AND_CLIPS.length);
        }, 10000); // Change every 10 seconds
        return () => clearInterval(rotator);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isFinished = timeLeft <= 0;

    const currentContent = MEMES_AND_CLIPS[contentIdx];

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-fade-in">
            <div className="max-w-md w-full flex flex-col items-center text-center space-y-8">
                
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-red-400 animate-pulse">Burnout Detected!</h1>
                    <p className="text-gray-300 font-medium">You're stuck. Pyssss says: "Take a break!"</p>
                </div>

                {/* Mascot & AI Tip */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <Mascot mood={MascotMood.THINKING} className="w-40 h-40 relative z-10" />
                    
                    <div className="absolute -right-20 top-0 bg-white text-gray-900 p-4 rounded-2xl rounded-bl-none shadow-xl max-w-[200px] text-sm font-bold transform rotate-3 animate-pop-up">
                        "{aiTip}"
                    </div>
                </div>

                {/* Timer */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-6xl font-mono font-bold tracking-widest text-white drop-shadow-lg">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 uppercase tracking-widest">
                        <Clock size={16} /> Cooldown Active
                    </div>
                </div>

                {/* Content Carousel */}
                <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-6 relative overflow-hidden min-h-[120px] flex items-center justify-center">
                    <div className="absolute top-2 left-2 text-gray-500">
                        {currentContent.type === 'JOKE' && "🤣 Python Joke"}
                        {currentContent.type === 'FACT' && "🧠 Did you know?"}
                        {currentContent.type === 'QUOTE' && "✨ Inspiration"}
                    </div>
                    <p className="text-lg font-medium text-center animate-fade-in" key={contentIdx}>
                        {currentContent.content}
                    </p>
                </div>

                {/* Footer Action */}
                <button 
                    onClick={onComplete}
                    disabled={!isFinished}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg transition-all transform
                        ${isFinished 
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105 cursor-pointer' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'}
                    `}
                >
                    {isFinished ? "I'm Ready to Code!" : "Relaxing..."}
                </button>

            </div>
        </div>
    );
};

export default BurnoutOverlay;
