'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Cpu, ChevronLeft, ChevronRight, Layers, Zap, Download, Eye, Search, Filter } from 'lucide-react';

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
  wireColor?: string;
  connectorCode: string;
  equipmentCode: string;
  endpointLabel?: string;
}

export default function DrawingDetailPage() {
  const params = useParams();
  const drawingId = params.id as string;
  
  const [drawing, setDrawing] = useState<DrawingData | null>(null);
  const [pins, setPins] = useState<PinData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'info' | 'schematic'>('info');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function fetchDrawing() {
      if (!drawingId) return;
      try {
        const response = await fetch(`/api/drawings/${drawingId}`);
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
  }, [drawingId]);

  const filteredPins = pins.filter(pin => 
    pin.signalName?.toLowerCase().includes(filter.toLowerCase()) ||
    pin.wireNo?.toLowerCase().includes(filter.toLowerCase()) ||
    pin.connectorCode.toLowerCase().includes(filter.toLowerCase()) ||
    pin.equipmentCode.toLowerCase().includes(filter.toLowerCase())
  );

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
      LIGHT: 'text-yellow-400',
    };
    return colors[system] || 'text-slate-400';
  };

  const getWireColorBadge = (wireNo?: string) => {
    if (!wireNo) return null;
    const colorMap: Record<string, { bg: string; text: string }> = {
      '0': { bg: 'bg-red-500/20', text: 'text-red-400' },
      '1': { bg: 'bg-green-500/20', text: 'text-green-400' },
      '2': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      '3': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      '4': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      '5': { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
      '6': { bg: 'bg-pink-500/20', text: 'text-pink-400' },
      '7': { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      '8': { bg: 'bg-teal-500/20', text: 'text-teal-400' },
      '9': { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
    };
    const firstDigit = wireNo[0] || '0';
    const color = colorMap[firstDigit] || colorMap['0'];
    return (
      <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${color.bg} ${color.text}`}>
        {wireNo}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
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
              <span className="ml-2 text-white font-medium">{drawing.carType}</span>
            </div>
            <div>
              <span className="text-slate-500">Subsystem:</span>
              <span className="ml-2 text-white">{drawing.subsystem}</span>
            </div>
            <div>
              <span className="text-slate-500">Revision:</span>
              <span className="ml-2 text-white font-mono">{drawing.currentRevision || 'A'}</span>
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
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Assigned Pins & Signals</h2>
              <p className="text-sm text-slate-400 mt-1">{pins.length} pins total</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter pins..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64"
              />
            </div>
          </div>
          
          {filteredPins.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Connector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Pin No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Signal Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Wire No</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredPins.map((pin) => (
                    <tr key={pin.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-slate-500" />
                          <span className="text-white font-medium">{pin.equipmentCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-cyan-400">{pin.connectorCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-white">{pin.pinNo}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{pin.signalName || pin.endpointLabel || '-'}</td>
                      <td className="px-6 py-4">
                        {pin.wireNo ? (
                          <Link href={`/wires/${pin.wireNo}`} className="hover:text-cyan-300">
                            {getWireColorBadge(pin.wireNo)}
                          </Link>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pin.wireNo && (
                            <Link href={`/wires/${pin.wireNo}`} className="text-cyan-400 hover:text-cyan-300 text-sm inline-flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20">
                              <Zap className="h-3 w-3" />
                              Trace
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {filter ? `No pins match "${filter}"` : 'No pins recorded for this drawing yet'}
              </p>
              {!filter && (
                <p className="text-sm text-slate-500 mt-2">Run seed or import to populate data</p>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'schematic' && (
        <div className="glass-card p-12 text-center">
          <Layers className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Schematic View</h3>
          <p className="text-slate-400 mb-4">PDF viewer integration available</p>
          {drawing.sourceFile && (
            <div className="flex items-center justify-center gap-4">
              <a
                href={`/DOCUMENTS/${drawing.sourceFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Open Full PDF
              </a>
              <Link
                href={`/admin/import?file=${encodeURIComponent(drawing.sourceFile)}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                Import Data
              </Link>
            </div>
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