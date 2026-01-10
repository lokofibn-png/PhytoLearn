import React, { useEffect, useState, useRef } from 'react';
import { User, PairSession, SessionUser } from '../types';
import { presenceService } from '../services/presenceService';
import { runPythonRepl } from '../services/geminiService';
import { Copy, Play, Terminal, ArrowLeft, Users, Loader2, Share2 } from 'lucide-react';
import CodeEditor from './CodeEditor';

interface PairProgrammingProps {
  user: User;
  sessionId: string;
  onExit: () => void;
  onComplete?: (xp: number) => void; // XP Reward handler
}

const PairProgramming: React.FC<PairProgrammingProps> = ({ user, sessionId, onExit, onComplete }) => {
  const [session, setSession] = useState<PairSession | null>(null);
  const [localCode, setLocalCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  
  // Refs for cursor tracking and optimistic updates
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCursorUpdate = useRef<number>(0);
  const lastLocalEdit = useRef<number>(0);

  // Initialize Session
  useEffect(() => {
    const cleanup = presenceService.joinSession(
      sessionId, 
      { id: user.id, name: user.displayName || user.email.split('@')[0] || 'Coder' },
      (updatedSession) => {
        setSession(updatedSession);
        
        // Update local code logic
        setLocalCode((prev) => {
            // If the incoming code is the same, do nothing
            if (prev === updatedSession.code) return prev;

            // If we typed very recently (< 500ms), assume our local version is newer/conflict
            // preventing jitter.
            const timeSinceEdit = Date.now() - lastLocalEdit.current;
            if (timeSinceEdit < 500 && document.activeElement?.tagName === 'TEXTAREA') {
                return prev; 
            }
            
            // Otherwise, accept the remote update
            return updatedSession.code; 
        });
      }
    );
    return () => cleanup();
  }, [sessionId, user]);

  // Handle Mouse Move for Cursors
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const now = Date.now();
    if (now - lastCursorUpdate.current < 50) return; // Throttle 50ms

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Percentage
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Percentage

    presenceService.updateCursor(sessionId, user.id, x, y);
    lastCursorUpdate.current = now;
  };

  const handleCodeChange = (newCode: string) => {
    lastLocalEdit.current = Date.now();
    setLocalCode(newCode);
    presenceService.updateCode(sessionId, newCode);
  };

  const handleRun = async () => {
    if (!session) return;
    
    // Set running state shared
    presenceService.updateOutput(sessionId, session.output, true);
    setIsRunning(true);

    // Run locally via Gemini simulation
    const output = await runPythonRepl(session.code, []);
    
    // Push output to everyone
    presenceService.updateOutput(sessionId, output, false);
    setIsRunning(false);

    // Reward XP if code ran successfully (simple logic)
    if (onComplete && output && !output.includes('Error')) {
        onComplete(50); // Split XP logic handled by passed prop usually, just giving fixed 50 here
    }
  };

  const copyInvite = () => {
    const url = `${window.location.origin}/?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    alert("Invite link copied to clipboard!");
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Connecting to satellite...</p>
      </div>
    );
  }

  // Typed helper for users to avoid 'unknown' inference with Object.values on Record
  const sessionUsers: SessionUser[] = session.users ? Object.values(session.users) : [];
  const otherUsers = sessionUsers.filter(u => u.id !== user.id);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
                <Users size={20} className="text-green-400" />
                Pair Programming
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Avatars */}
          <div className="flex -space-x-2 mr-4">
            {sessionUsers.map((u) => (
              <div 
                key={u.id} 
                className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden"
                style={{ backgroundColor: u.color }}
                title={u.name}
              >
                {u.name[0].toUpperCase()}
              </div>
            ))}
          </div>

          <button 
            onClick={copyInvite}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <Share2 size={16} /> Share
          </button>
          
          <button 
            onClick={handleRun}
            disabled={session.isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                session.isRunning 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'
            }`}
          >
            {session.isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run Shared
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex-1 flex flex-col md:flex-row relative bg-[#1e1e1e]"
      >
        
        {/* Editor Area */}
        <div className="flex-1 relative flex flex-col h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-700">
            {/* Ghost Cursors Layer */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {otherUsers.map(u => (
                    <div 
                        key={u.id}
                        className="absolute transition-all duration-100 ease-out flex flex-col items-start"
                        style={{ 
                            left: `${u.cursorX}%`, 
                            top: `${u.cursorY}%`,
                            opacity: (Date.now() - u.lastActive) > 10000 ? 0.3 : 1 // Fade if inactive
                        }}
                    >
                        {/* Cursor Arrow */}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: u.color }} className="drop-shadow-md">
                            <path d="M0 0L6 14L8.5 8.5L14 6L0 0Z" fill="currentColor"/>
                        </svg>
                        {/* Name Tag */}
                        <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-3 mt-1 text-white shadow-sm whitespace-nowrap"
                            style={{ backgroundColor: u.color }}
                        >
                            {u.name}
                        </span>
                    </div>
                ))}
            </div>

            <CodeEditor 
                code={localCode}
                onChange={handleCodeChange}
                placeholder="# Collaborate here..."
            />
        </div>

        {/* Output Terminal */}
        <div className="h-1/2 md:h-full md:w-1/3 bg-[#0c0c0c] flex flex-col font-mono text-sm border-l border-gray-800">
            <div className="bg-[#1f1f1f] px-4 py-2 text-gray-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wider border-b border-gray-800">
                <Terminal size={14} /> Shared Terminal
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-gray-300 whitespace-pre-wrap leading-relaxed">
                {session.output || <span className="text-gray-600 italic"># Run code to see output...</span>}
                {session.isRunning && <span className="animate-pulse text-green-500">_</span>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default PairProgramming;