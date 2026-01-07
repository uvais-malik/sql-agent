import React, { useState } from 'react';
import { Code2, Play, Loader2, Copy, Check } from 'lucide-react';

interface SqlEditorProps {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  isRunning: boolean;
  isReadOnly?: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ sql, onChange, onRun, isRunning, isReadOnly = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sql) return;
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-lg">
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Code2 className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">Generated SQL</span>
        </div>
        
        {isReadOnly ? (
          <button
            onClick={handleCopy}
            disabled={!sql}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all border
              ${!sql 
                ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
              }
            `}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy SQL
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isRunning || !sql}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all
              ${isRunning || !sql 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/20'
              }
            `}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Query
              </>
            )}
          </button>
        )}
      </div>
      <div className="relative group">
        <textarea
          value={sql}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-40 bg-[#0f172a] text-emerald-300 font-mono text-sm p-4 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none leading-relaxed"
          spellCheck={false}
          placeholder="-- generated SQL will appear here..."
        />
        <div className="absolute bottom-2 right-4 text-xs text-slate-600 pointer-events-none opacity-50">
          {isReadOnly ? 'Read Only Mode' : 'Editable'}
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;