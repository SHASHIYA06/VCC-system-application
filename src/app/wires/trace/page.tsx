'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, StatCard, GlassPanel } from '@/components/ui';
import { 
  Zap, Search, ArrowLeft, ArrowRight, MapPin, Cable, 
  AlertTriangle, RefreshCw, ChevronDown, ExternalLink, 
  Box, FileText, X, Loader2, Layers, Database, TrendingUp,
  Activity, Network, GitBranch
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
  const [signalMatches, setSignalMatches] = useState<unknown[]>([]);
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
      const res = await fetch(`/api/wire-trace?wire_no=${encodeURIComponent(wire.trim())}`);
      const data = await res.json();
      
      if (res.ok && data.wire) {
        setWireData(data.wire);
        setPinConnections(data.drawings.reduce((acc: any, d: any) => {
          acc[d.drawingNo] = {
            drawingNo: d.drawingNo,
            system: d.system?.code || 'N/A',
            title: d.title,
            pins: d.pins.map((p: any) => ({
              pinNo: p.pinNo,
              signalName: p.signalName,
              connectorCode: p.connector?.connectorCode || 'N/A',
              wireNo: p.wireNo || 'N/A'
            }))
          };
          return acc;
        }, {} as Record<string, unknown>));
        setTrainlineEntries(data.trainlines.map((t: any) => ({
          wireNo: t.wireNo,
          itemName: t.itemName,
          lineGroup: t.lineGroup,
          drawingNo: t.drawing?.drawingNo || 'N/A',
          system: t.drawing?.system?.code || 'N/A'
        })) || []);
        setSignalMatches(data.connectorPins || []);
        setMetadata(data.summary || {});
        setLocations(data.drawings.map((d: any) => ({
          drawingNo: d.drawingNo,
          system: d.system?.code || 'N/A',
          pinCount: d.pins.length
        })) || []);
        setWireNo(wire);
      } else {
        setError(data.error || 'Wire not found in database');
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400 text-lg">Tracing wire path...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link href="/wires" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Wires
        </Link>
        
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 gradient-text-animated">
          Wire Trace
        </h1>
        <p className="text-slate-400">Trace wire connections across all drawings and systems</p>
      </motion.div>

      {/* Search Panel */}
      <GlassPanel
        title="Search Wire"
        subtitle="Enter wire number to trace complete path"
        icon={<Search className="h-5 w-5" />}
        variant="elevated"
        glow={true}
        glowColor="cyan"
      >
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
            <input
              type="text"
              placeholder="Enter wire number (e.g., 3003, 6009, 4024)..."
              value={wireSearch}
              onChange={(e) => setWireSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchWire()}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-600 focus:border-cyan-500 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <GlassButton
            variant="primary"
            size="lg"
            onClick={searchWire}
            disabled={!wireSearch.trim() || loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Cable className="h-5 w-5" />}
            Trace Wire
          </GlassButton>
        </div>
      </GlassPanel>

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