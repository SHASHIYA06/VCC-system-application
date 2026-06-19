'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Train, Layers, FileText, Cpu, MapPin, Cable, ChevronRight, 
  ChevronDown, Loader2, ArrowLeft, Zap, Search, AlertTriangle
} from 'lucide-react';

interface SystemData {
  code: string; name: string; category: string;
  drawings: number; devices: number; connectors: number; wires: number; completeness: number;
}

interface DrawingData {
  drawingNo: string; title: string; sheets: number;
  connectors: { code: string; pins: number }[];
  connectorCount: number; deviceCount: number; trainlineCount: number;
}

interface ConnectorData {
  code: string; carType: string; location: string; totalPins: number;
  pins: { pin: string; signal: string; wire: string; voltage: string; class: string }[];
}

interface WireTrace {
  wireNo: string; signalName: string; description: string;
  wireSize: string; wireColor: string; voltageClass: string;
  source: { equipment: string; connector: string; pin: string };
  destination: { equipment: string; connector: string; pin: string };
  appearances: { connector: string; pin: string; signal: string; drawing: string; system: string }[];
}

export default function GSDExplorePage() {
  const [level, setLevel] = useState<'train' | 'system' | 'drawing' | 'connector' | 'wire'>('train');
  const [systems, setSystems] = useState<SystemData[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [drawings, setDrawings] = useState<DrawingData[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<string>('');
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [selectedConnector, setSelectedConnector] = useState<string>('');
  const [wireTrace, setWireTrace] = useState<WireTrace | null>(null);
  const [wireSearch, setWireSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Train']);

  // Load train overview
  useEffect(() => { loadTrainOverview(); }, []);

  async function loadTrainOverview() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/gsd/explore');
      const data = await res.json();
      if (data.success) setSystems(data.data.systems);
      else setError(data.error);
    } catch (e) { setError('Failed to load train data'); }
    setLoading(false);
  }

  async function selectSystem(code: string) {
    setLoading(true); setError(''); setSelectedSystem(code);
    try {
      const res = await fetch(`/api/gsd/explore?system=${code}`);
      const data = await res.json();
      if (data.success) { setDrawings(data.data.drawings); setLevel('system'); setBreadcrumb(['Train', code]); }
      else setError(data.error);
    } catch (e) { setError('Failed to load system'); }
    setLoading(false);
  }

  async function selectDrawing(dwgNo: string) {
    setLoading(true); setError(''); setSelectedDrawing(dwgNo);
    try {
      const res = await fetch(`/api/gsd/explore?drawing=${dwgNo}`);
      const data = await res.json();
      if (data.success) { setConnectors(data.data.connectors); setLevel('drawing'); setBreadcrumb(['Train', selectedSystem, dwgNo]); }
      else setError(data.error);
    } catch (e) { setError('Failed to load drawing'); }
    setLoading(false);
  }

  async function traceWire(wire: string) {
    if (!wire.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/gsd/explore?wire=${wire.trim()}`);
      const data = await res.json();
      if (data.success) { setWireTrace(data.data); setLevel('wire'); setBreadcrumb(['Train', 'Wire Trace', wire]); }
      else setError(`Wire ${wire} not found`);
    } catch (e) { setError('Failed to trace wire'); }
    setLoading(false);
  }

  function goBack() {
    if (level === 'wire') { setLevel('train'); setBreadcrumb(['Train']); setWireTrace(null); }
    else if (level === 'drawing') { setLevel('system'); setBreadcrumb(['Train', selectedSystem]); }
    else if (level === 'system') { setLevel('train'); setBreadcrumb(['Train']); }
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Train className="h-6 w-6 text-cyan-400" />
          GSD-Pi: Train Wiring Explorer
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Navigate: Train → System → Drawing → Connector → Pin → Wire
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-4 text-sm">
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
            <button onClick={() => { if (i === 0) { setLevel('train'); setBreadcrumb(['Train']); } }} className="text-slate-400 hover:text-cyan-400 cursor-pointer">
              {item}
            </button>
          </span>
        ))}
      </div>

      {/* Wire Search */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text" value={wireSearch} onChange={e => setWireSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && traceWire(wireSearch)}
            placeholder="Trace wire number (e.g. 3001, 6009)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button onClick={() => traceWire(wireSearch)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg cursor-pointer">
          Trace
        </button>
        {level !== 'train' && (
          <button onClick={goBack} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg cursor-pointer flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 p-8 justify-center">
          <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading...</span>
        </div>
      )}

      {/* LEVEL 1: Train Overview - All Systems */}
      {!loading && level === 'train' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {systems.map(sys => (
            <button key={sys.code} onClick={() => selectSystem(sys.code)}
              className="text-left p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{sys.code}</span>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 mb-3">{sys.name}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <span className="text-slate-500"><FileText className="h-3 w-3 inline mr-1" />{sys.drawings} dwgs</span>
                <span className="text-slate-500"><Cpu className="h-3 w-3 inline mr-1" />{sys.devices} dev</span>
              </div>
              <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${sys.completeness}%` }} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* LEVEL 2: System - Drawings List */}
      {!loading && level === 'system' && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white mb-4">{selectedSystem} — Drawings</h2>
          {drawings.map(dwg => (
            <button key={dwg.drawingNo} onClick={() => selectDrawing(dwg.drawingNo)}
              className="w-full text-left p-3 bg-slate-900/80 border border-slate-800 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm text-cyan-400">{dwg.drawingNo}</span>
                  <span className="ml-3 text-sm text-slate-300">{dwg.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{dwg.connectorCount} connectors</span>
                  <span>{dwg.deviceCount} devices</span>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400" />
                </div>
              </div>
              {dwg.connectors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {dwg.connectors.slice(0, 8).map(c => (
                    <span key={c.code} className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400">{c.code} ({c.pins}p)</span>
                  ))}
                  {dwg.connectors.length > 8 && <span className="text-[10px] text-slate-500">+{dwg.connectors.length - 8} more</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* LEVEL 3: Drawing - Connectors with Pins */}
      {!loading && level === 'drawing' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">{selectedDrawing} — Connectors & Pins</h2>
          {connectors.length === 0 && <p className="text-slate-400">No connectors found on this drawing</p>}
          {connectors.map(conn => (
            <details key={conn.code} className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden group">
              <summary className="px-4 py-3 cursor-pointer hover:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span className="font-mono font-bold text-white">{conn.code}</span>
                  {conn.carType && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{conn.carType}</span>}
                  {conn.location && <span className="text-xs text-slate-500">{conn.location}</span>}
                </div>
                <span className="text-xs text-slate-400">{conn.totalPins} pins</span>
              </summary>
              <div className="border-t border-slate-800">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400">
                      <th className="px-3 py-2 text-left">Pin</th>
                      <th className="px-3 py-2 text-left">Signal</th>
                      <th className="px-3 py-2 text-left">Wire</th>
                      <th className="px-3 py-2 text-left">Voltage</th>
                      <th className="px-3 py-2 text-left">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conn.pins.map((p, i) => (
                      <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-3 py-1.5 font-mono font-bold text-cyan-400">{p.pin}</td>
                        <td className="px-3 py-1.5 text-white">{p.signal || '—'}</td>
                        <td className="px-3 py-1.5">
                          {p.wire ? (
                            <button onClick={() => traceWire(p.wire)} className="text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer underline">
                              {p.wire}
                            </button>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-1.5 text-slate-400">{p.voltage || '—'}</td>
                        <td className="px-3 py-1.5 text-slate-500">{p.class || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* LEVEL 4: Wire Trace */}
      {!loading && level === 'wire' && wireTrace && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cable className="h-5 w-5 text-green-400" />
            Wire Trace: {wireTrace.wireNo}
          </h2>

          {/* Wire Info */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><span className="text-slate-500 block text-xs">Signal</span><span className="text-white">{wireTrace.signalName || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Size</span><span className="text-white">{wireTrace.wireSize || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Color</span><span className="text-white">{wireTrace.wireColor || '—'}</span></div>
              <div><span className="text-slate-500 block text-xs">Voltage</span><span className="text-white">{wireTrace.voltageClass || '—'}</span></div>
            </div>
            {wireTrace.description && <p className="mt-3 text-sm text-slate-400">{wireTrace.description}</p>}
          </div>

          {/* Route */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Route</h3>
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <div className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-green-400 font-bold">{wireTrace.source.equipment || '?'}</span>
                <span className="text-slate-500 ml-1">({wireTrace.source.connector}:{wireTrace.source.pin})</span>
              </div>
              <div className="text-slate-600">→ Wire {wireTrace.wireNo} →</div>
              <div className="px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <span className="text-orange-400 font-bold">{wireTrace.destination.equipment || '?'}</span>
                <span className="text-slate-500 ml-1">({wireTrace.destination.connector}:{wireTrace.destination.pin})</span>
              </div>
            </div>
          </div>

          {/* All appearances across drawings */}
          {wireTrace.appearances.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Appears on ({wireTrace.appearances.length} locations)</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="py-2 text-left">Drawing</th>
                    <th className="py-2 text-left">System</th>
                    <th className="py-2 text-left">Connector</th>
                    <th className="py-2 text-left">Pin</th>
                    <th className="py-2 text-left">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {wireTrace.appearances.map((a, i) => (
                    <tr key={i} className="border-t border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-1.5"><Link href={`/drawings/${a.drawing}`} className="text-cyan-400 hover:underline cursor-pointer">{a.drawing}</Link></td>
                      <td className="py-1.5 text-slate-400">{a.system}</td>
                      <td className="py-1.5 text-purple-400 font-mono">{a.connector}</td>
                      <td className="py-1.5 text-white font-mono">{a.pin}</td>
                      <td className="py-1.5 text-slate-300">{a.signal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
