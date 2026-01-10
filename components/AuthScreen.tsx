import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { Loader2, Mail, Lock, LogIn, UserPlus, Calendar, ShieldCheck, ArrowLeft, AlertTriangle, X, Info } from 'lucide-react';
import Mascot from './Mascot';
import { MascotMood } from '../types';
import InfoModal from './InfoModal';
import InstallPWA from './InstallPWA';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP';

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState<'GOOGLE' | 'APPLE' | 'GUEST' | 'EMAIL' | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  
  // Info Modal State
  const [showInfo, setShowInfo] = useState(false);
  const [infoTimer, setInfoTimer] = useState(true);
  
  useEffect(() => {
      if (typeof window !== 'undefined') {
          try {
              const hasSeen = localStorage.getItem('pythonlingo_intro_seen');
              if (!hasSeen) {
                  // Delay slightly to allow rendering to settle
                  setTimeout(() => {
                      setInfoTimer(true);
                      setShowInfo(true);
                  }, 500);
              }
          } catch(e) {
              // Ignore localstorage errors (privacy mode)
          }
      }
  }, []);

  const handleCloseInfo = () => {
      if (typeof window !== 'undefined') {
          try {
              localStorage.setItem('pythonlingo_intro_seen', 'true');
          } catch(e) {}
      }
      setShowInfo(false);
  };

  const handleManualOpenInfo = () => {
      setInfoTimer(false);
      setShowInfo(true);
  };

  const handleSocialLogin = async (provider: 'GOOGLE' | 'APPLE' | 'GUEST') => {
    setIsLoading(provider);
    setError(null);
    try {
      let user;
      if (provider === 'GOOGLE') {
        user = await authService.loginWithGoogle();
      } else if (provider === 'APPLE') {
        user = await authService.loginWithApple();
      } else {
        user = await authService.loginAsGuest();
      }
      onAuthSuccess(user);
    } catch (err: any) {
      console.error(err);
      handleError(err);
    }
  };

  const validateInput = () => {
      const cleanEmail = email.trim();
      const cleanPass = password.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
          setError("Please enter a valid email address.");
          return false;
      }

      if (cleanPass.length < 6) {
          setError("Password must be at least 6 characters long.");
          return false;
      }

      if (authMode === 'SIGNUP' && !birthday) {
          setError("Please enter your birthday.");
          return false;
      }

      return true;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
        setError("Please fill in email and password.");
        return;
    }
    
    if (!validateInput()) return;
    
    setIsLoading('EMAIL');

    try {
        let user;
        if (authMode === 'LOGIN') {
            user = await authService.loginWithEmail(email, password);
        } else {
            // Direct Signup
            user = await authService.registerWithEmail(email, password, birthday);
            // Set flag for Install Prompt in Dashboard
            try { sessionStorage.setItem('pyssss_just_signed_up', 'true'); } catch(e) {}
        }
        onAuthSuccess(user);
    } catch (err: any) {
        handleError(err);
    }
  };

  const handleError = (err: any) => {
        console.error(err);
        let msg = "Authentication failed.";
        
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
            msg = "Invalid email or password.";
        } else if (err.code === 'auth/email-already-in-use') {
            msg = "That email is already being used. Try logging in.";
        } else if (err.code === 'auth/weak-password') {
            msg = "Password should be at least 6 characters.";
        } else if (err.code === 'auth/popup-blocked') {
            msg = "The login popup was blocked. Please allow popups for this site.";
        } else if (err.code === 'auth/popup-closed-by-user') {
            msg = "Sign in cancelled.";
        } else if (err.code === 'auth/operation-not-allowed') {
            msg = "This sign-in method is not enabled in the Firebase Console.";
        } else if (err.code === 'auth/unauthorized-domain') {
            msg = "This domain is not authorized in Firebase Console -> Authentication -> Settings.";
        } else if (err.message) {
            msg = err.message;
        }
        
        setError(msg);
        setIsLoading(null);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 py-8 sm:p-6 relative overflow-x-hidden transition-colors duration-500">
      
      <InfoModal isOpen={showInfo} onClose={handleCloseInfo} showTimer={infoTimer} />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-200 dark:bg-green-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-0 -right-20 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-20 w-80 h-80 bg-yellow-200 dark:bg-yellow-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center z-10">
            
            {/* Left Side: Branding */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="relative group cursor-pointer mt-4 md:mt-0">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <Mascot mood={MascotMood.HAPPY} className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 relative transform transition-transform group-hover:scale-105 duration-300" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                        Python<span className="text-green-500">lingo</span>
                        <span className="ml-2 text-base md:text-xl text-gray-400 dark:text-gray-600 font-mono font-medium opacity-50">v3.0</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-md font-medium leading-relaxed mx-auto md:mx-0">
                        The fun, free, and <span className="text-green-600 dark:text-green-400 font-bold">snake-tastic</span> way to learn Python programming.
                    </p>
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <InstallPWA className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-green-500 transition-colors bg-white/30 dark:bg-gray-800/30 px-3 py-1 rounded-full hover:bg-white dark:hover:bg-gray-800" buttonText="Install App" />
                        <button 
                            onClick={handleManualOpenInfo}
                            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-400 hover:text-green-500 transition-colors bg-white/30 dark:bg-gray-800/30 px-2 py-1 rounded-full hover:bg-white dark:hover:bg-gray-800"
                        >
                            <Info size={12} /> About
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Card */}
            <div className="flex justify-center md:justify-end w-full">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/50 dark:border-gray-700 flex flex-col gap-4 relative transition-all">
                    
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                        <button 
                            onClick={() => { setAuthMode('LOGIN'); setError(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'LOGIN' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => { setAuthMode('SIGNUP'); setError(null); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${authMode === 'SIGNUP' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-xl text-xs font-medium border border-red-100 dark:border-red-800 animate-slide-up flex gap-2 items-start">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* --- LOGIN / SIGNUP FORM --- */}
                    <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 animate-fade-in flex-1">
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password (min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                required
                            />
                        </div>

                        {authMode === 'SIGNUP' && (
                            <div className="relative animate-fade-in group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                                <input 
                                    type="date" 
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
                                    required
                                />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isLoading === 'EMAIL'}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98] text-sm"
                        >
                            {isLoading === 'EMAIL' ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'LOGIN' ? <LogIn size={18} /> : <UserPlus size={18} />)}
                            {authMode === 'LOGIN' ? 'Log In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Social Login Divider */}
                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white dark:bg-gray-800 text-gray-400 font-medium text-[10px] uppercase rounded-full">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-start h-[60px]">
                        <button 
                            onClick={() => handleSocialLogin('GOOGLE')}
                            disabled={!!isLoading}
                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-xl transition-all flex items-center justify-center h-[44px]"
                            title="Sign in with Google"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                        </button>
                        
                        <div className="flex flex-col items-center gap-1 w-full">
                            <button 
                                onClick={() => handleSocialLogin('APPLE')}
                                disabled={!!isLoading}
                                className="relative w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-xl transition-all flex items-center justify-center h-[44px]"
                                title="Sign in with Apple"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-black dark:text-white opacity-40">
                                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.23 3.6-1.14 1.35.08 2.75.69 3.58 1.95-3.07 1.62-2.37 5.74.88 7.23-.9 1.98-2.2 3.66-3.14 4.19zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.54 4.33-3.74 4.25z" />
                                </svg>
                                <X className="absolute text-red-500 w-5 h-5" strokeWidth={3} />
                            </button>
                            <span className="text-[9px] text-red-500 font-bold text-center leading-tight">
                                no $100/mo fee
                            </span>
                        </div>

                        <button 
                            onClick={() => handleSocialLogin('GUEST')}
                            disabled={!!isLoading}
                            className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-xl transition-all flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-xs h-[44px]"
                        >
                            Guest
                        </button>
                    </div>
                    
                    <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">
                        By continuing, you agree to Pyssss's Terms.
                    </p>

                </div>
            </div>

      </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;