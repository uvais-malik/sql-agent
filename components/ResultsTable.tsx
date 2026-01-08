import React from 'react';
import { QueryResult } from '../types';
import { Activity, Clock } from 'lucide-react';

interface ResultsTableProps {
  result: QueryResult | null;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    // Error is handled in App.tsx generally, but just in case
    return null; 
  }

  if (result.rows.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-slate-400 font-medium">Query executed successfully but returned no results.</p>
        <div className="text-xs text-slate-600 font-mono">0 rows affected • {result.executionTime?.toFixed(2)}ms</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="glass-panel rounded-xl overflow-hidden border border-white/10 shadow-xl">
        <div className="overflow-x-auto max-h-[500px] scrollbar-hide">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#111] text-slate-400 sticky top-0 z-10 shadow-sm">
              <tr>
                {result.columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4 font-medium text-xs uppercase tracking-wider border-b border-white/5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#0A0A0A]">
              {result.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors group">
                  {result.columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-3.5 text-slate-300 font-mono text-xs whitespace-nowrap group-hover:text-white">
                      {row[col] !== undefined && row[col] !== null ? (
                         row[col].toString()
                      ) : (
                         <span className="text-slate-700 italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-black/30 border-t border-white/5 px-4 py-2 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">SQLite 3.x</span>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                <span>{result.rows.length} rows</span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.executionTime?.toFixed(2)}ms
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;