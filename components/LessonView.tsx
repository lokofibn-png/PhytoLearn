import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseType, AppSettings, MascotMood } from '../types';
import Mascot from './Mascot';
import CodeEditor from './CodeEditor';
import { validateCodeWithAI, getAiHint } from '../services/geminiService';
import { Check, HelpCircle, X, ChevronRight, RefreshCw, Zap, Heart, FileText } from 'lucide-react';
import { soundService } from '../services/soundService';

interface LessonViewProps {
  lessonTitle: string;
  learningContent: string[];
  exercises: Exercise[];
  onComplete: (xp: number) => void;
  onExit: (success: boolean) => void; // Updated to accept success status
  loseHeart: () => void;
  hearts: number;
  settings: AppSettings;
  currentXp: number;
  mode?: 'LEARN' | 'TEST';
}

const LessonView: React.FC<LessonViewProps> = ({
  lessonTitle,
  learningContent,
  exercises,
  onComplete,
  onExit,
  loseHeart,
  hearts,
  settings,
  currentXp,
  mode = 'LEARN'
}) => {
  const isTestMode = mode === 'TEST';
  const [phase, setPhase] = useState<'READING' | 'QUIZ' | 'FAILED'>('READING');
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [quizXp, setQuizXp] = useState(0);
  
  // AI Prompt Interaction State
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  
  // Test Mode Logic (Local hearts)
  const [testHearts, setTestHearts] = useState(2);

  // Initialize
  useEffect(() => {
    // If Test Mode, skip reading phase immediately
    if (isTestMode && phase === 'READING') {
        setPhase('QUIZ');
    }
  }, [isTestMode]);

  // Handle AI Thinking Delay on new exercise
  useEffect(() => {
      if (phase === 'QUIZ') {
          setShowAiPrompt(false);
          const timer = setTimeout(() => {
              setShowAiPrompt(true);
          }, 1000); // 1 Second "Thinking" delay
          return () => clearTimeout(timer);
      }
  }, [currentExerciseIdx, phase]);

  // Initialize code for WRITE_CODE exercises
  useEffect(() => {
    if (phase === 'QUIZ') {
       const current = exercises[currentExerciseIdx];
       if (current.type === ExerciseType.WRITE_CODE || current.type === ExerciseType.FILL_BLANK) {
           setUserCode(current.initialCode || '');
       } else {
           setUserCode('');
       }
       setFeedback(null);
       setHint(null);
    }
  }, [phase, currentExerciseIdx, exercises]);

  const renderBionicText = (text: string) => {
    if (!settings.bionicReading) return text;
    return text.split(' ').map(word => {
       const mid = Math.ceil(word.length / 2);
       return `<b>${word.slice(0, mid)}</b>${word.slice(mid)}`;
    }).join(' ');
  };

  const handleCheck = async () => {
      if (isChecking) return;
      setIsChecking(true);
      setFeedback(null);

      const currentEx = exercises[currentExerciseIdx];
      let isCorrect = false;
      let msg = '';

      try {
        if (currentEx.type === ExerciseType.MULTIPLE_CHOICE) {
            isCorrect = userCode === currentEx.solution;
            msg = isCorrect ? "Correct!" : "Try again.";
        } else {
            // Code validation
            // For simple matches or Fill Blank
            if (Array.isArray(currentEx.solution)) {
                // Check if userCode contains any of the solution strings
                // Simple normalize
                const normUser = userCode.replace(/'/g, '"').replace(/\s+/g, '');
                isCorrect = currentEx.solution.some(s => {
                    const normSol = s.replace(/'/g, '"').replace(/\s+/g, '');
                    return normUser.includes(normSol);
                });
                msg = isCorrect ? "Correct!" : "Check your syntax.";
            } else {
                // AI Validation for complex WRITE_CODE
                if (currentEx.type === ExerciseType.WRITE_CODE) {
                     // Pass Language to AI
                     const validation = await validateCodeWithAI(
                         userCode, 
                         currentEx.prompt, 
                         currentEx.solution as string,
                         settings.language
                     );
                     isCorrect = validation.isCorrect;
                     msg = validation.feedback;
                } else {
                     // Fallback exact match
                     isCorrect = userCode.trim() === (currentEx.solution as string).trim();
                     msg = isCorrect ? "Correct!" : "Incorrect.";
                }
            }
        }
      } catch (e) {
          console.error(e);
          msg = "Error checking code.";
      }

      if (isCorrect) {
          soundService.playCorrect();
          setFeedback({ isCorrect: true, message: msg || "Great job!" });
          setQuizXp(prev => prev + 10);
      } else {
          soundService.playIncorrect();
          
          if (isTestMode) {
              const newHearts = testHearts - 1;
              setTestHearts(newHearts);
              if (newHearts <= 0) {
                  setFeedback({ isCorrect: false, message: "Test Failed!" });
                  setTimeout(() => {
                      setPhase('FAILED');
                      onExit(false); // Report Failure immediately to trigger burnout tracking
                  }, 1000);
              } else {
                  setFeedback({ isCorrect: false, message: "Wrong! You lost a heart." });
              }
          } else {
              loseHeart();
              // Standard mode failure logic if hearts reach 0 could go here too if we tracked it locally
              // For now, failure is only 'Hard Fail' in Test Mode or if user quits
              setFeedback({ isCorrect: false, message: msg || "Oops, try again!" });
          }
      }
      setIsChecking(false);
  };

  const handleNext = () => {
      if (currentExerciseIdx < exercises.length - 1) {
          setCurrentExerciseIdx(prev => prev + 1);
          setFeedback(null);
          setHint(null);
          setUserCode('');
      } else {
          // Lesson Complete
          onComplete(100 + quizXp + (isTestMode ? 50 : 0)); // Bonus XP for test
      }
  };

  const handleHint = async () => {
      if (currentExerciseIdx >= exercises.length) return;
      const ex = exercises[currentExerciseIdx];
      
      if (ex.hint) {
          setHint(ex.hint);
          return;
      }
      
      // Use AI for hint with language
      setIsChecking(true);
      const hintText = await getAiHint(userCode, ex.prompt, undefined, settings.language);
      setHint(hintText);
      setIsChecking(false);
  };

  const progressPercent = phase === 'READING' ? 0 : ((currentExerciseIdx) / exercises.length) * 100;

  // --- FAILURE SCREEN ---
  if (phase === 'FAILED') {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center animate-fade-in">
              <Mascot mood={MascotMood.SAD} className="w-32 h-32 mb-6" />
              <h1 className="text-3xl font-bold mb-2 text-red-500">Test Failed!</h1>
              <p className="text-gray-400 mb-8 max-w-md">
                  You ran out of hearts. Review the lesson material and try again to prove your mastery!
              </p>
              <div className="flex gap-4">
                  <button 
                    onClick={() => onExit(false)}
                    className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl font-bold"
                  >
                      Return Home
                  </button>
                  <button 
                    onClick={() => {
                        setPhase('READING'); // Will trigger switch to QUIZ via useEffect
                        setTestHearts(2);
                        setCurrentExerciseIdx(0);
                        setQuizXp(0);
                        setFeedback(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold"
                  >
                      Try Again
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className={`flex flex-col h-screen ${settings.darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-500">
         <div className="flex items-center gap-4">
             <button onClick={() => onExit(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                 <X size={24} className="text-gray-500 dark:text-gray-400" />
             </button>
             <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-500 ${isTestMode ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${progressPercent}%` }}></div>
             </div>
         </div>
         <div className="flex items-center gap-4 font-bold">
             {isTestMode ? (
                 <div className="flex items-center gap-1 text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                    <span className="text-xs uppercase mr-1">Test Mode</span>
                    <Heart fill="currentColor" size={20} /> {testHearts}
                 </div>
             ) : (
                 <div className="flex items-center gap-1 text-red-500 animate-pulse">
                     <Heart fill="currentColor" size={20} /> {hearts}
                 </div>
             )}
             <div className="flex items-center gap-1 text-yellow-500">
                 <Zap fill="currentColor" size={20} /> {currentXp + quizXp}
             </div>
         </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center w-full">
        
        {phase === 'READING' ? (
            <div className="w-full max-w-3xl pb-20">
                <style>{`
                    @keyframes scale-in-subtle {
                        0% { transform: scale(0.9) translateY(10px); opacity: 0; }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                    .animate-scale-in {
                        animation: scale-in-subtle 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }
                `}</style>

                <div className="flex items-center gap-4 mb-4 animate-scale-in" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                    <Mascot mood={MascotMood.DEFAULT} className="w-14 h-14 sm:w-16 sm:h-16" hasBackpack={settings.offlineMode} />
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">{lessonTitle}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Study Guide</p>
                    </div>
                </div>

                <div className={`border-2 rounded-2xl p-4 sm:p-6 space-y-3 shadow-sm transition-colors animate-scale-in ${
                    settings.offlineMode 
                    ? 'bg-stone-200 dark:bg-stone-800 border-stone-300 dark:border-stone-700' 
                    : 'bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700'
                }`} style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}>
                    {learningContent.map((paragraph, idx) => (
                        <div key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                            {paragraph.split('\n').map((line, i) => (
                                <p key={i} className="mb-2" dangerouslySetInnerHTML={{
                                    __html: renderBionicText(line)
                                }} />
                            ))}
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => setPhase('QUIZ')}
                    className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg animate-fade-in"
                    style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}
                >
                    Start Quiz
                </button>
            </div>
        ) : (
            <div className="w-full max-w-3xl mb-6 animate-fade-in pb-20">
                {/* AI Interactive Prompt */}
                 <div className="mb-8 flex flex-col md:flex-row items-center md:items-start gap-4">
                    <Mascot mood={MascotMood.HAPPY} className="w-24 h-24 shrink-0" hasBackpack={settings.offlineMode} />
                    <div className="flex-1 w-full md:w-auto">
                        {!showAiPrompt ? (
                             <div className="flex items-center gap-2 text-gray-400 animate-pulse mt-4 md:mt-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                <span className="font-bold text-sm">Thinking...</span>
                             </div>
                        ) : (
                             <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 p-5 rounded-2xl rounded-tl-none relative shadow-md animate-pop-up">
                                 {/* Triangle Tail */}
                                 <div className="absolute -left-2 -top-[2px] w-4 h-4 bg-green-100 dark:bg-[#143d26] border-l-2 border-t-2 border-green-300 dark:border-green-700 transform -rotate-45"></div>
                                 <h2 className="text-xl font-bold text-green-900 dark:text-green-200">
                                     {exercises[currentExerciseIdx].prompt}
                                 </h2>
                             </div>
                        )}
                    </div>
                 </div>

                 {/* Show Interaction Area Only if Prompt is Ready */}
                 <div className={`transition-opacity duration-500 ${showAiPrompt ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                     {exercises[currentExerciseIdx].type === ExerciseType.MULTIPLE_CHOICE ? (
                         <div className="grid grid-cols-1 gap-3">
                             {exercises[currentExerciseIdx].options?.map((opt, i) => (
                                 <button
                                    key={i}
                                    onClick={() => setUserCode(opt)}
                                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${
                                        userCode === opt 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500 text-blue-700 dark:text-blue-300' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-300'
                                    }`}
                                 >
                                     {opt}
                                 </button>
                             ))}
                         </div>
                     ) : (
                         <div className="space-y-4">
                             <CodeEditor 
                                 code={userCode} 
                                 onChange={setUserCode}
                                 placeholder={isTestMode ? "Type solution here..." : "Type your full python code here..."}
                             />
                         </div>
                     )}

                     {/* Hint Area - Only in Learn Mode */}
                     {!isTestMode && hint && (
                         <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-200 dark:border-yellow-700 flex gap-3 items-start animate-fade-in">
                             <HelpCircle className="shrink-0 mt-0.5" size={20} />
                             <div>
                                 <p className="font-bold text-sm">Hint:</p>
                                 <p>{hint}</p>
                             </div>
                         </div>
                     )}

                     {/* Feedback Area */}
                     {feedback && (
                         <div className={`mt-6 p-4 rounded-xl border-2 flex items-center gap-4 animate-pop-up ${
                             feedback.isCorrect 
                             ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' 
                             : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
                         }`}>
                             {feedback.isCorrect ? <Check size={28} /> : <X size={28} />}
                             <div className="flex-1">
                                 <p className="font-bold text-lg">{feedback.isCorrect ? 'Amazing!' : 'Incorrect'}</p>
                                 <p>{feedback.message}</p>
                             </div>
                         </div>
                     )}
                 </div>
            </div>
        )}
      </div>

      {/* Footer Controls */}
      {phase === 'QUIZ' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
              {/* Hide Hint Button in Test Mode */}
              {!isTestMode ? (
                  <button 
                     onClick={handleHint}
                     className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-2 font-bold"
                  >
                      <HelpCircle size={20} /> <span className="hidden sm:inline">Hint</span>
                  </button>
              ) : (
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Test Mode</div>
              )}

              {feedback?.isCorrect ? (
                  <button 
                     onClick={handleNext}
                     className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                  >
                      Continue <ChevronRight size={20} />
                  </button>
              ) : (
                  <button 
                     onClick={handleCheck}
                     disabled={!userCode || isChecking || !showAiPrompt}
                     className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 min-w-[120px] justify-center"
                  >
                      {isChecking ? (
                          <>
                            <RefreshCw className="animate-spin" size={20} />
                            <span>Checking...</span>
                          </>
                      ) : 'Check'}
                  </button>
              )}
          </div>
      )}

    </div>
  );
};

export default LessonView;