import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Save, Folder, File, ChevronRight, ChevronDown, Plus, Trash2, FilePlus, FolderPlus, Sidebar } from 'lucide-react';
import { runPythonRepl } from '../services/geminiService';
import { checkSecret, SecretType, decodeSecretId } from '../utils/secrets';

interface TerminalProps {
  onClose: () => void;
  font: string;
  onRedeemSecret?: (secret: string) => { success: boolean, message: string };
  onCheat?: (type: SecretType) => void;
}

// --- FILE SYSTEM TYPES ---
type FileType = 'FILE' | 'DIR';

interface FSEntry {
  type: FileType;
  content?: string;
  children?: Record<string, FSEntry>;
}

const INITIAL_FS: Record<string, FSEntry> = {
  '~': {
    type: 'DIR',
    children: {
      'projects': {
        type: 'DIR',
        children: {
            'script.py': {
                type: 'FILE',
                content: 'print("Hello from projects!")'
            }
        }
      },
      'readme.txt': {
        type: 'FILE',
        content: 'Welcome to Pyssss Shell!\nThis is a simulated environment.\nYou can use python, pip, ls, cd, and nano.'
      },
      'hello.py': {
        type: 'FILE',
        content: 'print("Hello from the virtual file system! 🐍")'
      }
    }
  }
};

interface FileTreeItemProps {
    name: string;
    entry: FSEntry;
    fullPath: string[];
    depth: number;
    onOpen: (name: string, content: string) => void;
    onDelete: (path: string[]) => void;
    onCreate: (path: string[], type: 'FILE' | 'DIR', name: string) => void;
}

// --- HELPER: Recursive File Tree Component ---
const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
    name, 
    entry, 
    fullPath, 
    depth, 
    onOpen, 
    onDelete, 
    onCreate 
}) => {
    const [expanded, setExpanded] = useState(depth === 0); // Expand root by default
    const [isHovered, setIsHovered] = useState(false);

    const isDir = entry.type === 'DIR';
    const paddingLeft = `${depth * 12 + 10}px`;

    const handleCreateClick = (e: React.MouseEvent, type: 'FILE' | 'DIR') => {
        e.stopPropagation();
        const newName = prompt(`Enter name for new ${type === 'FILE' ? 'file' : 'directory'}:`);
        if (newName) {
            onCreate(fullPath, type, newName);
            setExpanded(true);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete ${name}?`)) {
            onDelete(fullPath);
        }
    };

    return (
        <div>
            <div 
                className={`
                    flex items-center justify-between py-1 pr-2 cursor-pointer select-none
                    text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors
                    ${expanded && isDir ? 'text-gray-200' : ''}
                `}
                style={{ paddingLeft }}
                onClick={() => isDir ? setExpanded(!expanded) : onOpen(name, entry.content || '')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-1.5 overflow-hidden">
                    {isDir && (
                        <span className="opacity-70">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                    )}
                    {!isDir && <span className="w-3.5"></span>} {/* Spacing for files */}
                    
                    {isDir ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-gray-500" />}
                    <span className="truncate text-sm">{name}</span>
                </div>

                {isHovered && (
                    <div className="flex items-center gap-1">
                        {isDir && (
                            <>
                                <button title="New File" onClick={(e) => handleCreateClick(e, 'FILE')} className="p-0.5 hover:bg-gray-700 rounded text-green-400">
                                    <FilePlus size={12} />
                                </button>
                                <button title="New Folder" onClick={(e) => handleCreateClick(e, 'DIR')} className="p-0.5 hover:bg-gray-700 rounded text-yellow-400">
                                    <FolderPlus size={12} />
                                </button>
                            </>
                        )}
                        {name !== '~' && ( // Prevent deleting root
                             <button title="Delete" onClick={handleDeleteClick} className="p-0.5 hover:bg-gray-700 rounded text-red-400">
                                <Trash2 size={12} />
                             </button>
                        )}
                    </div>
                )}
            </div>

            {isDir && expanded && entry.children && (
                <div className="flex flex-col">
                    {Object.entries(entry.children).map(([childName, childEntry]) => (
                        <FileTreeItem
                            key={childName}
                            name={childName}
                            entry={childEntry}
                            fullPath={[...fullPath, childName]}
                            depth={depth + 1}
                            onOpen={onOpen}
                            onDelete={onDelete}
                            onCreate={onCreate}
                        />
                    ))}
                    {Object.keys(entry.children).length === 0 && (
                        <div style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }} className="py-1 text-xs text-gray-600 italic">
                            (empty)
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const Terminal: React.FC<TerminalProps> = ({ onClose, font, onRedeemSecret, onCheat }) => {
  // Terminal State
  const [history, setHistory] = useState<string[]>([
      'Python 3.12.0 (main, Oct 2024) [GCC 11.2.0] on linux',
      '---', 
      'Welcome to Pyssss Shell',
      'Type "help" to see commands.'
  ]);
  const [input, setInput] = useState('');
  const [installedPackages, setInstalledPackages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Layout State
  const [showExplorer, setShowExplorer] = useState(true);

  // File System State
  const [fs, setFs] = useState<Record<string, FSEntry>>(() => {
      if (typeof window !== 'undefined') {
          try {
              const saved = localStorage.getItem('pyssss_terminal_fs');
              return saved ? JSON.parse(saved) : INITIAL_FS;
          } catch (e) { return INITIAL_FS; }
      }
      return INITIAL_FS;
  });
  const [path, setPath] = useState<string[]>(['~']);

  // Nano Editor State
  const [isNanoOpen, setIsNanoOpen] = useState(false);
  const [nanoFile, setNanoFile] = useState('');
  const [nanoContent, setNanoContent] = useState('');
  const [nanoMessage, setNanoMessage] = useState(''); 

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nanoRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
        localStorage.setItem('pyssss_terminal_fs', JSON.stringify(fs));
    } catch(e) {}
  }, [fs]);

  useEffect(() => {
    if (!isNanoOpen) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
    } else {
        nanoRef.current?.focus();
    }
  }, [history, isNanoOpen]);

  // --- HELPER: Resolve Path ---
  const getDir = (targetPath: string[]): Record<string, FSEntry> | null => {
      let current = fs;
      // Start from root '~' logic
      if (targetPath[0] === '~') {
          current = fs['~'].children || {};
          for (let i = 1; i < targetPath.length; i++) {
              const seg = targetPath[i];
              if (current[seg] && current[seg].type === 'DIR') {
                  current = current[seg].children || {};
              } else {
                  return null;
              }
          }
          return current;
      }
      return null;
  };

  // --- HELPER: Modify FS ---
  // Returns string error or null if success
  const modifyFs = (action: (currentDir: Record<string, FSEntry>) => string | void) => {
      const newFs = JSON.parse(JSON.stringify(fs));
      let current = newFs['~'].children || {};
      
      for (let i = 1; i < path.length; i++) {
          const seg = path[i];
          if (current[seg] && current[seg].type === 'DIR') {
              current = current[seg].children || {};
          } else {
              return "Error: Path not found.";
          }
      }
      
      const error = action(current);
      if (error) return error;
      
      setFs(newFs);
      return null;
  };

  // --- EXPLORER ACTIONS ---
  const explorerCreate = (targetPath: string[], type: 'FILE' | 'DIR', name: string) => {
      const newFs = JSON.parse(JSON.stringify(fs));
      
      // Navigate to target directory
      let current: FSEntry = newFs['~']; // Start at root object
      
      // Iterate path. 
      // fullPath is e.g. ['~', 'projects']
      // We skip index 0 ('~') because we started with newFs['~']
      for (let i = 1; i < targetPath.length; i++) {
          const seg = targetPath[i];
          if (current.children && current.children[seg]) {
              current = current.children[seg];
          } else {
              console.error("Explorer path error");
              return;
          }
      }

      if (!current.children) current.children = {};
      
      if (current.children[name]) {
          alert("Item already exists!");
          return;
      }

      current.children[name] = {
          type: type,
          content: type === 'FILE' ? '' : undefined,
          children: type === 'DIR' ? {} : undefined
      };

      setFs(newFs);
  };

  const explorerDelete = (targetPath: string[]) => {
      const newFs = JSON.parse(JSON.stringify(fs));
      const nameToDelete = targetPath[targetPath.length - 1];
      const parentPath = targetPath.slice(0, -1);
      
      let current: FSEntry = newFs['~'];
      for (let i = 1; i < parentPath.length; i++) {
          const seg = parentPath[i];
          if (current.children) current = current.children[seg];
      }

      if (current.children) {
          delete current.children[nameToDelete];
          setFs(newFs);
      }
  };

  const explorerOpen = (name: string, content: string) => {
      setNanoFile(name);
      setNanoContent(content);
      setIsNanoOpen(true);
  };


  // --- CLI COMMAND HANDLER ---
  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmdLine = input.trim();
    const parts = cmdLine.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    // Prompt display
    const promptPath = path.join('/');
    setHistory(prev => [...prev, `user@pyssss:${promptPath}$ ${cmdLine}`]);
    setInput('');
    setIsProcessing(true);

    try {
      // --- SECRET CHECK (OBSCURED) ---
      const secretType = checkSecret(cmdLine);

      if (secretType !== SecretType.NONE) {
          if (secretType === SecretType.SKIP_LESSON && onCheat) {
              onCheat(SecretType.SKIP_LESSON);
              setHistory(prev => [...prev, '🔥 DEV MODE: Skipping lesson...']);
              setIsProcessing(false);
              return;
          }

          if ((secretType === SecretType.HELLO_WORLD || secretType === SecretType.SERBIA) && onRedeemSecret) {
              const res = onRedeemSecret(decodeSecretId(secretType));
              setHistory(prev => [...prev, res.message]);
              setIsProcessing(false);
              return;
          }
      }

      // --- LOCAL SHELL COMMANDS ---

      if (cmd === 'clear' || cmd === 'cls') {
        setHistory([]);
        setIsProcessing(false);
        return;
      }
      
      if (cmd === 'exit()') {
        onClose();
        return;
      }

      if (cmd === 'help') {
          setHistory(prev => [...prev, 
              'Available commands:',
              '  ls            List directory contents',
              '  cd <dir>      Change directory',
              '  pwd           Print working directory',
              '  mkdir <dir>   Create directory',
              '  touch <file>  Create empty file',
              '  rm <name>     Remove file or directory',
              '  cat <file>    Show file content',
              '  nano <file>   Text editor',
              '  python <file> Run python script',
              '  pip install   Install packages (simulated)',
              '  echo <text>   Print text',
              '  whoami        Print current user',
              '  clear         Clear screen'
          ]);
          setIsProcessing(false);
          return;
      }

      if (cmd === 'ls') {
          const dir = getDir(path);
          if (dir) {
              const items = Object.keys(dir).map(name => {
                  const isDir = dir[name].type === 'DIR';
                  return isDir ? `<DIR> ${name}` : name;
              });
              setHistory(prev => [...prev, items.length > 0 ? items.join('  ') : '(empty)']);
          } else {
              setHistory(prev => [...prev, 'Error: Current directory invalid.']);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'pwd') {
          setHistory(prev => [...prev, path.join('/')]);
          setIsProcessing(false);
          return;
      }

      if (cmd === 'whoami') {
          setHistory(prev => [...prev, 'user']);
          setIsProcessing(false);
          return;
      }

      if (cmd === 'echo') {
          setHistory(prev => [...prev, args.join(' ')]);
          setIsProcessing(false);
          return;
      }

      if (cmd === 'cd') {
          const target = args[0];
          if (!target || target === '~') {
              setPath(['~']);
          } else if (target === '..') {
              if (path.length > 1) {
                  setPath(prev => prev.slice(0, -1));
              }
          } else {
              const dir = getDir(path);
              if (dir && dir[target] && dir[target].type === 'DIR') {
                  setPath(prev => [...prev, target]);
              } else {
                  setHistory(prev => [...prev, `bash: cd: ${target}: No such file or directory`]);
              }
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'mkdir') {
          const target = args[0];
          if (!target) {
              setHistory(prev => [...prev, 'usage: mkdir <directory_name>']);
          } else {
              const err = modifyFs((current) => {
                  if (current[target]) return `mkdir: cannot create directory '${target}': File exists`;
                  current[target] = { type: 'DIR', children: {} };
              });
              if (err) setHistory(prev => [...prev, err]);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'touch') {
          const target = args[0];
          if (!target) {
              setHistory(prev => [...prev, 'usage: touch <filename>']);
          } else {
               const err = modifyFs((current) => {
                  if (current[target]) return; // Update timestamp simulation (do nothing)
                  current[target] = { type: 'FILE', content: '' };
              });
              if (err) setHistory(prev => [...prev, err]);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'rm') {
          const target = args[0];
          if (!target) {
              setHistory(prev => [...prev, 'usage: rm <filename>']);
          } else {
               const err = modifyFs((current) => {
                  if (!current[target]) return `rm: cannot remove '${target}': No such file or directory`;
                  delete current[target];
              });
              if (err) setHistory(prev => [...prev, err]);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'cat') {
          const target = args[0];
          const dir = getDir(path);
          if (dir && dir[target] && dir[target].type === 'FILE') {
              setHistory(prev => [...prev, dir[target].content || '']);
          } else {
              setHistory(prev => [...prev, `cat: ${target}: No such file`]);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'nano') {
          const target = args[0];
          if (!target) {
              setHistory(prev => [...prev, 'Usage: nano <filename>']);
          } else {
              const dir = getDir(path);
              setNanoFile(target);
              if (dir && dir[target] && dir[target].type === 'FILE') {
                  setNanoContent(dir[target].content || '');
              } else {
                  setNanoContent(''); // New file
              }
              setIsNanoOpen(true);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'python') {
          const target = args[0];
          if (target) {
              // Run file
              const dir = getDir(path);
              if (dir && dir[target] && dir[target].type === 'FILE') {
                  const code = dir[target].content || '';
                  const output = await runPythonRepl(code, installedPackages);
                  setHistory(prev => [...prev, output]);
              } else {
                   setHistory(prev => [...prev, `python: can't open file '${target}': [Errno 2] No such file`]);
              }
          } else {
              // Interactive mode hint (we are already in a pseudo-interactive shell)
              setHistory(prev => [...prev, 'Python 3.12.0 (Simulated). Type code directly to run.']);
          }
          setIsProcessing(false);
          return;
      }

      if (cmd === 'pip' && args[0] === 'install') {
          const pkg = args[1];
          if (pkg) {
            setInstalledPackages(prev => [...prev, pkg]);
          }
          // Fall through to AI to generate "Requirement already satisfied" logs
      }

      // --- FALLBACK: AI REPL ---
      const output = await runPythonRepl(cmdLine, installedPackages);
      setHistory(prev => [...prev, output]);

    } catch (err) {
      setHistory(prev => [...prev, 'Error: Terminal malfunction.']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNanoSave = () => {
      // Save file to current path (CLI logic) or use explicit logic if opened from explorer?
      // For simplicity, nano writes to current directory of the CLI shell
      // UNLESS we modify modifyFs to handle absolute paths, but here assume local dir.
      const err = modifyFs((current) => {
           current[nanoFile] = {
              type: 'FILE',
              content: nanoContent
          };
      });

      if (!err) {
          setNanoMessage(`[ Wrote ${nanoContent.length} lines ]`);
          setTimeout(() => setNanoMessage(''), 2000);
      }
  };

  const handleNanoExit = () => {
      setIsNanoOpen(false);
      setHistory(prev => [...prev, `nano ${nanoFile}`]); // Log that we closed it
      setInput(''); // Refocus input
  };

  // Keyboard shortcuts for Nano
  const handleNanoKeyDown = (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'o') {
          e.preventDefault();
          handleNanoSave();
      }
      if (e.ctrlKey && e.key === 'x') {
          e.preventDefault();
          handleNanoExit();
      }
  };

  const fontClass = font === 'serif' ? 'font-serif' : font === 'mono' ? 'font-mono' : font === 'dyslexic' ? 'font-sans' : 'font-mono';

  return (
    <div className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in ${fontClass}`}>
      <div className={`bg-[#0c0c0c] border border-gray-800 shadow-2xl rounded-lg flex flex-col overflow-hidden transition-all duration-300 ${isMaximized ? 'w-full h-full' : 'w-full max-w-5xl h-[650px]'}`}>
        
        {/* Terminal Header */}
        <div className="bg-[#1f1f1f] px-4 py-2 flex items-center justify-between border-b border-gray-800 select-none flex-shrink-0">
            <div className="flex items-center gap-2 text-gray-400">
                <button onClick={() => setShowExplorer(!showExplorer)} className={`p-1 rounded hover:bg-white/10 ${showExplorer ? 'text-white' : ''} transition-colors`}>
                    <Sidebar size={16} />
                </button>
                <TerminalIcon size={16} />
                <span className="text-xs font-bold">{isNanoOpen ? `GNU nano 7.2` : 'user@pyssss:~'}</span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsMaximized(!isMaximized)} className="text-gray-400 hover:text-white transition-colors">
                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            
            {/* FILE EXPLORER SIDEBAR */}
            {showExplorer && !isNanoOpen && (
                <div className="w-64 bg-[#151515] border-r border-gray-800 flex flex-col transition-all duration-300">
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#1a1a1a]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorer</span>
                        <div className="flex gap-1">
                             {/* Actions can be handled per folder hover, but global add to root is nice too */}
                             <span className="text-[10px] text-gray-600">~</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <FileTreeItem 
                            name="~" 
                            entry={fs['~']} 
                            fullPath={['~']} 
                            depth={0} 
                            onOpen={explorerOpen}
                            onDelete={explorerDelete}
                            onCreate={explorerCreate}
                        />
                    </div>
                </div>
            )}

            {/* MAIN CONTENT (Nano or Shell) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c]">
                
                {/* NANO EDITOR VIEW */}
                {isNanoOpen ? (
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] text-gray-200 font-mono relative">
                        {/* Nano Header */}
                        <div className="bg-gray-200 text-black px-2 py-0.5 flex justify-between text-xs sm:text-sm font-bold flex-shrink-0">
                            <span>GNU nano 7.2</span>
                            <span>File: {nanoFile}</span>
                            <span>{nanoContent.length > 0 ? 'Modified' : ''}</span>
                        </div>

                        {/* Editor Body */}
                        <textarea 
                            ref={nanoRef}
                            value={nanoContent}
                            onChange={(e) => setNanoContent(e.target.value)}
                            onKeyDown={handleNanoKeyDown}
                            className="flex-1 bg-[#0c0c0c] text-white p-2 resize-none outline-none border-none font-mono custom-scrollbar"
                            spellCheck={false}
                            autoCapitalize="none"
                        />

                        {/* Status Bar */}
                        <div className="bg-gray-200 text-black px-2 py-0.5 text-xs sm:text-sm h-6 overflow-hidden whitespace-nowrap flex-shrink-0">
                            {nanoMessage}
                        </div>

                        {/* Shortcuts Footer */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 px-2 py-2 text-xs bg-[#1f1f1f] text-white flex-shrink-0">
                            <div className="flex gap-1 cursor-pointer hover:bg-white/10 p-1 rounded" onClick={handleNanoExit}>
                                <span className="font-bold bg-white text-black px-1 rounded">^X</span> Exit
                            </div>
                            <div className="flex gap-1 cursor-pointer hover:bg-white/10 p-1 rounded" onClick={handleNanoSave}>
                                <span className="font-bold bg-white text-black px-1 rounded">^O</span> Write Out
                            </div>
                            <div className="flex gap-1 opacity-50">
                                <span className="font-bold bg-white text-black px-1 rounded">^W</span> Where Is
                            </div>
                            <div className="flex gap-1 opacity-50">
                                <span className="font-bold bg-white text-black px-1 rounded">^K</span> Cut Text
                            </div>
                        </div>
                    </div>
                ) : (
                    /* TERMINAL VIEW */
                    <div 
                        className="flex-1 p-4 overflow-y-auto font-mono text-sm sm:text-base text-gray-300 leading-relaxed custom-scrollbar"
                        onClick={() => inputRef.current?.focus()}
                    >
                        {history.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap break-words mb-1">
                                {line}
                            </div>
                        ))}
                        
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-green-500 font-bold select-none whitespace-nowrap">
                                {`user@pyssss:${path.join('/')}$`}
                            </span>
                            <form onSubmit={handleCommand} className="flex-1">
                                <input 
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-white focus:ring-0 p-0 font-mono"
                                    autoComplete="off"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck="false"
                                    disabled={isProcessing}
                                    autoFocus
                                />
                            </form>
                        </div>
                        {isProcessing && <div className="animate-pulse text-gray-500 mt-1">...</div>}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;