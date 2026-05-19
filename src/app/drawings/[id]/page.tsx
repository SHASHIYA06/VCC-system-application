'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, Search, ArrowLeft, ArrowRight, Cpu, MapPin, Cable, 
  Box, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Loader2,
  AlertTriangle, Layers, Zap, Settings, Eye
} from 'lucide-react';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/pdf/PdfViewer'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
    </div>
  )
});

interface DrawingData {
  id: string;
  drawingNo: string;
  title: string;
  revision: string;
  systemCode: string;
  systemName: string;
  totalSheets: number;
  sourceFile: string;
  remarks: string;
  pageCount: number;
  _count?: { connectors: number; trainLines: number; devices: number };
}

interface ConnectorData {
  connectorCode: string;
  connectorType: string;
  description: string;
  carType: string;
  pinCount: number;
  pins: { pinNo: string; signalName: string; wireNo: string }[];
}

interface WireData {
  wireNo: string;
  signalName: string;
  wireColor: string;
  voltageClass: string;
  sourceConnector: string;
  destConnector: string;
  sourceEquipment: string;
  destEquipment: string;
}

interface TrainlineData {
  wireNo: string;
  itemName: string;
  lineGroup: string;
}

interface EquipmentData {
  name: string;
  tag: string;
  carType: string;
  systemCode: string;
  systemName: string;
}

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20' },
  COMMS: { color: 'text-pink-400', bg: 'bg-pink-500/20' },
};

function DrawingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = typeof params.id === 'string' ? params.id : null;
  const docId = searchParams.get('doc') || routeId;
  const dwgNo = searchParams.get('dwg') || routeId;
  
  const [drawing, setDrawing] = useState<DrawingData | null>(null);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [wires, setWires] = useState<WireData[]>([]);
  const [trainlines, setTrainlines] = useState<TrainlineData[]>([]);
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'connectors' | 'wires' | 'trainlines' | 'equipment'>('connectors');
  const [expandedConn, setExpandedConn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);

  useEffect(() => {
    if (docId || dwgNo) {
      fetchDrawing();
    }
  }, [docId, dwgNo]);

  useEffect(() => {
    if (drawing?.sourceFile) {
      fetchPdfPageNumber();
    }
  }, [drawing]);

  async function fetchPdfPageNumber() {
    if (!drawing?.sourceFile || !drawing?.drawingNo) return;
    try {
      const res = await fetch(`/api/drawings/pdf-mapping?drawing_no=${encodeURIComponent(drawing.drawingNo)}&source_file=${encodeURIComponent(drawing.sourceFile)}`);
      const data = await res.json();
      if (data.pdfPageNo) {
        setPdfPage(data.pdfPageNo);
      }
    } catch (err) {
      console.error('Failed to fetch PDF page:', err);
    }
  }

  function openPdfViewer() {
    if (drawing?.sourceFile) {
      setShowPdfViewer(true);
    }
  }

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => searchDrawing(), 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function fetchDrawing() {
    try {
      setLoading(true);
      const query = docId || dwgNo;
      if (!query) return;
      const res = await fetch(`/api/drawings/lookup?drawing_no=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (res.ok && data.drawing) {
        setDrawing(data.drawing);
        setConnectors(data.relatedConnectors || []);
        setWires(data.relatedWires || []);
        setTrainlines(data.relatedTrainlines || []);
        setEquipment(data.relatedEquipment || []);
        setSuggestions(data.suggestions || []);
        setError(null);
      } else {
        setError(data.error || 'Drawing not found');
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      setError('Failed to load drawing');
    } finally {
      setLoading(false);
    }
  }

  async function searchDrawing() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/drawings/lookup?drawing_no=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.drawing) {
        setDrawing(data.drawing);
        setConnectors(data.relatedConnectors || []);
        setWires(data.relatedWires || []);
        setTrainlines(data.relatedTrainlines || []);
        setEquipment(data.relatedEquipment || []);
      } else {
        setSearchResults(data.suggestions || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <Link href="/drawings" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Drawings
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by drawing number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchDrawing()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200"
            />
          </div>
          <button onClick={searchDrawing} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {searchResults.map((s, i) => (
                <Link key={i} href={`/drawings/${s.drawingNo}?doc=${s.drawingNo}`}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm hover:bg-cyan-500/30">
                  {s.drawingNo} - {s.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-slate-400">Did you mean:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {suggestions.map((s, i) => (
                  <Link key={i} href={`/drawings/${s.drawingNo}?doc=${s.drawingNo}`}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                    {s.drawingNo}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {drawing && (
        <>
          <div className="glass-card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-cyan-400 font-bold text-2xl">{drawing.drawingNo}</span>
                  <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-sm">Rev {drawing.revision}</span>
                  {drawing.systemCode && (
                    <span className={`px-2 py-1 rounded text-sm ${SYSTEM_COLORS[drawing.systemCode]?.bg || 'bg-slate-500/20'} ${SYSTEM_COLORS[drawing.systemCode]?.color || 'text-slate-400'}`}>
                      {drawing.systemCode}
                    </span>
                  )}
                </div>
                <h2 className="text-xl text-white font-semibold">{drawing.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{drawing.systemName || drawing.systemCode}</p>
              </div>
              <div className="flex flex-col gap-2">
                {drawing.sourceFile ? (
                  <button onClick={openPdfViewer}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
                    <Eye className="h-4 w-4" />
                    View PDF (Page {pdfPage})
                  </button>
                ) : (
                  <div className="text-sm text-slate-500">No PDF attached</div>
                )}
                <Link href="/documents" className="text-xs text-cyan-400 hover:text-cyan-300 text-center">
                  Browse all documents
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400">Sheets</div>
                <div className="text-white font-bold">{drawing.totalSheets}</div>
              </div>
              <Link href="/connectors" className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div className="text-slate-400">Connectors</div>
                <div className="text-cyan-400 font-bold">{drawing._count?.connectors || connectors.length}</div>
              </Link>
              <Link href="/trainlines" className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div className="text-slate-400">Trainlines</div>
                <div className="text-cyan-400 font-bold">{drawing._count?.trainLines || trainlines.length}</div>
              </Link>
              <Link href="/equipment" className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div className="text-slate-400">Equipment</div>
                <div className="text-cyan-400 font-bold">{drawing._count?.devices || equipment.length}</div>
              </Link>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button onClick={() => setActiveTab('connectors')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'connectors' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}>
              <MapPin className="h-4 w-4" />
              Connectors ({connectors.length})
            </button>
            <button onClick={() => setActiveTab('wires')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'wires' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}>
              <Cable className="h-4 w-4" />
              Wires ({wires.length})
            </button>
            <button onClick={() => setActiveTab('trainlines')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'trainlines' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}>
              <Zap className="h-4 w-4" />
              Trainlines ({trainlines.length})
            </button>
            <button onClick={() => setActiveTab('equipment')}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'equipment' ? 'bg-cyan-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}`}>
              <Box className="h-4 w-4" />
              Equipment ({equipment.length})
            </button>
          </div>

          {activeTab === 'connectors' && (
            <div className="space-y-3">
              {connectors.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No connectors found for this drawing</p>
                </div>
              ) : connectors.map((conn, idx) => (
                <div key={idx} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30"
                    onClick={() => setExpandedConn(expandedConn === conn.connectorCode ? null : conn.connectorCode)}>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400 font-bold">{conn.connectorCode}</span>
                        <span className="text-sm text-slate-400">{conn.connectorType}</span>
                        {conn.carType && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{conn.carType}</span>}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{conn.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{conn.pinCount} pins</span>
                      {expandedConn === conn.connectorCode ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>
                  {expandedConn === conn.connectorCode && (
                    <div className="border-t border-slate-700/50">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/30">
                            <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Pin</th>
                            <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Signal</th>
                            <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Wire</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {conn.pins.map((pin, pIdx) => (
                            <tr key={pIdx} className="hover:bg-slate-800/20">
                              <td className="px-5 py-2 font-mono font-bold text-cyan-400">{pin.pinNo}</td>
                              <td className="px-5 py-2 text-white">{pin.signalName || '-'}</td>
                              <td className="px-5 py-2">
                                {pin.wireNo ? (
                                  <Link href={`/wires?wire=${encodeURIComponent(pin.wireNo)}`} className="font-mono text-cyan-400 hover:text-cyan-300">
                                    {pin.wireNo}
                                  </Link>
                                ) : <span className="text-slate-500">-</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'wires' && (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Wire No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Signal</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Voltage</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Source</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {wires.map((wire, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="px-5 py-3 font-mono font-bold text-cyan-400">{wire.wireNo}</td>
                      <td className="px-5 py-3 text-white">{wire.signalName || '-'}</td>
                      <td className="px-5 py-3 text-slate-400">{wire.voltageClass || '-'}</td>
                      <td className="px-5 py-3 text-slate-400">{wire.sourceEquipment || wire.sourceConnector || '-'}</td>
                      <td className="px-5 py-3 text-slate-400">{wire.destEquipment || wire.destConnector || '-'}</td>
                    </tr>
                  ))}
                  {wires.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No wires found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'trainlines' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {trainlines.map((tl, idx) => (
                <div key={idx} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{tl.wireNo}</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{tl.lineGroup}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{tl.itemName}</p>
                </div>
              ))}
              {trainlines.length === 0 && (
                <div className="col-span-full glass-card p-12 text-center">
                  <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No trainlines found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {equipment.map((eq, idx) => (
                <div key={idx} className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <Box className="h-5 w-5 text-orange-400" />
                    <div>
                      <p className="font-semibold text-white">{eq.name}</p>
                      <p className="text-sm text-slate-400">{eq.tag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {eq.carType && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{eq.carType}</span>}
                    {eq.systemCode && <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded text-xs">{eq.systemCode}</span>}
                  </div>
                </div>
              ))}
              {equipment.length === 0 && (
                <div className="col-span-full glass-card p-12 text-center">
                  <Box className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No equipment found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showPdfViewer && drawing?.sourceFile && (
        <PdfViewer
          src={`/DOCUMENTS/${drawing.sourceFile}`}
          initialPage={pdfPage}
          title={`${drawing.drawingNo} - ${drawing.title}`}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </div>
  );
}

export default function DrawingDetailPage() {
  return (
    <Suspense fallback={
      <div className="animated-bg min-h-screen p-6 grid-pattern flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <DrawingDetailContent />
    </Suspense>
  );
}