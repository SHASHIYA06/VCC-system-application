'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cable, Search, ArrowRight, ChevronDown, Box, Cpu, RefreshCw } from 'lucide-react';

const FALLBACK_CONNECTORS = [
  { id: 'cn-v1-1', connectorCode: 'V1-CN1', connectorType: 'VVVF', pinCount: 20, description: 'VVVF main connector - propulsion commands', equipmentCode: 'V1', equipmentName: 'VVVF Inverter 1', carCode: 'DMC', systemCode: 'TRAC', drawing: '942-58120',
    pins: [
      { pinNo: '12', signalName: 'FORWARD_CMD', wireNo: '3003', endpointLabel: 'Forward command' },
      { pinNo: '13', signalName: 'REVERSE_CMD', wireNo: '3004', endpointLabel: 'Reverse command' },
      { pinNo: '14', signalName: 'POWERING_1', wireNo: '3005', endpointLabel: 'Powering level 1 (X1-19)' },
      { pinNo: '15', signalName: 'POWERING_2', wireNo: '3006', endpointLabel: 'Powering level 2 (X1-20)' },
      { pinNo: '16', signalName: 'BRAKE_CMD', wireNo: '3010', endpointLabel: 'Braking command' },
    ]
  },
  { id: 'cn-rio1-1', connectorCode: 'TCMS_RIO1-CN1', connectorType: 'TCMS_RIO', pinCount: 40, description: 'TCMS RIO main connector - all digital I/O', equipmentCode: 'TCMS_RIO1', equipmentName: 'TCMS Remote IO Unit 1', carCode: 'MC', systemCode: 'TMS', drawing: '942-38610',
    pins: [
      { pinNo: 'J7', signalName: 'DOOR_OPEN_L', wireNo: '6009', endpointLabel: 'Left door open' },
      { pinNo: 'J8', signalName: 'DOOR_OPEN_R', wireNo: '6046', endpointLabel: 'Right door open' },
      { pinNo: 'J9', signalName: 'DOOR_CLOSE_L', wireNo: '6014', endpointLabel: 'Left door close' },
      { pinNo: 'J10', signalName: 'DOOR_CLOSE_R', wireNo: '6051', endpointLabel: 'Right door close' },
      { pinNo: 'K4', signalName: 'PB_APPLIED', wireNo: '4122', endpointLabel: 'Parking brake applied' },
    ]
  },
  { id: 'cn-rio2-1', connectorCode: 'TCMS_RIO2-CN1', connectorType: 'TCMS_RIO', pinCount: 40, description: 'TCMS RIO2 connector - APS and battery monitoring', equipmentCode: 'TCMS_RIO2', equipmentName: 'TCMS Remote IO Unit 2', carCode: 'TC', systemCode: 'TMS', drawing: '942-38409',
    pins: [
      { pinNo: 'F2', signalName: 'CAB_VAC_FAULT', wireNo: '7001', endpointLabel: 'Cab VAC fault' },
      { pinNo: 'G3', signalName: 'APS_FAULT', wireNo: '1215', endpointLabel: 'APS fault' },
      { pinNo: 'G4', signalName: 'BAT_UNDER_VOLT', wireNo: '5064', endpointLabel: 'Battery under-voltage' },
    ]
  },
  { id: 'cn-dcu1-1', connectorCode: 'DCU1-CN1', connectorType: 'DOOR', pinCount: 16, description: 'Door control unit main connector', equipmentCode: 'DCU1', equipmentName: 'Door Control Unit 1', carCode: 'MC', systemCode: 'DOOR', drawing: '942-58138',
    pins: [
      { pinNo: '3', signalName: 'DOOR_OPEN_L', wireNo: '6009', endpointLabel: 'Left door open command' },
      { pinNo: '4', signalName: 'DOOR_OPEN_R', wireNo: '6046', endpointLabel: 'Right door open command' },
      { pinNo: '5', signalName: 'DOOR_CLOSE_L', wireNo: '6014', endpointLabel: 'Left door close command' },
      { pinNo: '6', signalName: 'DOOR_CLOSE_R', wireNo: '6051', endpointLabel: 'Right door close command' },
    ]
  },
  { id: 'cn-aps1-1', connectorCode: 'APS1-CN1', connectorType: 'APS', pinCount: 24, description: 'APS main power connector', equipmentCode: 'APS1', equipmentName: 'Auxiliary Power Supply', carCode: 'TC', systemCode: 'APS', drawing: '942-58130',
    pins: [
      { pinNo: '1', signalName: 'AUX_ON', wireNo: '1040', endpointLabel: 'Auxiliary on command' },
      { pinNo: '2', signalName: 'SHUTDOWN', wireNo: '1050', endpointLabel: 'Shutdown command' },
      { pinNo: '5', signalName: 'AUX_FAULT', wireNo: '1215', endpointLabel: 'Auxiliary fault output' },
    ]
  },
  { id: 'cn-x1-dmc', connectorCode: 'X1', connectorType: 'INTERCAR', pinCount: 74, description: '74-pin inter-car control jumper - all control signals', equipmentCode: 'LTEB1', equipmentName: 'Low Tension Equipment Box', carCode: 'DMC', systemCode: 'TRL', drawing: '942-38409',
    pins: [
      { pinNo: '17', signalName: 'FORWARD', wireNo: '3003', endpointLabel: 'Forward command' },
      { pinNo: '18', signalName: 'REVERSE', wireNo: '3004', endpointLabel: 'Reverse command' },
      { pinNo: '19', signalName: 'POWERING_1', wireNo: '3005', endpointLabel: 'Powering 1 (CROSSED with 20)' },
      { pinNo: '20', signalName: 'POWERING_2', wireNo: '3006', endpointLabel: 'Powering 2 (CROSSED with 19)' },
    ]
  },
];

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
};

const CAR_COLORS: Record<string, { color: string; bg: string }> = {
  DMC: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  TC: { color: 'text-green-400', bg: 'bg-green-500/20' },
  MC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

interface ConnectorData {
  id: string;
  connectorCode: string;
  connectorType: string | null;
  pinCount?: number;
  description?: string;
  deviceId?: string | null;
  equipmentCode?: string;
  equipmentName?: string;
  carCode?: string;
  systemCode?: string;
  drawing?: string;
  pins?: Array<{
    pinNo: string;
    signalName: string | null;
    wireNo: string | null;
    endpointLabel: string | null;
  }>;
}

export default function ConnectorsPage() {
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConnectors() {
      try {
        const response = await fetch('/api/connectors');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        const mapped = (data.connectors || []).map((c: any) => ({
          id: c.id,
          connectorCode: c.connectorCode,
          connectorType: c.connectorType,
          pinCount: c.pins?.length || 0,
          description: `${c.connectorCode} connector`,
          deviceId: c.deviceId,
          equipmentCode: c.device?.name || '',
          equipmentName: c.device?.name || '',
          carCode: c.device?.carType || '',
          systemCode: c.device?.system?.code || '',
          drawing: '',
          pins: c.pins?.map((p: any) => ({
            pinNo: p.pinNo,
            signalName: p.signalName,
            wireNo: p.wireNo,
            endpointLabel: p.endpointLabel,
          })) || [],
        }));
        
        if (mapped.length > 0) {
          setConnectors(mapped);
        } else {
          setConnectors(FALLBACK_CONNECTORS);
          setError('Using offline data - database may be unavailable');
        }
      } catch (err) {
        console.error('Connector fetch error:', err);
        setConnectors(FALLBACK_CONNECTORS);
        setError('Using offline data - database may be unavailable');
      } finally {
        setLoading(false);
      }
    }
    fetchConnectors();
  }, []);

  const filtered = connectors.filter(cn => {
    const matchSearch = search === '' ||
      cn.connectorCode.toLowerCase().includes(search.toLowerCase()) ||
      (cn.equipmentCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (cn.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCar = carFilter === 'all' || cn.carCode === carFilter;
    const matchSystem = systemFilter === 'all' || cn.systemCode === systemFilter;
    return matchSearch && matchCar && matchSystem;
  });

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Connector Library</h1>
        <p className="mt-2 text-slate-400">
          All connectors, inter-car jumpers, and pin assignments
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          <span>{connectors.length} connectors</span>
          <span>4 jumper types (X1-X4)</span>
          <span>DMC, TC, MC</span>
        </div>
        {error && (
          <div className="mt-2 text-amber-400 text-sm">{error}</div>
        )}
      </div>

      {/* Jumper Quick Reference */}
      <div className="mb-6 glass-card p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Inter-car Jumper Quick Reference</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="text-sm font-mono text-blue-400 font-bold">X1 (74P)</div>
            <div className="text-xs text-slate-400 mt-1">Control signals + trainlines</div>
            <div className="text-xs text-slate-500 mt-1">Pins 17-20 = propulsion</div>
            <div className="text-xs text-amber-400 mt-1">Pins 19/20 = CROSSED</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
            <div className="text-sm font-mono text-slate-400 font-bold">X2 (74PW)</div>
            <div className="text-xs text-slate-400 mt-1">Control + power combined</div>
            <div className="text-xs text-slate-500 mt-1">Same pinout as X1</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="text-sm font-mono text-amber-400 font-bold">X3 (11P)</div>
            <div className="text-xs text-slate-400 mt-1">415V AC power</div>
            <div className="text-xs text-slate-500 mt-1">3-phase AC distribution</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="text-sm font-mono text-red-400 font-bold">X4 (3P)</div>
            <div className="text-xs text-slate-400 mt-1">110V DC power</div>
            <div className="text-xs text-slate-500 mt-1">Battery/main power</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search connectors..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Cars</option>
          <option value="DMC">DMC</option>
          <option value="TC">TC</option>
          <option value="MC">MC</option>
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          <option value="TRAC">Traction</option>
          <option value="TMS">TCMS</option>
          <option value="DOOR">Door</option>
          <option value="APS">APS</option>
          <option value="TRL">Trainlines</option>
        </select>
      </div>

      {/* Connector List */}
      <div className="space-y-3">
        {filtered.map(cn => {
          const sysInfo = SYSTEM_COLORS[cn.systemCode || 'TRL'] || SYSTEM_COLORS['TRL'];
          const carInfo = CAR_COLORS[cn.carCode || 'DMC'] || CAR_COLORS['DMC'];
          const isExpanded = expandedId === cn.id;

          return (
            <div key={cn.id} className="glass-card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : cn.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-400 font-bold text-lg">{cn.connectorCode}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cn.connectorType === 'INTERCAR' ? 'bg-blue-500/20 text-blue-400' : cn.connectorType === 'POWER' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {cn.connectorType || 'Standard'}
                    </span>
                    {cn.carCode && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${carInfo.color} ${carInfo.bg}`}>
                        {cn.carCode}
                      </span>
                    )}
                    {cn.systemCode && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sysInfo.color} ${sysInfo.bg}`}>
                        {cn.systemCode}
                      </span>
                    )}
                    {cn.pinCount && cn.pinCount > 0 && (
                      <span className="text-xs text-slate-500">{cn.pinCount}P</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400 truncate">{cn.description || 'Connector'}</p>
                  {cn.equipmentCode && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {cn.equipmentCode} {cn.drawing && ` - Drawing: ${cn.drawing}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{cn.pins?.length || 0} pins</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && cn.pins && cn.pins.length > 0 && (
                <div className="border-t border-slate-700/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Pin</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Signal</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Wire</th>
                        <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500">Description</th>
                        <th className="px-5 py-2 right text-xs font-semibold text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {cn.pins.map((pin, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="px-5 py-2">
                            <span className="font-mono font-bold text-cyan-400">{pin.pinNo}</span>
                          </td>
                          <td className="px-5 py-2">
                            <span className="text-sm text-white font-medium">{pin.signalName || '-'}</span>
                          </td>
                          <td className="px-5 py-2">
                            {pin.wireNo ? (
                              <Link href={`/wires/${pin.wireNo}`}
                                className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20">
                                {pin.wireNo}
                              </Link>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                          <td className="px-5 py-2">
                            <span className="text-xs text-slate-400">{pin.endpointLabel || '-'}</span>
                          </td>
                          <td className="px-5 py-2 text-right">
                            {pin.wireNo && (
                              <Link href={`/trainlines/${pin.wireNo}`}
                                className="text-xs text-cyan-400 hover:text-cyan-300">
                                Trainline
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No connectors match your filters</p>
        </div>
      )}
    </div>
  );
}