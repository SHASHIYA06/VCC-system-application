'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, FileSearch, ArrowRight, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

const PdfViewerEnhanced = dynamic(() => import('@/components/pdf/PdfViewerEnhanced'), {
  ssr: false,
});

export default function DrawingVerificationWorkflow() {
  const [drawings, setDrawings] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/drawings?limit=600')
      .then(res => res.json())
      .then(data => {
        setDrawings(data.drawings || []);
        setLoading(false);
      });
  }, []);

  const currentDrawing = drawings[currentIndex];

  const handleVerify = async () => {
    setSaving(true);
    // In a real implementation, this would call an API to mark the drawing as VERIFIED
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    if (currentIndex < drawings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[800px] items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <span className="ml-4 text-xl font-mono text-cyan-400">Loading Drawing Verification...</span>
      </div>
    );
  }

  if (!currentDrawing) {
    return <div className="p-8 text-white">No drawings found.</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[850px]">
      {/* Left Column: The PDF Viewer */}
      <div className="glass-card-premium rounded-xl flex flex-col overflow-hidden border border-white/10">
        <div className="bg-slate-800/80 p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-cyan-400" />
            Drawing: {currentDrawing.drawingNo}
          </h2>
          <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-mono text-cyan-300">
            {currentIndex + 1} / {drawings.length}
          </span>
        </div>
        <div className="flex-1 bg-slate-900 overflow-hidden">
          {currentDrawing.pdfUrl ? (
            <PdfViewerEnhanced 
              src={currentDrawing.pdfUrl} 
              initialPage={currentDrawing.pdfPageNo || 1} 
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              No PDF mapped to this drawing yet.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Database Mapping & Verification */}
      <div className="glass-card-premium rounded-xl flex flex-col border border-white/10">
        <div className="bg-slate-800/80 p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Topology Verification</h2>
          <p className="text-sm text-slate-400 mt-1">Review the extracted OCR details and add missing connections.</p>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
              <label className="text-xs font-semibold text-slate-400 uppercase">System</label>
              <div className="text-lg text-white font-mono mt-1">{currentDrawing.system?.systemName || 'N/A'}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
              <label className="text-xs font-semibold text-slate-400 uppercase">Subsystem</label>
              <div className="text-lg text-white font-mono mt-1">{currentDrawing.subsystem?.subsystemName || 'N/A'}</div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg border border-white/5 overflow-hidden">
            <div className="px-4 py-3 bg-slate-800 border-b border-white/5">
              <h3 className="font-semibold text-cyan-400">Extracted Connectors</h3>
            </div>
            <div className="p-4">
              {/* Mock mapping list, in production this fetches actual endpoints for this drawing */}
              <div className="text-sm text-slate-300 mb-2">Ensure all connectors shown on the PDF are listed below:</div>
              <ul className="space-y-2">
                <li className="flex justify-between items-center p-2 hover:bg-slate-800 rounded">
                  <span className="font-mono text-cyan-300">CONN-1A</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </li>
                <li className="flex justify-between items-center p-2 hover:bg-slate-800 rounded">
                  <span className="font-mono text-cyan-300">TERM-B2</span>
                  <XCircle className="w-4 h-4 text-red-500" />
                </li>
              </ul>
              <button className="mt-4 w-full py-2 border border-dashed border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition text-sm">
                + Add Missing Connector
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-800/80 p-4 border-t border-white/10 flex justify-between">
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <button 
            onClick={handleVerify}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 shadow-glow-sm transition flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Mark 100% Accurate
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
