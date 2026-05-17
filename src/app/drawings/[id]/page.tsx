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
  totalConnectors?: number;
  totalPins?: number;
  totalTrainLines?: number;
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

interface TrainLineData {
  id: string;
  lineGroup: string;
  itemName: string;
  wireNo?: string;
  connectorCode?: string;
  pinNo?: string;
}

interface ConnectorData {
  id: string;
  code: string;
  pinCount: number;
  description?: string;
  carType?: string;
}

export default function DrawingDetailPage() {
  const params = useParams();
  const drawingId = params.id as string;
  
  const [drawing, setDrawing] = useState<DrawingData | null>(null);
  const [pins, setPins] = useState<PinData[]>([]);
  const [trainLines, setTrainLines] = useState<TrainLineData[]>([]);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'info' | 'pins' | 'trainlines' | 'schematic'>('info');
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
          setTrainLines(data.trainLines || []);
          setConnectors(data.connectors || []);
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

  const filteredTrainLines = trainLines.filter(tl => 
    tl.itemName?.toLowerCase().includes(filter.toLowerCase()) ||
    tl.wireNo?.toLowerCase().includes(filter.toLowerCase()) ||
    tl.lineGroup?.toLowerCase().includes(filter.toLowerCase())
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
              onClick={() => setViewMode('pins')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'pins' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Cpu className="h-4 w-4 inline mr-1" />
              Pins {drawing?.totalPins ? `(${drawing.totalPins})` : ''}
            </button>
            {drawing?.totalTrainLines ? (
              <button
                onClick={() => setViewMode('trainlines')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'trainlines' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Zap className="h-4 w-4 inline mr-1" />
                Trainlines ({drawing.totalTrainLines})
              </button>
            ) : null}
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
            <h2 className="text-lg font-semibold text-white">Drawing Information</h2>
            <p className="text-sm text-slate-400 mt-1">Overview and metadata</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-500">Drawing Number</span>
                <p className="text-white font-mono text-lg">{drawing.drawingNo}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Title</span>
                <p className="text-white">{drawing.title}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">System</span>
                <p className={`font-medium ${getSystemColor(drawing.systemCode)}`}>
                  {drawing.systemCode} - {drawing.subsystem}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-500">Car Type</span>
                <p className="text-white">{drawing.carType}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Revision</span>
                <p className="text-white font-mono">{drawing.currentRevision || 'A'}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Drawing Type</span>
                <p className="text-white">{drawing.drawingType.replace('_', ' ')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-slate-500">Pages</span>
                <p className="text-white">{drawing.pageCount} sheets</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Connectors</span>
                <p className="text-white">{drawing.totalConnectors || 0}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Pins</span>
                <p className="text-white">{drawing.totalPins || 0}</p>
              </div>
              {drawing.totalTrainLines ? (
                <div>
                  <span className="text-sm text-slate-500">Train Lines</span>
                  <p className="text-white">{drawing.totalTrainLines}</p>
                </div>
              ) : null}
            </div>
          </div>
          {drawing.notes && (
            <div className="px-6 py-4 border-t border-slate-700/50">
              <span className="text-sm text-slate-500">Notes</span>
              <p className="text-slate-300 mt-1">{drawing.notes}</p>
            </div>
          )}
        </div>
      )}

      {viewMode === 'pins' && (
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

      {viewMode === 'trainlines' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Train Lines</h2>
              <p className="text-sm text-slate-400 mt-1">{trainLines.length} train lines in this drawing</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter trainlines..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-64"
              />
            </div>
          </div>
          
          {filteredTrainLines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Wire No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Connector</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Pin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredTrainLines.map((tl) => (
                    <tr key={tl.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 text-xs">{tl.lineGroup}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{tl.itemName}</span>
                      </td>
                      <td className="px-6 py-4">
                        {tl.wireNo ? (
                          <Link href={`/wires/${tl.wireNo}`} className="hover:text-cyan-300">
                            {getWireColorBadge(tl.wireNo)}
                          </Link>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-cyan-400">{tl.connectorCode || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{tl.pinNo || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {filter ? `No trainlines match "${filter}"` : 'No trainlines recorded for this drawing'}
              </p>
              {!filter && (
                <p className="text-sm text-slate-500 mt-2">Run seed or import to populate data</p>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'schematic' && (
        <div className="space-y-6">
          {drawing.sourceFile ? (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Schematic View</h3>
                <div className="flex items-center gap-3">
                  <a
                    href={`/DOCUMENTS/${drawing.sourceFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Open Full PDF
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="h-6 w-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Circuit Schematic Data</h3>
              </div>
              
              {connectors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Connectors ({connectors.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {connectors.map(conn => (
                      <div key={conn.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-cyan-400 font-bold">{conn.code}</span>
                          <span className="text-xs text-slate-500">{conn.pinCount} pins</span>
                        </div>
                        <div className="text-xs text-slate-400">{conn.description || conn.carType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {trainLines.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Train Lines ({trainLines.length})</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/50">
                          <th className="px-3 py-2 text-left text-slate-400 font-medium">Group</th>
                          <th className="px-3 py-2 text-left text-slate-400 font-medium">Signal Name</th>
                          <th className="px-3 py-2 text-left text-slate-400 font-medium">Wire No</th>
                          <th className="px-3 py-2 text-left text-slate-400 font-medium">Connector</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {trainLines.slice(0, 50).map(tl => (
                          <tr key={tl.id} className="hover:bg-slate-800/30">
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs">{tl.lineGroup}</span>
                            </td>
                            <td className="px-3 py-2 text-white">{tl.itemName}</td>
                            <td className="px-3 py-2">
                              {tl.wireNo ? (
                                <Link href={`/wires/${tl.wireNo}`} className="text-cyan-400 hover:text-cyan-300 font-mono">
                                  {tl.wireNo}
                                </Link>
                              ) : '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-400 font-mono">{tl.connectorCode || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {trainLines.length > 50 && (
                    <p className="text-sm text-slate-500 mt-2">Showing 50 of {trainLines.length} trainlines</p>
                  )}
                </div>
              )}
              
              {connectors.length === 0 && trainLines.length === 0 && (
                <p className="text-slate-400 text-center py-8">
                  No circuit data available for this drawing. 
                  <Link href="/admin/import" className="text-cyan-400 ml-2">Import data from PDF</Link>
                </p>
              )}
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