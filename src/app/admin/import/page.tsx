'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Database, Settings, ChevronRight, Check, AlertCircle, Loader2, RefreshCw, Trash2, FileSpreadsheet } from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  count?: number;
  errors?: string[];
}

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults([]);
    }
  };

  const importCSV = async () => {
    if (!file) return;
    setImporting(true);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults([data]);
    } catch (error) {
      setResults([{ success: false, message: 'Import failed', errors: [(error as Error).message] }]);
    } finally {
      setImporting(false);
    }
  };

  const processPDFs = async () => {
    setProcessing(true);
    setProcessingStatus('Initializing PDF processor...');
    setResults([]);

    try {
      const response = await fetch('/api/import/pdf', { method: 'POST' });
      const data = await response.json();
      setResults(prev => [...prev, data]);
    } catch (error) {
      setResults(prev => [...prev, { success: false, message: 'PDF processing failed', errors: [(error as Error).message] }]);
    } finally {
      setProcessing(false);
      setProcessingStatus('');
    }
  };

  const seedDatabase = async () => {
    setProcessing(true);
    setProcessingStatus('Seeding database with comprehensive VCC data...');
    setResults([]);

    try {
      const response = await fetch('/api/import/seed', { method: 'POST' });
      const data = await response.json();
      setResults([data]);
    } catch (error) {
      setResults(prev => [...prev, { success: false, message: 'Seeding failed', errors: [(error as Error).message] }]);
    } finally {
      setProcessing(false);
      setProcessingStatus('');
    }
  };

  const clearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
    
    setProcessing(true);
    setProcessingStatus('Clearing database...');

    try {
      const response = await fetch('/api/import/clear', { method: 'POST' });
      const data = await response.json();
      setResults([data]);
    } catch (error) {
      setResults(prev => [...prev, { success: false, message: 'Clear failed', errors: [(error as Error).message] }]);
    } finally {
      setProcessing(false);
      setProcessingStatus('');
    }
  };

  const importWireConnections = async () => {
    setProcessing(true);
    setProcessingStatus('Importing wire connections from documents...');
    setResults([]);

    try {
      const response = await fetch('/api/import/wires', { method: 'POST' });
      const data = await response.json();
      setResults([data]);
    } catch (error) {
      setResults(prev => [...prev, { success: false, message: 'Wire import failed', errors: [(error as Error).message] }]);
    } finally {
      setProcessing(false);
      setProcessingStatus('');
    }
  };

  const getDatabaseStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">VCC Data Import</h1>
        <p className="mt-2 text-slate-400">
          Import drawings, equipment, wires, and trainline data from CSV files or process PDF documents
        </p>
      </div>

      {/* Import Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CSV Import */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">CSV Import</h2>
              <p className="text-sm text-slate-400">Upload CSV files with structured data</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 mb-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-green-400" />
                <span className="text-green-400">{file.name}</span>
                <button onClick={() => { setFile(null); fileInputRef.current?.value && (fileInputRef.current.value = ''); }} className="text-slate-400 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Upload className="h-8 w-8" />
                <span>Click to select CSV file</span>
              </button>
            )}
          </div>

          <button
            onClick={importCSV}
            disabled={!file || importing}
            className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'Importing...' : 'Import CSV'}
          </button>

          <div className="mt-4 text-xs text-slate-500">
            <p className="font-medium mb-1">Expected CSV format:</p>
            <p>wire_no, signal_name, from_device, from_connector, from_pin, to_device, to_connector, to_pin</p>
          </div>
        </div>

        {/* PDF Processing */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">PDF Processing</h2>
              <p className="text-sm text-slate-400">Process VCC drawing PDFs in DOCUMENTS folder</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">KMRCL VCC Drawings_OCR.pdf</p>
                  <p className="text-xs text-slate-500">Main drawing reference</p>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">127 pages</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">CAB_PIN DRAWINGS</p>
                  <p className="text-xs text-slate-500">Cab connector PIN assignments</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">48 pages</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">DMC UF_PIN Drawings</p>
                  <p className="text-xs text-slate-500">DMC underframe PINs</p>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">26 pages</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">MC_CEILING_PIN Drawings</p>
                  <p className="text-xs text-slate-500">MC ceiling PINs</p>
                </div>
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">58 pages</span>
              </div>
            </div>
          </div>

          <button
            onClick={processPDFs}
            disabled={processing}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {processing ? 'Processing...' : 'Process All PDFs'}
          </button>
        </div>
      </div>

      {/* Database Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Database className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Seed Database</h2>
              <p className="text-sm text-slate-400">Populate with all VCC data</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Run comprehensive seed with systems, equipment, trainlines, connectors, pins, and trace data
          </p>
          <button
            onClick={seedDatabase}
            disabled={processing}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {processing ? 'Seeding...' : 'Run Full Seed'}
          </button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Settings className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Wire Connections</h2>
              <p className="text-sm text-slate-400">Import trace data</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Import wire-to-device connections and trace paths with color coding from drawings
          </p>
          <button
            onClick={importWireConnections}
            disabled={processing}
            className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
            {processing ? 'Importing...' : 'Import Traces'}
          </button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Clear Data</h2>
              <p className="text-sm text-slate-400">Reset database</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Remove all imported data. System and seed data will be preserved
          </p>
          <button
            onClick={clearDatabase}
            disabled={processing}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {processing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="glass-card p-4 mb-6 border border-cyan-500/30">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
            <span className="text-cyan-400">{processingStatus}</span>
          </div>
        </div>
      )}

      {/* Import Results */}
      {results.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Import Results</h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </span>
                  {result.count !== undefined && (
                    <span className="text-slate-400 text-sm">({result.count} records)</span>
                  )}
                </div>
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-300 list-disc list-inside">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}