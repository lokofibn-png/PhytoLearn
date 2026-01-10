import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react';

const DECK = [
    { q: "What function outputs text to the screen?", a: "print()" },
    { q: "How do you define a function?", a: "def function_name():" },
    { q: "Symbol for comments?", a: "# (Hashtag)" },
    { q: "List syntax?", a: "[item1, item2]" },
    { q: "Dictionary syntax?", a: "{key: value}" },
    { q: "How to get length of list?", a: "len(my_list)" },
    { q: "Convert string to integer?", a: "int('5')" },
    { q: "Boolean values?", a: "True, False" },
    { q: "Loop a specific number of times?", a: "for i in range(n):" },
    { q: "Check if item exists in list?", a: "if item in list:" },
    { q: "Add item to list?", a: "list.append(item)" },
    { q: "Import a library?", a: "import math" },
    { q: "Modulo operator (remainder)?", a: "% (e.g. 5 % 2)" },
    { q: "Exponent operator?", a: "** (e.g. 2 ** 3)" },
    { q: "Not equal operator?", a: "!=" }
];

const Flashcards = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % DECK.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + DECK.length) % DECK.length);
        }, 150);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="text-blue-500" /> Flashcards
            </h2>

            <div className="relative w-full max-w-md h-64 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center p-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-4">Question</p>
                            <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-white">
                                {DECK[currentIndex].q}
                            </p>
                            <p className="absolute bottom-4 text-xs text-gray-400 animate-pulse">Tap to flip</p>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-blue-500 text-white rounded-2xl flex items-center justify-center p-6 rotate-y-180">
                        <div>
                            <p className="text-xs text-blue-200 uppercase font-bold tracking-widest mb-4">Answer</p>
                            <p className="text-xl sm:text-2xl font-bold font-mono">
                                {DECK[currentIndex].a}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-8">
                <button onClick={handlePrev} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-white hover:scale-110 transition-transform">
                    <ChevronLeft size={24} />
                </button>
                <span className="font-mono text-gray-500 font-bold">
                    {currentIndex + 1} / {DECK.length}
                </span>
                <button onClick={handleNext} className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg hover:scale-110 transition-transform">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default Flashcards;