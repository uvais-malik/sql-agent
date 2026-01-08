import React, { useState } from 'react';
import { Play, Loader2, Copy, Check, Terminal } from 'lucide-react';

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
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 group">
      {/* Terminal Header */}
      <div className="bg-black/40 px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
           {/* Fake Window Controls */}
           <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
             <Terminal className="w-3.5 h-3.5" />
             <span className="text-xs font-mono">sql_query.sql</span>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          
          {!isReadOnly && (
            <button
              onClick={onRun}
              disabled={isRunning || !sql}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all
                ${isRunning 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
              `}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code Area */}
      <div className="relative">
        <textarea
          value={sql}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-48 bg-[#0c0c0c] text-indigo-100 font-mono text-sm p-5 focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
          spellCheck={false}
          placeholder="SELECT * FROM..."
        />
        {isReadOnly && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-end justify-end p-4">
             <span className="text-[10px] text-slate-600 font-mono border border-slate-800 px-2 py-0.5 rounded bg-black/50">READ ONLY</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlEditor;