import React, { useState, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import { runPythonRepl, chatWithPyssss } from '../services/geminiService';
import { Play, Save, Eraser, MessageSquare, Loader2, Code as CodeIcon } from 'lucide-react';

const Playground = () => {
    const [code, setCode] = useState<string>("print('Hello World')");
    const [output, setOutput] = useState<string>("");
    const [isRunning, setIsRunning] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState<string>("");

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pyssss_playground_code');
        if (saved) setCode(saved);
    }, []);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("");
        setExplanation("");
        const res = await runPythonRepl(code, []);
        setOutput(res);
        setIsRunning(false);
    };

    const handleSave = () => {
        localStorage.setItem('pyssss_playground_code', code);
        alert("Code saved to local browser storage!");
    };

    const handleClear = () => {
        if(confirm("Clear editor?")) {
            setCode("");
            setOutput("");
            setExplanation("");
        }
    };

    const handleExplain = async () => {
        if (!code.trim()) return;
        setIsExplaining(true);
        const prompt = `Explain this Python code simply for a beginner:\n\`\`\`python\n${code}\n\`\`\``;
        const res = await chatWithPyssss(prompt);
        setExplanation(res);
        setIsExplaining(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
            {/* Header Toolbar */}
            <div className="bg-gray-100 dark:bg-gray-900 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <CodeIcon size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800 dark:text-white">Python Playground</h2>
                        <p className="text-xs text-gray-500">Experiment freely</p>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={handleClear} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg" title="Clear">
                        <Eraser size={18} />
                    </button>
                    <button onClick={handleSave} className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg" title="Save">
                        <Save size={18} />
                    </button>
                    <button 
                        onClick={handleExplain} 
                        disabled={isExplaining}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                    >
                        {isExplaining ? <Loader2 size={16} className="animate-spin"/> : <MessageSquare size={16} />}
                        Explain
                    </button>
                    <button 
                        onClick={handleRun} 
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isRunning ? <Loader2 size={16} className="animate-spin"/> : <Play size={16} />}
                        Run
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                {/* Editor */}
                <div className="flex-1 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <CodeEditor 
                        code={code} 
                        onChange={setCode} 
                        placeholder="# Write your experiments here..." 
                    />
                </div>

                {/* Output Panel */}
                <div className="h-1/3 md:h-auto md:w-1/3 bg-[#1e1e1e] flex flex-col font-mono text-sm">
                    <div className="bg-[#2d2d2d] px-4 py-2 text-gray-400 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
                        <span>Output / Explanation</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto text-gray-300 whitespace-pre-wrap leading-relaxed custom-scrollbar">
                        {explanation ? (
                            <div className="text-blue-300 italic mb-4 border-b border-gray-700 pb-4">
                                <strong className="block text-blue-400 not-italic mb-1">🤖 Pyssss Explanation:</strong>
                                {explanation}
                            </div>
                        ) : null}
                        
                        {output ? (
                            <span>{output}</span>
                        ) : (
                            !explanation && <span className="text-gray-600 italic"># Results will appear here...</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Playground;