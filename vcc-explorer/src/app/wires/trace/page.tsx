'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Zap, Search, ArrowLeft, ArrowRight, MapPin, Cable, 
  AlertTriangle, RefreshCw, ChevronDown, ExternalLink, 
  Box, FileText, X, Loader2, Layers, Database
} from 'lucide-react';

interface WireData {
  wireNo: string;
  signalName: string;
  voltageClass: string;
  wireColor: string;
  description: string;
  sourceEquipment: string;
  sourceConnector: string;
  destEquipment: string;
  destConnector: string;
}

interface PinConnection {
  pinNo: string;
  signalName: string;
  connectorCode: string;
  drawingNo: string;
  system: string;
}

interface TrainlineEntry {
  wireNo: string;
  itemName: string;
  lineGroup: string;
  drawingNo: string;
  system: string;
}

interface LocationData {
  drawingNo: string;
  system: string;
  pinCount: number;
}

const CROSS_CONNECTED: Record<string, string[]> = {
  '3005': ['3006'],
  '3006': ['3005'],
  '6009': ['6046'],
  '6046': ['6009'],
  '6014': ['6051'],
  '6051': ['6014'],
};

function WireTraceContent() {
  const searchParams = useSearchParams();
  const wireParam = searchParams.get('wire');
  const wirePath = searchParams.get('wire_no');
  
  const [wireSearch, setWireSearch] = useState('');
  const [wireNo, setWireNo] = useState(wireParam || wirePath || '');
  const [wireData, setWireData] = useState<WireData | null>(null);
  const [pinConnections, setPinConnections] = useState<Record<string, { drawingNo: string; system: string; title: string; pins: any[] }>>({});
  const [trainlineEntries, setTrainlineEntries] = useState<TrainlineEntry[]>([]);
  const [signalMatches, setSignalMatches] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>({});
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDrawings, setExpandedDrawings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const wire = wireParam || wirePath;
    if (wire) {
      fetchWireTrace(wire);
    }
  }, [wireParam, wirePath]);

  useEffect(() => {
    if (Object.keys(expandedDrawings).length === 0 && Object.keys(pinConnections).length > 0) {
      const initial: Record<string, boolean> = {};
      Object.keys(pinConnections).forEach(d => { initial[d] = true; });
      setExpandedDrawings(initial);
    }
  }, [pinConnections]);

  async function fetchWireTrace(wire: string) {
    if (!wire) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?wire=${encodeURIComponent(wire.trim())}`);
      const data = await res.json();
      
      if (data.error && data.error !== 'Query parameter "q" or "wire" is required') {
        setError(data.error);
        return;
      }
      
      if (data.type === 'wire_trace') {
        setWireData(data.wire);
        setPinConnections(data.pinConnections || {});
        setTrainlineEntries(data.trainlineEntries || []);
        setSignalMatches(data.signalMatches || []);
        setMetadata(data.metadata || {});
        setLocations(data.locations || []);
        setWireNo(wire);
      } else {
        setError('Wire not found in database');
      }
    } catch (err) {
      setError('Failed to load wire trace');
    } finally {
      setLoading(false);
    }
  }

  function searchWire() {
    if (wireSearch.trim()) {
      fetchWireTrace(wireSearch.trim());
    }
  }

  function toggleDrawing(dwg: string) {
    setExpandedDrawings(prev => ({ ...prev, [dwg]: !prev[dwg] }));
  }

  const isCrossConnected = CROSS_CONNECTED[wireNo]?.length > 0;
  const crossWith = CROSS_CONNECTED[wireNo] || [];

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
        <Link href="/wires" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Wires
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter wire number (e.g., 3003, 6009, 4024)..."
              value={wireSearch}
              onChange={(e) => setWireSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchWire()}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200"
            />
          </div>
          <button onClick={searchWire} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
            Trace Wire
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {wireNo && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className={`font-mono text-3xl font-bold ${isCrossConnected ? 'text-amber-400' : 'text-cyan-400'}`}>
                {wireNo}
              </span>
              {isCrossConnected && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Crossed with {crossWith.join(', ')}
                </span>
              )}
            </div>
            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
              {locations.length} location{locations.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {wireData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-sm">Signal Name</div>
                <div className="text-white font-semibold">{wireData.signalName || '-'}</div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-sm">Voltage</div>
                <div className="text-white font-semibold">{wireData.voltageClass || '-'}</div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-sm">Source</div>
                <div className="text-white font-semibold text-sm">
                  {wireData.sourceEquipment || '-'} {wireData.sourceConnector ? `(${wireData.sourceConnector})` : ''}
                </div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400 text-sm">Destination</div>
                <div className="text-white font-semibold text-sm">
                  {wireData.destEquipment || '-'} {wireData.destConnector ? `(${wireData.destConnector})` : ''}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">{metadata.totalPins || 0}</div>
              <div className="text-slate-400">Pin Connections</div>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{metadata.totalTrainlineEntries || 0}</div>
              <div className="text-slate-400">Trainline Entries</div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">{metadata.totalDrawings || locations.length}</div>
              <div className="text-slate-400">Drawings</div>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-400">{trainlineEntries.length}</div>
              <div className="text-slate-400">Related Signals</div>
            </div>
          </div>
        </div>
      )}

      {Object.keys(pinConnections).length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            Pin Connections Across All Drawings ({Object.keys(pinConnections).length})
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Wire {wireNo} appears in the following drawings. Click a drawing to see all pin connections.
          </p>
          
          <div className="space-y-3">
            {Object.entries(pinConnections).map(([drawingNo, data]) => (
              <div key={drawingNo} className="glass-card overflow-hidden">
                <div 
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30"
                  onClick={() => toggleDrawing(drawingNo)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-cyan-400 font-bold">{drawingNo}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      data.system === 'TRAC' ? 'bg-orange-500/20 text-orange-400' :
                      data.system === 'BRAKE' ? 'bg-red-500/20 text-red-400' :
                      data.system === 'DOOR' ? 'bg-amber-500/20 text-amber-400' :
                      data.system === 'TMS' ? 'bg-purple-500/20 text-purple-400' :
                      data.system === 'APS' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {data.system}
                    </span>
                    <span className="text-sm text-slate-400">{data.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{data.pins.length} pins</span>
                    <Link href={`/drawings/${drawingNo}`} onClick={e => e.stopPropagation()}
                      className="px-3 py-1 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded text-sm flex items-center gap-1">
                      Drawing <ExternalLink className="h-3 w-3" />
                    </Link>
                    {expandedDrawings[drawingNo] ? 
                      <ChevronDown className="h-5 w-5 text-slate-400" /> : 
                      <ChevronDown className="h-5 w-5 text-slate-400 transform rotate-180" />
                    }
                  </div>
                </div>
                
                {expandedDrawings[drawingNo] && (
                  <div className="border-t border-slate-700/50">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/30 bg-slate-800/20">
                          <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Pin</th>
                          <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Connector</th>
                          <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Signal</th>
                          <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Wire</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {data.pins.map((pin: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="px-5 py-2 font-mono font-bold text-cyan-400">{pin.pinNo}</td>
                            <td className="px-5 py-2 text-white">{pin.connectorCode}</td>
                            <td className="px-5 py-2 text-slate-300">{pin.signalName || '-'}</td>
                            <td className="px-5 py-2">
                              <span className="font-mono text-amber-400">{pin.wireNo}</span>
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
        </div>
      )}

      {trainlineEntries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-400" />
            Trainline Entries ({trainlineEntries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainlineEntries.map((tl, idx) => (
              <div key={idx} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-cyan-400">{tl.wireNo}</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{tl.lineGroup}</span>
                </div>
                <p className="text-sm text-slate-300">{tl.itemName}</p>
                <p className="text-xs text-slate-500 mt-1">Drawing: {tl.drawingNo || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!wireNo && !loading && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Enter a wire number above to trace its complete path</p>
          <p className="text-sm text-slate-500 mt-2">
            Examples: 3003 (Forward), 6009 (Door Open L), 4024 (Brake Loop)
          </p>
        </div>
      )}
    </div>
  );
}

export default function WireTracePage() {
  return (
    <Suspense fallback={
      <div className="animated-bg min-h-screen p-6 grid-pattern flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    }>
      <WireTraceContent />
    </Suspense>
  );
}