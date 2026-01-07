import React from 'react';
import { QueryResult } from '../types';
import { AlertCircle, Clock } from 'lucide-react';

interface ResultsTableProps {
  result: QueryResult | null;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex items-start gap-3 mt-4">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-red-400 font-medium text-sm">Execution Error</h4>
          <p className="text-red-300/80 text-sm mt-1">{result.error}</p>
        </div>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center mt-4">
        <p className="text-slate-400">Query returned no results.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-end items-center gap-2 text-xs text-slate-500">
        <Clock className="w-3 h-3" />
        <span>{result.rows.length} rows in {result.executionTime?.toFixed(2)}ms</span>
      </div>
      
      <div className="overflow-x-auto rounded-lg border border-slate-800 shadow-md">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              {result.columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-medium border-b border-slate-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-950 divide-y divide-slate-800/50">
            {result.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-900/50 transition-colors">
                {result.columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 text-slate-400 font-mono">
                    {row[col] !== undefined && row[col] !== null ? row[col].toString() : <span className="text-slate-700">NULL</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;