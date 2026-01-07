import React, { useState, useRef } from 'react';
import { Sparkles, Terminal, MessageSquare, ArrowRight, Upload, Database, RefreshCw, AlertTriangle, Code, Home, Link as LinkIcon, X } from 'lucide-react';
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
  
  // Mode State (true if user explicitly chose "Use without dataset")
  const [isGenericMode, setIsGenericMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsGenericMode(false);
    setQuestion('');
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
    setShowUrlInput(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    if (!db && !isGenericMode) {
      setError("Please load a database or select 'Use without dataset'.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setSql('');

    try {
      const generatedSql = await generateSqlFromText(question, schemaString);
      setSql(generatedSql);
    } catch (err: any) {
      setError("Failed to generate SQL. Please check your API key or try again.");
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
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <SchemaViewer schema={schema} />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="px-8 py-5 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">Text-to-SQL Explorer</h1>
                <p className="text-xs text-slate-500">Powered by Gemini 3 Pro</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {hasSelectedMode && (
                 <button
                   onClick={resetApp}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                   title="Go back to start"
                 >
                   <Home className="w-4 h-4" />
                   <span className="hidden sm:inline">Start Over</span>
                 </button>
              )}
              
              {db && (
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button
                    onClick={loadDemoData}
                    disabled={isDbLoading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dbType === 'demo' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading && dbType === 'demo' ? 'animate-spin' : ''}`} />
                    Demo
                  </button>
                  <button
                    onClick={triggerFileUpload}
                    disabled={isDbLoading}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${dbType === 'custom' ? 'bg-indigo-600/20 text-indigo-300 shadow-sm border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
              )}

               <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${db ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-slate-800 border-slate-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${db ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                <span className={`text-xs font-medium ${db ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {db ? (dbType === 'demo' ? 'Demo Data' : 'Custom DB') : (isGenericMode ? 'No Dataset' : 'Waiting...')}
                </span>
              </div>
            </div>
        </header>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Question Input */}
            <section className={!hasSelectedMode ? "opacity-50 pointer-events-none transition-all" : "transition-all"}>
              <form onSubmit={handleGenerate} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <MessageSquare className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={db ? "Ask a question about your data..." : "Generate SQL without a dataset..."}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-12 pr-14 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating || !hasSelectedMode}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !question.trim() || !hasSelectedMode}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/20"
                >
                  {isGenerating ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>
              </form>
            </section>

             {/* Landing / Mode Selection */}
             {!hasSelectedMode && (
               <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm z-10">
                 <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Welcome to Text-to-SQL Explorer</h2>
                      <p className="text-slate-400">Choose how you want to start generating SQL queries with Gemini.</p>
                    </div>

                    {/* URL Input Form */}
                    {showUrlInput ? (
                       <form onSubmit={handleUrlSubmit} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 mb-6 animate-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                               <LinkIcon className="w-4 h-4 text-sky-400" />
                               Load from URL
                             </h3>
                             <button type="button" onClick={() => setShowUrlInput(false)} className="text-slate-400 hover:text-white">
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="url" 
                              value={urlToLoad}
                              onChange={(e) => setUrlToLoad(e.target.value)}
                              placeholder="https://raw.githubusercontent.com/.../mydb.sqlite" 
                              className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                              autoFocus
                            />
                            <button 
                              type="submit" 
                              disabled={isDbLoading || !urlToLoad}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {isDbLoading ? 'Loading...' : 'Load'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                             Note: The URL must allow Cross-Origin (CORS) requests (e.g., GitHub Raw, Gists).
                          </p>
                       </form>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Demo */}
                        <button 
                          onClick={loadDemoData}
                          disabled={isDbLoading}
                          className="flex flex-col items-center gap-4 p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all group text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <RefreshCw className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-200">Demo Data</h3>
                          </div>
                        </button>

                        {/* Upload */}
                        <button 
                          onClick={triggerFileUpload}
                          disabled={isDbLoading}
                          className="flex flex-col items-center gap-4 p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all group text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-200">Upload File</h3>
                          </div>
                        </button>

                         {/* URL */}
                         <button 
                          onClick={() => setShowUrlInput(true)}
                          disabled={isDbLoading}
                          className="flex flex-col items-center gap-4 p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all group text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LinkIcon className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-200">From URL</h3>
                          </div>
                        </button>

                        {/* No Dataset */}
                        <button 
                          onClick={enableGenericMode}
                          className="flex flex-col items-center gap-4 p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition-all group text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Code className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-200">No Dataset</h3>
                          </div>
                        </button>
                      </div>
                    )}

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".sqlite,.db,.sqlite3" 
                      onChange={handleFileUpload}
                    />
                 </div>
               </div>
             )}

            {/* Helper Text for Generic Mode */}
             {isGenericMode && !sql && (
                <div className="mt-8 text-center text-slate-500 text-sm">
                   <p>You are in <strong>Generic Mode</strong>. Gemini will generate SQL based on standard conventions.</p>
                   <p className="mt-1">Since no database is connected, queries cannot be executed.</p>
                </div>
             )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/50 text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Results */}
            {(sql || result) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
                <SqlEditor
                  sql={sql}
                  onChange={setSql}
                  onRun={handleRunQuery}
                  isRunning={isExecuting}
                />
                
                {db ? (
                    <ResultsTable result={result} />
                ) : (
                    <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-lg p-6 text-center text-slate-500 text-sm">
                        Connect a database to execute this query.
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