import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, MoreVertical, X, Phone, Smartphone } from 'lucide-react';
import Mascot from './Mascot';
import { MascotMood } from '../types';

interface InstallPWAProps {
    className?: string;
    buttonText?: string;
    triggerOnMount?: boolean; // For auto-prompt after signup
}

const InstallPWA: React.FC<InstallPWAProps> = ({ className, buttonText = "Install App", triggerOnMount = false }) => {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        const android = /android/.test(userAgent);
        setIsIOS(ios);
        setIsAndroid(android);

        // Check if already installed/standalone
        const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(standalone);

        // Check for deferred prompt (Android/Chrome)
        const handler = (e: any) => {
            e.preventDefault();
            setPromptInstall(e);
            setSupportsPWA(true);
        };

        // If event already fired before mount
        if ((window as any).deferredPrompt) {
            setPromptInstall((window as any).deferredPrompt);
            setSupportsPWA(true);
        }

        window.addEventListener('beforeinstallprompt', handler);

        // Auto Trigger Check
        if (triggerOnMount && !standalone) {
            // Delay slightly for UX
            setTimeout(() => setShowModal(true), 1500);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [triggerOnMount]);

    const handleInstallClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent bubbling if in a button container
        
        // If native prompt is available (Android/Desktop Chrome)
        if (promptInstall) {
            promptInstall.prompt();
            promptInstall.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setPromptInstall(null);
            });
        } else {
            // Fallback to manual instructions (iOS or generic Android)
            setShowModal(true);
        }
    };

    if (isStandalone) return null; // Hide if already installed

    return (
        <>
            {/* Trigger Button */}
            <button 
                onClick={handleInstallClick}
                className={className || "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md"}
            >
                <Download size={18} />
                <span>{buttonText}</span>
            </button>

            {/* Instruction Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-up relative" onClick={e => e.stopPropagation()}>
                        
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-full">
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <Mascot mood={MascotMood.EXCITED} className="w-24 h-24 mb-4" />
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Install Pythonlingo</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                                Add the app to your home screen for the best full-screen learning experience.
                            </p>

                            {/* iOS Instructions */}
                            {isIOS && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl w-full text-left space-y-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Share size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">1. Tap the <span className="text-blue-500">Share</span> button in your browser bar.</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 ml-5"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg text-gray-600 dark:text-gray-200">
                                            <PlusSquare size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">2. Scroll down and tap <span className="whitespace-nowrap">'Add to Home Screen'</span>.</span>
                                    </div>
                                </div>
                            )}

                            {/* Android Instructions (Manual fallback if native prompt failed/missing) */}
                            {(!isIOS) && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl w-full text-left space-y-4 border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg text-gray-600 dark:text-gray-200">
                                            <MoreVertical size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">1. Tap the <span className="font-black">three dots</span> menu in your browser.</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 ml-5"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Smartphone size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">2. Tap <span className="font-black">'Install app'</span> or 'Add to Home screen'.</span>
                                    </div>
                                </div>
                            )}
                            
                            <button 
                                onClick={() => setShowModal(false)}
                                className="mt-6 w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-bold transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstallPWA;