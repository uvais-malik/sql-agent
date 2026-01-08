import React from 'react';
import { TableSchema } from '../types';
import { Database, Table, Hash, Type } from 'lucide-react';

interface SchemaViewerProps {
  schema: TableSchema[];
}

const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="space-y-4">
        {schema.length === 0 ? (
          <div className="text-slate-600 text-sm text-center py-10 px-4 border border-dashed border-slate-800 rounded-lg">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>No schema loaded</p>
          </div>
        ) : (
          schema.map((table) => (
            <div key={table.tableName} className="rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border-b border-white/5">
                <Table className="w-3.5 h-3.5 text-indigo-400" />
                <h3 className="font-medium text-sm text-slate-200">{table.tableName}</h3>
              </div>
              <ul className="py-1">
                {table.columns.map((col) => (
                  <li key={col.name} className="px-3 py-1.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                    <span className="text-xs text-slate-400 font-mono group-hover:text-slate-300">{col.name}</span>
                    <span className="text-[10px] text-slate-600 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 font-mono group-hover:border-white/10">
                      {col.type}
                    </span>
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