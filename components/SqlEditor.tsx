import React from 'react';
import { Code2, Play, Loader2 } from 'lucide-react';

interface SqlEditorProps {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ sql, onChange, onRun, isRunning }) => {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-lg">
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Code2 className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">Generated SQL</span>
        </div>
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
          Editable
        </div>
      </div>
    </div>
  );
};

export default SqlEditor;