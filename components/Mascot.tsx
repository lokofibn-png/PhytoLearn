import React from 'react';
import { MascotMood } from '../types';

interface MascotProps {
  mood: MascotMood;
  className?: string;
  onClick?: () => void;
  hasBackpack?: boolean;
}

const Mascot: React.FC<MascotProps> = ({ mood, className = "", onClick, hasBackpack = false }) => {
  // Animation State Logic
  const isExcited = mood === MascotMood.EXCITED;
  const isHappy = mood === MascotMood.HAPPY;
  const isSad = mood === MascotMood.SAD;
  const isBreathing = mood === MascotMood.DEFAULT || mood === MascotMood.THINKING;

  // Eye Logic
  const getEyes = () => {
    if (mood === MascotMood.SAD) {
       return (
         <g>
            <path d="M35 45 Q40 40 45 45" stroke="black" strokeWidth="2" fill="none" />
            <path d="M55 45 Q60 40 65 45" stroke="black" strokeWidth="2" fill="none" />
            {/* Sad Tear */}
            <circle cx="68" cy="55" r="2" fill="#60a5fa" opacity="0.8" />
         </g>
       );
    }
    // Normal / Happy / Thinking
    return (
       <g>
          <circle cx="40" cy="45" r="3" fill="black" />
          <circle cx="60" cy="45" r="3" fill="black" />
       </g>
    );
  };

  // Mouth Logic
  const getMouth = () => {
    switch (mood) {
      case MascotMood.HAPPY:
      case MascotMood.EXCITED:
        return <path d="M40 60 Q50 68 60 60" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case MascotMood.SAD:
        return <path d="M40 65 Q50 58 60 65" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case MascotMood.THINKING:
        return <line x1="45" y1="62" x2="55" y2="62" stroke="#333" strokeWidth="2" strokeLinecap="round" />;
      default:
        return <path d="M42 60 Q50 63 58 60" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  // Confetti Logic
  const renderConfetti = () => {
    if (mood !== MascotMood.EXCITED) return null;
    
    // Increased particle count for better effect
    return (
      <g pointerEvents="none">
        {[...Array(20)].map((_, i) => {
           // Create particles in a circle
           const angle = (i * (360 / 20)) * (Math.PI / 180);
           const dist = 60 + Math.random() * 20; // Randomize distance slightly
           const tx = Math.cos(angle) * dist;
           const ty = Math.sin(angle) * dist - 15;
           const color = ['#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#a855f7', '#ec4899'][i % 6];
           const size = 2 + Math.random() * 2;
           
           return (
             <circle 
                key={`confetti-${i}`}
                cx="50" 
                cy="50" 
                r={size}
                fill={color} 
                className="confetti-particle"
                style={{"--tx": `${tx}px`, "--ty": `${ty}px`, animationDelay: `${Math.random() * 0.2}s`} as React.CSSProperties}
             />
           );
        })}
      </g>
    );
  };

  return (
    <div 
      className={`relative w-32 h-32 cursor-pointer transition-transform duration-300 transform-origin-bottom
        ${isExcited ? 'animate-bounce' : ''} 
        ${isHappy ? 'animate-wiggle' : ''} 
        ${isSad ? 'animate-slump' : ''} 
        ${isBreathing ? 'animate-breathe' : ''} 
        ${className}`}
      onClick={onClick}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Background Confetti (behind snake) */}
        {mood === MascotMood.EXCITED && renderConfetti()}

        {/* Backpack (Offline Mode) */}
        {hasBackpack && (
           <g transform="translate(10, 50) rotate(-10)">
              <rect x="0" y="0" width="25" height="30" rx="5" fill="#8B4513" stroke="#5D4037" strokeWidth="2" />
              <path d="M0 10 H25" stroke="#5D4037" strokeWidth="2" />
              <rect x="5" y="15" width="15" height="10" rx="2" fill="#A0522D" />
              <path d="M5 0 L5 -5 L20 -5 L20 0" fill="none" stroke="#8B4513" strokeWidth="3" />
           </g>
        )}

        {/* Snake Body Coils (The "Boot") */}
        {/* Adjusted coordinates: Raised bottom curve from 93 to 88 to prevent clipping */}
        <path 
            d="M25 80 Q15 65 30 58 T70 58 T85 80 Q90 88 55 88 Q20 88 25 80 Z" 
            fill="#22c55e" 
            stroke="#15803d" 
            strokeWidth="3" 
            strokeLinejoin="round"
        />
        {/* Highlight on body for volume */}
        <path 
            d="M30 80 Q25 70 35 63 T65 63 T80 80" 
            fill="none"
            stroke="#4ade80" 
            strokeWidth="4"
            opacity="0.6" 
            strokeLinecap="round"
        />
        
        {/* Head Shape */}
        <ellipse cx="50" cy="50" rx="30" ry="28" fill="#22c55e" stroke="#15803d" strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="25" ry="23" fill="#4ade80" />

        {/* Glasses - Frame */}
        <circle cx="40" cy="45" r="10" stroke="#1e293b" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
        <circle cx="60" cy="45" r="10" stroke="#1e293b" strokeWidth="2" fill="rgba(255,255,255,0.3)" />
        <line x1="50" y1="45" x2="50" y2="45" stroke="#1e293b" strokeWidth="2" /> {/* Bridge */}
        
        {/* Eyes */}
        {getEyes()}

        {/* Mouth */}
        {getMouth()}

        {/* Tongue */}
        {mood === MascotMood.EXCITED && (
           <path d="M50 65 Q50 75 47 80 M50 65 Q50 75 53 80" stroke="#ef4444" strokeWidth="2" fill="none" />
        )}

        {/* Graduation Cap (Mortarboard) - Only show if NO backpack */}
        {!hasBackpack && (
          <g transform="translate(0, -10)">
              {/* Tassel */}
              <path d="M80 30 L80 45" stroke="#fbbf24" strokeWidth="2" /> 
              <circle cx="80" cy="45" r="2" fill="#fbbf24" />
              
              {/* Cap Top */}
              <path d="M50 10 L85 25 L50 40 L15 25 Z" fill="#374151" stroke="#1f2937" strokeWidth="2" />
              {/* Cap Base */}
              <path d="M30 32 V 45 Q50 50 70 45 V 32" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          </g>
        )}
      </svg>
      
      {mood === MascotMood.THINKING && (
         <div className="absolute top-0 right-0 text-2xl animate-pulse">🤔</div>
      )}
    </div>
  );
};

export default Mascot;