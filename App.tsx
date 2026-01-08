import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Terminal, ArrowUp, Upload, Database, RefreshCw, AlertTriangle, Code, Link as LinkIcon, X, Command, Activity, Play } from 'lucide-react';
import SchemaViewer from './components/SchemaViewer';
import SqlEditor from './components/SqlEditor';
import ResultsTable from './components/ResultsTable';
import { generateSqlFromText } from './services/geminiService';
import { createDemoDatabase, createDatabaseFromBuffer, getDatabaseSchema, executeQuery } from './services/dbService';
import { QueryResult, TableSchema } from './types';

const App: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [sql, setSql] = useState<string>('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // DB State
  const [db, setDb] = useState<any>(null);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [schemaString, setSchemaString] = useState<string>('');
  const [dbType, setDbType] = useState<'demo' | 'custom' | 'none'>('none');
  const [isDbLoading, setIsDbLoading] = useState(false);
  
  // URL Input State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlToLoad, setUrlToLoad] = useState('');
  
  // Mode State
  const [isGenericMode, setIsGenericMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // No longer needed for auto-scroll since input is at top
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadDemoData = async () => {
    setIsDbLoading(true);
    resetState();
    try {
      const database = await createDemoDatabase();
      setDb(database);
      const { schema, schemaString } = getDatabaseSchema(database);
      setSchema(schema);
      setSchemaString(schemaString);
      setDbType('demo');
    } catch (e: any) {
      setError("Failed to load demo database: " + e.message);
    } finally {
      setIsDbLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDbLoading(true);
    resetState();

    try {
      const buffer = await file.arrayBuffer();
      await loadDatabaseFromBuffer(buffer);
    } catch (e: any) {
      setError("Failed to load custom database. " + e.message);
    } finally {
      setIsDbLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlToLoad.trim()) return;

    setIsDbLoading(true);
    resetState();
    
    try {
      const response = await fetch(urlToLoad);
      if (!response.ok) {
        throw new Error(`Failed to fetch file (Status: ${response.status}). Check if the URL allows CORS.`);
      }
      const buffer = await response.arrayBuffer();
      await loadDatabaseFromBuffer(buffer);
      setShowUrlInput(false);
      setUrlToLoad('');
    } catch (e: any) {
      setError("Failed to load database from URL. " + e.message);
    } finally {
      setIsDbLoading(false);
    }
  };

  const loadDatabaseFromBuffer = async (buffer: ArrayBuffer) => {
    const database = await createDatabaseFromBuffer(buffer);
    setDb(database);
    const { schema, schemaString } = getDatabaseSchema(database);
    
    if (schema.length === 0) {
      throw new Error("No tables found in the SQLite file.");
    }

    setSchema(schema);
    setSchemaString(schemaString);
    setDbType('custom');
  };

  const resetState = () => {
    setError(null);
    setSql('');
    setResult(null);
  };

  const enableGenericMode = () => {
    setDb(null);
    setSchema([]);
    setSchemaString('');
    setDbType('none');
    setIsGenericMode(true);
    resetState();
  };

  const resetApp = () => {
    setDb(null);
    setSchema([]);
    setSchemaString('');
    setDbType('none');
    setIsGenericMode(false);
    resetState();
    setQuestion('');
    setShowUrlInput(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    if (!db && !isGenericMode) {
      setIsGenericMode(true);
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setSql('');

    try {
      const generatedSql = await generateSqlFromText(question, schemaString);
      setSql(generatedSql);
    } catch (err: any) {
      setError("Failed to generate SQL. Please check your API key.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunQuery = async () => {
    if (!sql || !db) return;

    setIsExecuting(true);
    try {
      const queryResult = executeQuery(db, sql);
      setResult(queryResult);
    } catch (err) {
      setResult({ columns: [], rows: [], error: "Unexpected execution error." });
    } finally {
      setIsExecuting(false);
    }
  };

  const hasSelectedMode = db !== null || isGenericMode;

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-200">
      
      {/* Sidebar - Data Dock */}
      {!isGenericMode && (
        <div className="w-80 hidden md:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Terminal className="w-4 h-4 text-white" />
             </div>
             <span className="font-semibold tracking-tight text-white">SQL Explorer</span>
          </div>
          <SchemaViewer schema={schema} />
          
          {/* Active DB Indicator */}
          {hasSelectedMode && (
             <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-xs font-mono uppercase text-slate-500">Active Source</span>
                   <button onClick={resetApp} className="text-[10px] text-red-400 hover:text-red-300 transition-colors">Disconnect</button>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   {dbType === 'demo' ? 'Demo E-Commerce' : dbType === 'custom' ? 'Custom Database' : 'No Database'}
                </div>
             </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full bg-[#050505]">
        
        {/* Top Navigation (Mobile/Tablet or simplified) */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 md:hidden bg-[#0A0A0A]">
            <div className="flex items-center gap-2">
               <Terminal className="w-5 h-5 text-indigo-400" />
               <span className="font-semibold">SQL Explorer</span>
            </div>
            {hasSelectedMode && (
               <button onClick={resetApp} className="text-xs text-slate-400">Reset</button>
            )}
        </header>

        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-10">
           <div className="max-w-5xl mx-auto">
              
              {/* Setup / Welcome Screen */}
              {!hasSelectedMode ? (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="text-center mb-12">
                       <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-4 tracking-tight">
                         Explore data with natural language
                       </h1>
                       <p className="text-lg text-slate-500 max-w-xl mx-auto">
                         Connect a database, ask questions in plain English, and get instant SQL + results.
                       </p>
                    </div>

                    {showUrlInput ? (
                       <div className="w-full max-w-md glass-panel p-6 rounded-2xl animate-slide-up">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-medium text-white flex items-center gap-2">
                               <LinkIcon className="w-4 h-4 text-indigo-400" />
                               Load from URL
                             </h3>
                             <button onClick={() => setShowUrlInput(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>
                          </div>
                          <form onSubmit={handleUrlSubmit} className="flex gap-2">
                             <input 
                               type="url" 
                               value={urlToLoad} 
                               onChange={e => setUrlToLoad(e.target.value)}
                               className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                               placeholder="https://.../db.sqlite"
                               autoFocus
                             />
                             <button disabled={isDbLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg text-sm font-medium transition-colors">
                                {isDbLoading ? '...' : 'Load'}
                             </button>
                          </form>
                       </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                         {/* Card 1 */}
                         <button onClick={loadDemoData} disabled={isDbLoading} className="group glass-panel p-6 rounded-2xl text-left hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                               <Database className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-white font-medium mb-1">Demo Dataset</h3>
                            <p className="text-sm text-slate-500">Sample e-commerce database with customers & orders.</p>
                         </button>

                         {/* Card 2 */}
                         <button onClick={triggerFileUpload} disabled={isDbLoading} className="group glass-panel p-6 rounded-2xl text-left hover:border-blue-500/50 transition-all hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                               <Upload className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-white font-medium mb-1">Upload File</h3>
                            <p className="text-sm text-slate-500">Load your own SQLite (.db, .sqlite) file securely.</p>
                         </button>
                         
                         {/* Card 3 */}
                         <button onClick={() => setShowUrlInput(true)} disabled={isDbLoading} className="group glass-panel p-6 rounded-2xl text-left hover:border-purple-500/50 transition-all hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                               <LinkIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-white font-medium mb-1">Load URL</h3>
                            <p className="text-sm text-slate-500">Fetch a database file from a remote public URL.</p>
                         </button>
                      </div>
                    )}
                    
                    <button onClick={enableGenericMode} className="mt-8 text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-2">
                       <Code className="w-4 h-4" />
                       Or just generate SQL without data
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".sqlite,.db,.sqlite3" onChange={handleFileUpload} />
                 </div>
              ) : (
                 /* Main Interface (Input + Results) */
                 <div className="space-y-8 animate-fade-in">
                    
                    {/* INPUT AREA (Moved to top) */}
                    <div className="glass-panel p-2 rounded-2xl shadow-xl border border-white/10">
                        <form onSubmit={handleGenerate}>
                            <div className="relative">
                                <div className="absolute top-3 left-4 text-slate-500">
                                   {isGenerating ? <Sparkles className="w-5 h-5 animate-spin text-indigo-400" /> : <Command className="w-5 h-5" />}
                                </div>
                                <textarea 
                                   value={question}
                                   onChange={(e) => setQuestion(e.target.value)}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                         e.preventDefault();
                                         handleGenerate(e);
                                      }
                                   }}
                                   placeholder="Ask a question about your data (e.g., 'Show top 5 customers by sales')"
                                   className="w-full bg-black/20 text-white placeholder:text-slate-500 pl-12 pr-16 py-3 rounded-xl border-none focus:ring-1 focus:ring-indigo-500/50 resize-none min-h-[60px]"
                                   rows={2}
                                />
                                <div className="absolute bottom-2.5 right-2.5">
                                    <button 
                                       type="submit" 
                                       disabled={!question.trim() || isGenerating}
                                       className={`
                                          p-2 rounded-lg transition-all
                                          ${question.trim() && !isGenerating 
                                             ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                                             : 'bg-white/5 text-slate-500 cursor-not-allowed'}
                                       `}
                                    >
                                       <ArrowUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {error && (
                      <div className="glass-panel border-red-900/50 bg-red-950/10 p-4 rounded-xl flex items-start gap-3 animate-slide-up">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                           <h4 className="text-red-400 font-medium text-sm">Error</h4>
                           <p className="text-red-300/80 text-sm">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* SQL Editor Card */}
                    {sql && (
                       <div className="animate-slide-up">
                          <div className="flex items-center justify-between mb-2 px-1">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Generated Query</span>
                             </div>
                          </div>
                          <SqlEditor 
                             sql={sql} 
                             onChange={setSql} 
                             onRun={handleRunQuery} 
                             isRunning={isExecuting} 
                             isReadOnly={!db} 
                          />
                       </div>
                    )}

                    {/* Results Table Card */}
                    {result && (
                       <div className="animate-slide-up">
                           <div className="flex items-center gap-2 mb-2 px-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                             <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Result Data</span>
                          </div>
                          <ResultsTable result={result} />
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;