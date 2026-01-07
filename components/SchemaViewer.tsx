import React from 'react';
import { TableSchema } from '../types';
import { Database, Table } from 'lucide-react';

interface SchemaViewerProps {
  schema: TableSchema[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  return (
    <div className="bg-slate-900 border-r border-slate-800 w-full md:w-80 flex-shrink-0 h-full overflow-y-auto p-4 hidden md:block">
      <div className="flex items-center gap-2 mb-6 text-emerald-400">
        <Database className="w-5 h-5" />
        <h2 className="font-bold text-lg tracking-wide">Data Schema</h2>
      </div>

      <div className="space-y-6">
        {schema.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-10">
            No database loaded.
          </div>
        ) : (
          schema.map((table) => (
            <div key={table.tableName} className="bg-slate-850 rounded-lg p-3 border border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-slate-200 border-b border-slate-700 pb-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">{table.tableName}</h3>
              </div>
              <ul className="space-y-2">
                {table.columns.map((col) => (
                  <li key={col.name} className="flex flex-col text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-mono font-medium">{col.name}</span>
                      <span className="text-slate-500 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{col.type}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SchemaViewer;