import { networkService } from "./networkService";

// --- WEB-LOCAL MODEL CONFIGURATION ---
// We use @xenova/transformers via CDN to run entirely in the browser.
// No API keys, no backend, no Ollama required.
// Using 'LaMini-Flan-T5-77M' which is ~300MB uncompressed (very fast download for an LLM).
const MODEL_NAME = 'Xenova/LaMini-Flan-T5-77M';

let generator: any = null;
let isModelLoading = false;

// --- RULE-BASED ENGINE (OFFLINE BRAIN) ---
// This provides instant, offline responses while the smarter model loads.
const RULES: Record<string, string> = {
    "hello": "Sssssup! I'm Pyssss. 🐍",
    "hi": "Hiss there! Ready to write some Python?",
    "help": "I can help with variables, loops, functions, and lists.",
    "variable": "Variables are like boxes 📦 where you store data. Example: `score = 10`",
    "loop": "Loops help you repeat code. `for` counts things, `while` waits for a condition.",
    "function": "Functions are reusable recipes of code. Define them with `def name():`",
    "list": "Lists store multiple items. `my_list = [1, 2, 3]`",
    "python": "Python is a snake-tastic language! Readable, powerful, and fun.",
    "thank": "You're welcome! Happy coding! 🥚",
    "snake": "Yesss? That's me! 🐍",
    "error": "Errors are just clues! Check line numbers and spelling carefully.",
    "print": "Use `print('text')` to show output on the screen."
};

// --- INTERNAL HELPERS ---

async function loadWebModel() {
    if (generator || isModelLoading) return;
    if (!networkService.isOnline) {
        console.warn("Offline mode: skipping local LLM load.");
        return;
    }

    isModelLoading = true;
    
    try {
        console.log("⏳ Initializing Web-Local LLM...");
        
        // Dynamic import from CDN to avoid build-step dependencies
        // @ts-ignore
        const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
        
        // Settings for browser execution
        env.allowLocalModels = false; // Force fetch from HuggingFace Hub
        env.useBrowserCache = true;   // Cache weights so second load is instant
        
        // Load the pipeline
        generator = await pipeline('text2text-generation', MODEL_NAME);
        console.log("✅ Web-Local LLM Ready!");
    } catch (e) {
        console.warn("Web-Local LLM failed to load. Staying on Rule-Based Engine.", e);
    } finally {
        isModelLoading = false;
    }
}

function ruleBasedChat(message: string): string {
    const lower = message.toLowerCase();
    
    // Exact/Partial Matches
    for (const [key, val] of Object.entries(RULES)) {
        if (lower.includes(key)) return val;
    }

    // Default Fallbacks
    if (lower.includes("?")) return "Good question! Try testing that code in the Playground.";
    if (lower.length < 5) return "Hiss? Could you say more? 🐍";
    
    return "I'm running locally! Ask me about variables, loops, or functions. 🎒";
}

// --- EXPORTED API ---

export const chatWithPyssss = async (message: string, lang: string = 'en'): Promise<string> => {
    // 1. Trigger model load in background if not ready (first interaction)
    if (!generator && !isModelLoading) {
        loadWebModel();
    }

    // 2. If model is ready, use it for a smarter response
    if (generator) {
        try {
            const prompt = `You are Pyssss, a helpful Python snake tutor. Explain simply. User: ${message} (Language: ${lang})`;
            const output = await generator(prompt, {
                max_new_tokens: 60,
                temperature: 0.6,
                repetition_penalty: 1.2,
                do_sample: true
            });
            // T5 returns array of objects with generated_text
            const text = output[0]?.generated_text;
            if (text) return text + " 🐍";
        } catch (e) {
            console.error("LLM Generation failed, falling back to rules.", e);
        }
    }

    // 3. Fallback to Rules (Instant)
    return ruleBasedChat(message);
};

export const getAiHint = async (code: string, problem: string, error?: string, lang: string = 'en'): Promise<string> => {
    // Try smart hint via Web LLM if loaded
    if (generator) {
        try {
            const prompt = `Provide a short python hint. Problem: ${problem}. Code: ${code}. Error: ${error ?? 'None'}. Language: ${lang}.`;
            const output = await generator(prompt, { max_new_tokens: 40 });
            return output[0]?.generated_text || "Check your syntax carefully!";
        } catch(e) {}
    }

    // Heuristic Hints (Offline/Loading)
    const codeLower = code.toLowerCase();
    if (code.trim() === "") return "Start by typing some code! Don't be shy. 🐍";
    
    if (problem.toLowerCase().includes("print")) {
        if (!codeLower.includes("print")) return "You need to use the `print()` function.";
        if (!codeLower.includes("(") || !codeLower.includes(")")) return "Don't forget parentheses! `print(...)`";
        if (!codeLower.includes('"') && !codeLower.includes("'")) return "Text needs quotes! `print(\"Hello\")`";
    }

    if (problem.toLowerCase().includes("variable") || problem.toLowerCase().includes("store")) {
        if (!code.includes("=")) return "Use the `=` sign to assign a value.";
    }

    if (problem.toLowerCase().includes("loop")) {
        if (!codeLower.includes("for") && !codeLower.includes("while")) return "You likely need a `for` or `while` loop.";
        if (!codeLower.includes(":")) return "Loops need a colon `:` at the end.";
    }

    return "Check your syntax carefully! Make sure your spelling matches.";
};

export const validateCodeWithAI = async (
  userCode: string, 
  taskPrompt: string, 
  expectedSolution: string,
  lang: string = 'en'
): Promise<{ isCorrect: boolean; feedback: string }> => {
    // 1. Normalize Code (Robust Offline Check)
    const normUser = userCode.trim().replace(/'/g, '"').replace(/\s+/g, ' ');
    const normSol = expectedSolution.trim().replace(/'/g, '"').replace(/\s+/g, ' ');

    // 2. Check Containment
    const isCorrect = normUser.includes(normSol);

    if (isCorrect) {
        return { isCorrect: true, feedback: "Sssspectacular! Your code looks correct. 🎉" };
    }

    // 3. Optional: Smart Feedback via Web LLM
    if (generator) {
        try {
            const prompt = `Task: ${taskPrompt}. Code: ${userCode}. Respond in ${lang}. Is it correct? Answer Yes or No.`;
            const output = await generator(prompt, { max_new_tokens: 16 });
            const text = output[0]?.generated_text?.toLowerCase() || "";
            
            if (text.includes("yes") || text.includes("correct")) {
                 return { isCorrect: true, feedback: "AI says: Great job! Correct." };
            }
        } catch(e) {}
    }

    return { 
        isCorrect: false, 
        feedback: "Not quite. Check for typos, missing quotes, or indentation! 🧐" 
    };
};

export const runPythonRepl = async (command: string, installedPackages: string[]): Promise<string> => {
    // --- LOCAL JAVASCRIPT SIMULATION OF PYTHON ---
    const cmd = command.trim();
    
    // Basic Arithmetic
    if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(cmd)) {
        try { return eval(cmd).toString(); } catch(e) { return "Syntax Error"; }
    }

    // Print Simulation
    if (cmd.startsWith("print(")) {
        const strMatch = cmd.match(/print\(("|')(.*?)("|')\)/);
        if (strMatch) return strMatch[2];
        
        const numMatch = cmd.match(/print\(([\d\+\-\*\/\s\(\)\.]+)\)/);
        if (numMatch) {
             try { return eval(numMatch[1]).toString(); } catch(e) { return "Error"; }
        }
    }
    
    // Special commands
    if (cmd.includes("import this")) return "Beautiful is better than ugly.\nExplicit is better than implicit...\n(The Zen of Python) 🧘";
    if (cmd.includes("import antigravity")) return "🚀 Whoosh! You are flying!";
    if (cmd.startsWith("len(")) return "Length check simulated.";
    if (cmd.startsWith("type(")) return "<class 'simulated'>";

    return "Result: (Local Mode: Use print(), math, or strings) 🐍";
};
