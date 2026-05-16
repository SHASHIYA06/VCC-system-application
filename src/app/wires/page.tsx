'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cable, Search, ArrowRight, AlertTriangle, ChevronDown, Zap, RefreshCw } from 'lucide-react';

const FALLBACK_WIRES: WireData[] = [
  { wireNo: '3003', signalName: 'FORWARD_CMD', description: 'Forward propulsion command to VVVF', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'X1', sourcePin: '17', destEq: 'V1', destConnector: 'CN1', destPin: '12' },
  { wireNo: '3004', signalName: 'REVERSE_CMD', description: 'Reverse propulsion command to VVVF', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'X1', sourcePin: '18', destEq: 'V1', destConnector: 'CN1', destPin: '13' },
  { wireNo: '3005', signalName: 'POWERING_1', description: 'Powering command level 1 (crossed with 3006)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'X1', sourcePin: '19', destEq: 'V1', destConnector: 'CN1', destPin: '14' },
  { wireNo: '3006', signalName: 'POWERING_2', description: 'Powering command level 2 (crossed with 3005)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'X1', sourcePin: '20', destEq: 'V1', destConnector: 'CN1', destPin: '15' },
  { wireNo: '3010', signalName: 'BRAKE_CMD', description: 'Braking command to VVVF', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'X1', sourcePin: '22', destEq: 'V1', destConnector: 'CN1', destPin: '16' },
  { wireNo: '4024', signalName: 'BRAKE_LOOP_N', description: 'Brake loop normal - through BCU/BECU all cars', wireColor: 'Red', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'BCU1', sourceConnector: 'X1', sourcePin: '24', destEq: 'BCU2', destConnector: 'X1', destPin: '24' },
  { wireNo: '4062', signalName: 'EM_BRAKE_N', description: 'Emergency brake loop normal - all cars', wireColor: 'Red', wireType: 'Safety', voltageClass: '110VDC', sourceEq: 'EBMV', sourceConnector: 'X1', sourcePin: '42', destEq: 'EBSS', destConnector: 'X1', destPin: '42' },
  { wireNo: '6009', signalName: 'DOOR_OPEN_L', description: 'Left door open command (crossed with 6046)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'U15', sourcePin: 'J7', destEq: 'DCU1', destConnector: 'CN1', destPin: '3' },
  { wireNo: '6014', signalName: 'DOOR_CLOSE_L', description: 'Left door close command (crossed with 6051)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'U15', sourcePin: 'J9', destEq: 'DCU1', destConnector: 'CN1', destPin: '5' },
  { wireNo: '6046', signalName: 'DOOR_OPEN_R', description: 'Right door open command (crossed with 6009)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'U15', sourcePin: 'J8', destEq: 'DCU1', destConnector: 'CN1', destPin: '4' },
  { wireNo: '6051', signalName: 'DOOR_CLOSE_R', description: 'Right door close command (crossed with 6014)', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO1', sourceConnector: 'U15', sourcePin: 'J10', destEq: 'DCU1', destConnector: 'CN1', destPin: '6' },
  { wireNo: '6112', signalName: 'ZERO_SPEED', description: 'Zero speed signal - enables door opening', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'V1', sourceConnector: 'CN2', sourcePin: '3', destEq: 'TCMS_RIO1', destConnector: 'U15', destPin: 'L3' },
  { wireNo: '7001', signalName: 'CAB_VAC_FLT', description: 'Cab VAC fault indication', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'CAB_VAC1', sourceConnector: 'CN1', sourcePin: '5', destEq: 'TCMS_RIO2', destConnector: 'U25', destPin: 'F2' },
  { wireNo: '7050', signalName: 'VAC1_STATUS', description: 'Saloon VAC 1 status feedback', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'VAC1', sourceConnector: 'CN1', sourcePin: '3', destEq: 'TCMS_RIO1', destConnector: 'U15', destPin: 'F4' },
  { wireNo: '1207', signalName: 'VVVF_FAULT', description: 'VVVF fault indication', wireColor: 'Blue', wireType: 'Fault', voltageClass: '110VDC', sourceEq: 'V1', sourceConnector: 'CN2', sourcePin: '5', destEq: 'TCMS_RIO1', destConnector: 'U15', destPin: 'M2' },
  { wireNo: '1209', signalName: 'HSCB_TRIP', description: 'HSCB trip status indication', wireColor: 'Blue', wireType: 'Fault', voltageClass: '110VDC', sourceEq: 'HSCB1', sourceConnector: 'CN1', sourcePin: '3', destEq: 'TCMS_RIO1', destConnector: 'U15', destPin: 'H4' },
  { wireNo: '5000', signalName: 'SHORE_SUPPLY', description: 'Shore supply contactor command', wireColor: 'Red', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'TCMS_RIO2', sourceConnector: 'U25', sourcePin: 'H5', destEq: 'SSB1', destConnector: 'CN1', destPin: '3' },
  { wireNo: '5030', signalName: 'SIV_CONTACT1', description: 'SIV contactor 1 status', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'APS1', sourceConnector: 'CN3', sourcePin: '1', destEq: 'TCMS_RIO2', destConnector: 'U25', destPin: 'J6' },
  { wireNo: '5064', signalName: 'BAT_UNDER_VOLT', description: 'Battery under-voltage warning', wireColor: 'Blue', wireType: 'Control', voltageClass: '110VDC', sourceEq: 'BATT1', sourceConnector: 'CN1', sourcePin: '2', destEq: 'TCMS_RIO2', destConnector: 'U25', destPin: 'G4' },
];

const SYSTEM_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Traction' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Brake' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Door' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'VAC/HVAC' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Aux Power' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Trainlines' },
  HV: { color: 'text-red-600', bg: 'bg-red-600/20', label: 'HV' },
};

const TYPE_COLORS: Record<string, string> = {
  Control: 'bg-slate-500/20 text-slate-400',
  Safety: 'bg-red-500/20 text-red-400',
  Fault: 'bg-amber-500/20 text-amber-400',
};

const COLOR_CODES: Record<string, string> = {
  Blue: 'bg-blue-500/20 text-blue-400',
  Red: 'bg-red-500/20 text-red-400',
  Black: 'bg-slate-700 text-slate-300',
  Green: 'bg-green-500/20 text-green-400',
};

const CROSS_CONNECTED = ['3005', '3006', '6009', '6014', '6046', '6051'];

interface WireData {
  wireNo: string;
  signalName: string | null;
  description: string | null;
  wireColor: string | null;
  wireType: string | null;
  voltageClass: string | null;
  sourceEq?: string | null;
  sourceEquipment?: string | null;
  sourceConnector: string | null;
  sourcePin: string | null;
  destEq?: string | null;
  destEquipment?: string | null;
  destConnector: string | null;
  destPin: string | null;
  endpoints?: Array<{
    endpointRole: string | null;
    endpointLabel: string | null;
    device?: { name: string; carType: string | null } | null;
    connector?: { connectorCode: string } | null;
  }>;
}

export default function WiresPage() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [crossOnly, setCrossOnly] = useState(false);
  const [wires, setWires] = useState<WireData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  useEffect(() => {
    async function fetchWires() {
      try {
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('offset', String(offset));
        if (search) params.set('search', search);
        
        const response = await fetch(`/api/wires?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        if (offset === 0) {
          setWires(data.wires || []);
        } else {
          setWires(prev => [...prev, ...(data.wires || [])]);
        }
        setHasMore(data.pagination?.hasMore || false);
        setError(null);
      } catch (err) {
        console.error('Wire fetch error:', err);
        if (offset === 0) {
          setWires(FALLBACK_WIRES);
          setError('Using offline data - database may be unavailable');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchWires();
  }, [offset, search]); // Added search to dependency array so it refetches when search changes

  const loadMore = () => {
    if (hasMore && !loading) {
      setOffset(prev => prev + limit);
    }
  };

  const filtered = wires.filter(w => {
    // If we're filtering server-side via the search input, client-side filtering by search is redundant but harmless.
    const matchSearch = search === '' ||
      w.wireNo?.includes(search) || 
      (w.signalName || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.description || '').toLowerCase().includes(search.toLowerCase());
    const matchSystem = systemFilter === 'all' || 
      w.endpoints?.some(ep => ep.device?.carType === systemFilter);
    const matchType = typeFilter === 'all' || (w.wireType || 'Control') === typeFilter;
    const matchCross = !crossOnly || CROSS_CONNECTED.includes(w.wireNo);
    return matchSearch && matchSystem && matchType && matchCross;
  });

  const getSourceDest = (wire: WireData) => {
    if (wire.endpoints && wire.endpoints.length > 0) {
      const source = wire.endpoints.find(e => e.endpointRole === 'source');
      const dest = wire.endpoints.find(e => e.endpointRole === 'destination');
      const srcLabel = source?.endpointLabel || source?.connector?.connectorCode || wire.sourceEquipment || wire.sourceEq || wire.sourceConnector || '';
      const dstLabel = dest?.endpointLabel || dest?.connector?.connectorCode || wire.destEquipment || wire.destEq || wire.destConnector || '';
      return { source: srcLabel, dest: dstLabel };
    }
    const srcEq = wire.sourceEquipment || wire.sourceEq || '';
    const dstEq = wire.destEquipment || wire.destEq || '';
    const src = srcEq ? `${srcEq} ${wire.sourceConnector || ''}`.trim() : wire.sourceConnector || '';
    const dst = dstEq ? `${dstEq} ${wire.destConnector || ''}`.trim() : wire.destConnector || '';
    return { source: src, dest: dst };
  };

  if (loading && wires.length === 0) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Wire Intelligence</h1>
        <p className="mt-2 text-slate-400">
          Complete wire registry with specifications for point-to-point tracing
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{wires.length} wires loaded</span>
          {CROSS_CONNECTED.length > 0 && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" /> {CROSS_CONNECTED.length} cross-connected
            </span>
          )}
        </div>
        {error && (
          <div className="mt-2 text-amber-400 text-sm">{error}</div>
        )}
      </div>

      {/* Wire Format Decoder */}
      <div className="mb-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-cyan-400" /> Wire Number Format: XXXX XX (5-digit)
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">1-2</div>
            <div className="text-cyan-400 font-mono font-bold">Unit</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">3</div>
            <div className="text-cyan-400 font-mono font-bold">Car</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">4</div>
            <div className="text-cyan-400 font-mono font-bold">TL</div>
          </div>
          <div className="px-2 py-1 rounded bg-slate-700/50 text-center min-w-[48px]">
            <div className="text-slate-400">5</div>
            <div className="text-cyan-400 font-mono font-bold">Ser</div>
          </div>
          <div className="ml-4 text-slate-400">
            Example: <span className="font-mono text-cyan-400">3</span> (M car) + <span className="font-mono text-cyan-400">003</span> (trainline 3003) + <span className="font-mono text-cyan-400">1</span> (serial)
          </div>
        </div>
      </div>

      {/* Cross-Connection Alerts */}
      <div className="mb-6 space-y-2">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-red-400">X1 Pins 19/20:</span>
            <span className="text-slate-300 ml-2">3005 ↔ 3006 (Powering 1 & 2 crossed)</span>
            <Link href="/trainlines/3005" className="ml-2 text-red-300 hover:underline text-xs">View</Link>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-400">Jumpers 43-47:</span>
            <span className="text-slate-300 ml-2">6009↔6046, 6014↔6051 (Door open/close crossed)</span>
            <Link href="/trainlines/6009" className="ml-2 text-amber-300 hover:underline text-xs">View</Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search wires..."
            value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          <option value="DMC">DMC</option>
          <option value="TC">TC</option>
          <option value="MC">MC</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Types</option>
          <option value="Control">Control</option>
          <option value="Safety">Safety</option>
          <option value="Fault">Fault</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
          <input type="checkbox" checked={crossOnly} onChange={(e) => setCrossOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-600" />
          Cross-Connected Only
        </label>
      </div>

      {/* Wire Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wire #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Path</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(wire => {
                const isCross = CROSS_CONNECTED.includes(wire.wireNo);
                const { source, dest } = getSourceDest(wire);
                const colorClass = COLOR_CODES[wire.wireColor || 'Blue'] || COLOR_CODES['Blue'];
                const type = wire.wireType || 'Control';
                const typeColor = TYPE_COLORS[type] || TYPE_COLORS['Control'];

                return (
                  <tr key={wire.wireNo} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-lg font-bold ${isCross ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {wire.wireNo}
                        </span>
                        {isCross && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium text-sm">{wire.signalName || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 max-w-xs truncate block">{wire.description || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                        {wire.wireColor || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                        {type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="font-mono">{source || '-'}</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-mono">{dest || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/wires/${wire.wireNo}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
                        Trace <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button onClick={loadMore} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
            Load More
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No wires match your filters</p>
        </div>
      )}
    </div>
  );
}