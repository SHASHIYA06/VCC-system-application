'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileText, Cpu, ChevronLeft, ChevronRight, Layers, Zap, Download, Eye } from 'lucide-react';

interface DrawingData {
  id: string;
  drawingNo: string;
  title: string;
  carType: string;
  subsystem: string;
  drawingType: string;
  pageCount: number;
  currentRevision: string;
  notes: string;
  systemCode: string;
  sourceFile: string;
}

interface PinData {
  id: string;
  pinNo: string;
  signalName?: string;
  wireNo?: string;
  connectorCode: string;
  equipmentCode: string;
  endpointLabel?: string;
}

export default function DrawingDetailPage({ params }: { params: { id: string } }) {
  const [drawing, setDrawing] = useState<DrawingData | null>(null);
  const [pins, setPins] = useState<PinData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'info' | 'schematic'>('info');

  useEffect(() => {
    async function fetchDrawing() {
      try {
        const response = await fetch(`/api/drawings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setDrawing(data.drawing);
          setPins(data.pins || []);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Failed to fetch drawing:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDrawing();
  }, [params.id]);

  const getDrawingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      SCHEMATIC: 'bg-blue-500/20 text-blue-400',
      PIN_ASSIGNMENT: 'bg-purple-500/20 text-purple-400',
      DRAWING_LIST: 'bg-slate-500/20 text-slate-400',
      CLASSIFICATION: 'bg-emerald-500/20 text-emerald-400',
      WIRING_NUMBER_DEF: 'bg-cyan-500/20 text-cyan-400',
      SYMBOL_LIBRARY: 'bg-amber-500/20 text-amber-400',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  const getSystemColor = (system: string) => {
    const colors: Record<string, string> = {
      GEN: 'text-slate-400',
      TRL: 'text-blue-400',
      CAB: 'text-violet-400',
      TRAC: 'text-orange-400',
      BRAKE: 'text-red-400',
      APS: 'text-green-400',
      DOOR: 'text-amber-400',
      VAC: 'text-cyan-400',
      TMS: 'text-purple-400',
      COMMS: 'text-emerald-400',
      HV: 'text-red-600',
    };
    return colors[system] || 'text-slate-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!drawing) {
    return (
      <div className="animated-bg min-h-screen p-6 grid-pattern">
        <div className="mb-6">
          <Link href="/drawings" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Drawings
          </Link>
        </div>
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Drawing not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <Link href="/drawings" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Register
        </Link>
      </div>

      <div className="glass-card overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{drawing.drawingNo}</h1>
                <p className="text-slate-400">{drawing.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getDrawingTypeColor(drawing.drawingType)}`}>
                {drawing.drawingType.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getSystemColor(drawing.systemCode)} bg-slate-800/50`}>
                {drawing.systemCode}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-500">Car Type:</span>
              <span className="ml-2 text-white">{drawing.carType}</span>
            </div>
            <div>
              <span className="text-slate-500">Subsystem:</span>
              <span className="ml-2 text-white">{drawing.subsystem}</span>
            </div>
            <div>
              <span className="text-slate-500">Revision:</span>
              <span className="ml-2 text-white">{drawing.currentRevision || 'A'}</span>
            </div>
            <div>
              <span className="text-slate-500">Pages:</span>
              <span className="ml-2 text-white">{drawing.pageCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('info')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'info' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              Info
            </button>
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'schematic' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-1" />
              Schematic
            </button>
          </div>
        </div>

        {drawing.sourceFile && (
          <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Source File:</span>
                <span className="text-cyan-400 font-mono">{drawing.sourceFile}</span>
              </div>
              <a href={`/DOCUMENTS/${drawing.sourceFile}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <Download className="h-4 w-4" />
                View PDF
              </a>
            </div>
          </div>
        )}

        {drawing.pageCount > 1 && (
          <div className="px-6 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 text-slate-400" />
              </button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {drawing.pageCount}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(drawing.pageCount, currentPage + 1))}
                disabled={currentPage === drawing.pageCount}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(drawing.pageCount, 10) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewMode === 'info' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">Assigned Pins & Signals</h2>
            <p className="text-sm text-slate-400 mt-1">List of all physical pins, wires, and signals defined in this drawing</p>
          </div>
          
          {pins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Connector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Pin No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Signal Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Wire No</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {pins.map((pin) => (
                    <tr key={pin.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-slate-500" />
                          <span className="text-white font-medium">{pin.equipmentCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{pin.connectorCode}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-white">{pin.pinNo}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{pin.signalName || pin.endpointLabel || '-'}</td>
                      <td className="px-6 py-4">
                        {pin.wireNo ? (
                          <Link href={`/wires/${pin.wireNo}`} className="text-cyan-400 hover:text-cyan-300 font-mono">
                            {pin.wireNo}
                          </Link>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {pin.wireNo && (
                          <Link href={`/wires/${pin.wireNo}`} className="text-cyan-400 hover:text-cyan-300 text-sm inline-flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Trace
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No pins recorded for this drawing yet</p>
              <p className="text-sm text-slate-500 mt-2">Run seed or import to populate data</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'schematic' && (
        <div className="glass-card p-12 text-center">
          <Layers className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Schematic View</h3>
          <p className="text-slate-400 mb-4">PDF viewer integration coming soon</p>
          {drawing.sourceFile && (
            <a
              href={`/DOCUMENTS/${drawing.sourceFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Open Full PDF
            </a>
          )}
        </div>
      )}

      {drawing.notes && (
        <div className="glass-card p-6 mt-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Notes / Remarks</h3>
          <p className="text-slate-300">{drawing.notes}</p>
        </div>
      )}
    </div>
  );
}