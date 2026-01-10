import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, placeholder, readOnly = false }) => {
  return (
    <div className="w-full font-mono text-sm relative group">
      <div className="bg-gray-800 text-gray-400 px-4 py-2 rounded-t-lg flex items-center gap-2 z-20 relative border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-xs font-semibold opacity-75">main.py</span>
      </div>
      
      <div className="relative h-48 bg-[#1e1e1e] rounded-b-lg overflow-hidden shadow-inner">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "# Write your python code here..."}
          readOnly={readOnly}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="absolute inset-0 w-full h-full p-4 bg-[#1e1e1e] text-gray-100 caret-white resize-none border-none outline-none focus:ring-0 whitespace-pre code-scroll leading-relaxed font-mono text-base"
        />
      </div>
    </div>
  );
};

export default CodeEditor;