import React, { useState } from 'react';
import { Hammer, Play, CheckCircle2, ChevronRight, Code, Loader2 } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { runPythonRepl, validateCodeWithAI } from '../services/geminiService';

const PROJECTS = [
    {
        id: 'calc',
        title: 'CLI Calculator',
        description: 'Build a calculator that takes an input string like "5 + 5" and prints the result.',
        template: 'def calculate(expression):\n    # Your code here\n    pass\n\n# Test it\nprint(calculate("10 / 2"))',
        requirements: 'Must handle +, -, *, / operators.',
        validation: 'Output "5.0" for input "10 / 2"'
    },
    {
        id: 'palindrome',
        title: 'Palindrome Detector',
        description: 'Check if a string reads the same backwards as forwards (ignoring case).',
        template: 'def is_palindrome(text):\n    # Return True or False\n    pass',
        requirements: 'Must return True for "Racecar".',
        validation: 'Return True for "Racecar"'
    },
    {
        id: 'ascii_box',
        title: 'ASCII Art Box',
        description: 'Write a function that prints text inside a box of asterisks.',
        template: 'def print_box(text):\n    # Print the box\n    pass',
        requirements: 'Border should fit text length exactly.',
        validation: 'Prints output containing * characters around text'
    }
];

const ProjectBuilder = () => {
    const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
    const [code, setCode] = useState(PROJECTS[0].template);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{success: boolean, msg: string} | null>(null);

    const handleSelect = (proj: typeof PROJECTS[0]) => {
        setSelectedProject(proj);
        setCode(proj.template);
        setOutput("");
        setResult(null);
    };

    const handleRun = async () => {
        setIsRunning(true);
        const out = await runPythonRepl(code, []);
        setOutput(out);
        setIsRunning(false);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const res = await validateCodeWithAI(code, selectedProject.description, selectedProject.requirements);
        setResult({ success: res.isCorrect, msg: res.feedback });
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex h-full flex-col md:flex-row">
                {/* Sidebar List */}
                <div className="md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-2">
                    <h2 className="font-black text-gray-400 uppercase tracking-widest text-xs mb-2">Projects</h2>
                    {PROJECTS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className={`p-3 rounded-xl text-left text-sm font-bold flex items-center justify-between transition-all ${
                                selectedProject.id === p.id 
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            {p.title}
                            {selectedProject.id === p.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>

                {/* Main Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                    <Hammer className="text-indigo-500" /> {selectedProject.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-2xl">
                                    {selectedProject.description}
                                </p>
                                <p className="text-xs text-indigo-500 font-bold mt-2">
                                    Goal: {selectedProject.requirements}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
                                >
                                    {isRunning ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />} Run
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Submit
                                </button>
                            </div>
                        </div>
                        {result && (
                            <div className={`mt-4 p-3 rounded-xl text-sm font-bold border ${result.success ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} animate-pop-up`}>
                                {result.success ? "✅ Passed! Great work." : `❌ ${result.msg}`}
                            </div>
                        )}
                    </div>

                    {/* Editor & Output Split */}
                    <div className="flex-1 flex flex-col md:flex-row min-h-0">
                        <div className="flex-1 border-r border-gray-200 dark:border-gray-700 relative">
                            <CodeEditor code={code} onChange={setCode} placeholder="# Build your project..." />
                        </div>
                        <div className="h-1/3 md:h-auto md:w-1/3 bg-[#0c0c0c] text-gray-300 font-mono text-xs p-4 overflow-y-auto">
                            <div className="text-gray-500 font-bold mb-2 uppercase tracking-wider text-[10px]">Terminal Output</div>
                            <div className="whitespace-pre-wrap">{output || <span className="italic opacity-50">Run code to see output...</span>}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectBuilder;