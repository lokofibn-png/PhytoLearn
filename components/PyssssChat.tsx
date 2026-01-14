
import React, { useState, useEffect, useRef } from 'react';
import Mascot from './Mascot';
import { MascotMood } from '../types';

interface PyssssChatProps {
    onFiveClicks?: () => boolean; // Returns true if it was a new unlock
}

const TIPS = [
  "Use snake_case for variable names! 🐍",
  "Lists are like backpacks - they hold anything!",
  "Ctrl+Enter runs your code faster",
  "len() tells you how many items are in a list",
  "str() converts numbers to text",
  "Comments (#) help you remember tricky parts",
  "Loops save you from typing the same thing twice",
  "if/else is like choosing a path in a game",
  "Functions are reusable code blocks",
  "range() counts for you automatically",
  "print() is your best debugging friend",
  "Don't forget the colon at the end of if/while/for lines!",
  "Indentation matters in Python - it's not just style",
  "You can nest lists inside lists!",
  "Tired? Take a break. Pyssss will wait for you."
];

type Phase = 'IDLE' | 'TYPING' | 'SHOWING_TIP';

const PyssssChat: React.FC<PyssssChatProps> = ({ onFiveClicks }) => {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [currentTip, setCurrentTip] = useState<string>('');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [seenTips, setSeenTips] = useState<number[]>([]);
  
  // Easter Egg Click Tracking
  const [clickCount, setClickCount] = useState(0);
  
  // Refs to manage timers and prevent leaks
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeWriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clickResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to pick a random tip without immediate repeats
  const pickTip = () => {
    let availableIndices = TIPS.map((_, i) => i).filter(i => !seenTips.includes(i));
    
    if (availableIndices.length === 0) {
      // Reset if all shown
      availableIndices = TIPS.map((_, i) => i);
      setSeenTips([]);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setSeenTips(prev => [...prev, randomIndex]);
    return TIPS[randomIndex];
  };

  const clearAllTimers = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (readingTimeoutRef.current) clearTimeout(readingTimeoutRef.current);
    if (typeWriterIntervalRef.current) clearInterval(typeWriterIntervalRef.current);
  };

  // State Machine Logic
  useEffect(() => {
    // Phase 1: Idle -> Wait 5s -> Go to Typing
    if (phase === 'IDLE') {
        idleTimeoutRef.current = setTimeout(() => {
            setPhase('TYPING');
        }, 5000);
    } 
    // Phase 2: Typing -> Wait 2s -> Pick Tip -> Go to Show Tip
    else if (phase === 'TYPING') {
        setDisplayedText(''); 
        typingTimeoutRef.current = setTimeout(() => {
            const newTip = pickTip();
            setCurrentTip(newTip);
            setPhase('SHOWING_TIP');
        }, 2000);
    }
    // Phase 3: Showing Tip -> Typewriter effect -> Wait -> Go to Idle
    else if (phase === 'SHOWING_TIP') {
        let charIndex = 0;
        setDisplayedText('');
        
        // Typewriter Effect
        typeWriterIntervalRef.current = setInterval(() => {
            charIndex++;
            setDisplayedText(currentTip.slice(0, charIndex));
            
            if (charIndex >= currentTip.length) {
                if (typeWriterIntervalRef.current) clearInterval(typeWriterIntervalRef.current);
                
                // Finished typing, hold for 4 seconds then hide
                readingTimeoutRef.current = setTimeout(() => {
                    setPhase('IDLE');
                }, 4000);
            }
        }, 30); // 30ms per character
    }

    return () => clearAllTimers();
  }, [phase, currentTip]); // Re-run when phase changes

  // Immediate Interaction
  const handleClick = () => {
      // 1. Handle Easter Egg Click Counting
      setClickCount(prev => prev + 1);
      
      // Reset count after 2 seconds of inactivity
      if (clickResetTimeoutRef.current) clearTimeout(clickResetTimeoutRef.current);
      clickResetTimeoutRef.current = setTimeout(() => setClickCount(0), 2000);

      if (clickCount + 1 >= 5) {
          if (onFiveClicks) {
              const unlocked = onFiveClicks();
              if (unlocked) {
                  clearAllTimers();
                  setCurrentTip("🕵️‍♂️ SECRET UNLOCKED: The Hidden Python Unit is now visible!");
                  setDisplayedText("🕵️‍♂️ SECRET UNLOCKED: The Hidden Python Unit is now visible!");
                  setPhase('SHOWING_TIP');
                  setClickCount(0);
                  return;
              }
          }
          setClickCount(0); // Reset if already unlocked or no handler
      }

      // 2. Standard Tip Behavior
      clearAllTimers();
      const newTip = pickTip();
      setCurrentTip(newTip);
      setDisplayedText(newTip); // Show full text immediately
      setPhase('SHOWING_TIP');
  };

  return (
    <div className="fixed z-50 right-4 bottom-4 md:right-8 md:bottom-8 group">
      
      {/* Chat Bubble - Positioned relative to the corner anchor */}
      <div 
        className={`
            absolute bottom-full mb-4 right-0
            w-max max-w-[200px] md:max-w-[300px] min-w-[150px]
            bg-[#1a1a2ee6] backdrop-blur-sm
            border border-[#2ecc714d] 
            text-white text-lg font-medium
            px-6 py-5 rounded-2xl rounded-br-none shadow-2xl
            transition-all duration-300 ease-in-out
            origin-bottom-right
            pointer-events-none
            ${phase === 'IDLE' ? 'opacity-0 scale-90 translate-y-4 visibility-hidden' : 'opacity-100 scale-100 translate-y-0'}
        `}
      >
        {phase === 'TYPING' && (
             <div className="flex justify-center items-center gap-2 h-6">
                <div className="w-3 h-3 bg-[#2ecc71] rounded-full animate-typing-dot" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-[#2ecc71] rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-[#2ecc71] rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }}></div>
             </div>
        )}
        
        {phase === 'SHOWING_TIP' && (
             <span className="leading-snug block text-center">
                 {displayedText}
             </span>
        )}
      </div>

      {/* Mascot Avatar */}
      <div 
        role="button"
        aria-label="Get a tip from Pyssss"
        onClick={handleClick}
        className="relative w-24 h-24 md:w-32 md:h-32 cursor-pointer transition-transform duration-300 group-hover:scale-110 active:scale-95"
      >
         {/* Glow effect behind mascot */}
         <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
         
         <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-2xl border-[5px] border-green-500 relative flex items-center justify-center">
             {/* Reuse existing Mascot SVG but scaled to fit icon context */}
             <div className="w-[140%] h-[140%] -mt-1">
                 <Mascot mood={MascotMood.HAPPY} className="w-full h-full" />
             </div>
         </div>

         {/* Pulse Ring when Idle to attract attention occasionally */}
         {phase === 'IDLE' && (
             <div className="absolute inset-0 border-[5px] border-green-500 rounded-full animate-mascot-pulse opacity-50 pointer-events-none"></div>
         )}
      </div>
    </div>
  );
};

export default PyssssChat;
