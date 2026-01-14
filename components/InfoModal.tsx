import React, { useEffect, useState } from 'react';
import { Info, Heart, Code, Bug } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  showTimer?: boolean; // Only show timer on first view
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, showTimer = true }) => {
  const [timeLeft, setTimeLeft] = useState(showTimer ? 3 : 0);
  const [canClose, setCanClose] = useState(!showTimer);

  useEffect(() => {
    if (isOpen && showTimer) {
      // Reset logic when opened
      setTimeLeft(3);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (isOpen && !showTimer) {
        setCanClose(true);
        setTimeLeft(0);
    }
  }, [isOpen, showTimer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative animate-slide-up">
        
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
            <Info size={32} />
          </div>

          <h2 className="text-2xl font-black text-gray-800 dark:text-white">About Pythonlingo</h2>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="font-medium">
              This app has been built with great support and strong updates. 🚀
            </p>
            
            <p>
              Please send bugs and your ideas to:
              <br/>
              <span className="font-bold text-blue-500 select-all">PythonLearnerTeam@gmail.com</span>
              <br/>
              <span className="text-xs text-green-600 dark:text-green-400 font-bold">(We respond within 24h)</span>
            </p>

            <p className="italic opacity-80">
              Everything is free unlike others!
            </p>

            <hr className="border-gray-200 dark:border-gray-600" />

            <div className="flex gap-2 items-start text-xs opacity-75 text-left">
              <Code size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                Designed & Built with ❤️ for the Python Community.
                <br/>
                <span className="font-bold text-blue-500">Updating constantly!</span>
              </span>
            </div>
            
            <p className="font-bold text-green-500 flex items-center justify-center gap-2">
              <Heart size={16} fill="currentColor" /> 
              Happy learning!
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={!canClose}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
              canClose
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transform active:scale-95'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canClose ? "Continue" : `Please read (${timeLeft}s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;