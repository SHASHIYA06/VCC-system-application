'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, GlassPanel } from '@/components/ui';
import { Cable, Search, ArrowRight, ChevronDown, Box, Cpu, RefreshCw, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';

const SYSTEM_COLORS: Record<string, { color: string; bg: string }> = {
  TRAC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  BRAKE: { color: 'text-red-400', bg: 'bg-red-500/20' },
  TMS: { color: 'text-purple-400', bg: 'bg-purple-500/20' },
  DOOR: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
  VAC: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  APS: { color: 'text-green-400', bg: 'bg-green-500/20' },
  TRL: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  GEN: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
  CAB: { color: 'text-violet-400', bg: 'bg-violet-500/20' },
};

const CAR_COLORS: Record<string, { color: string; bg: string }> = {
  DMC: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  TC: { color: 'text-green-400', bg: 'bg-green-500/20' },
  MC: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  ALL: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

interface PinData {
  pinNo: string;
  pinLabel?: string | null;
  wireNo?: string | null;
  signalName?: string | null;
  conductorClassCode?: string | null;
  voltageText?: string | null;
  terminalFrom?: string | null;
  terminalTo?: string | null;
  note?: string | null;
  endpointLabel?: string | null;
}

interface ConnectorData {
  id: string;
  connectorCode: string;
  connectorType: string | null;
  pinCount?: number;
  description?: string;
  carType?: string | null;
  systemCode?: string;
  drawingNo?: string;
  system?: { code: string; name: string } | null;
  drawing?: { id: string; drawingNo: string; title: string; revision: string } | null;
  pins: PinData[];
  _count?: { pins: number; wireEndpoints: number };
}

export default function ConnectorsPage() {
  const [search, setSearch] = useState('');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [connectors, setConnectors] = useState<ConnectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchConnectors() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (systemFilter !== 'all') params.set('system_code', systemFilter);
        if (carFilter !== 'all') params.set('car_type', carFilter);
        if (search) params.set('connector_code', search);
        params.set('limit', '1000');

        const response = await fetch(`/api/connectors?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        const mapped: ConnectorData[] = (data.connectors || []).map((c: any) => ({
          id: c.id,
          connectorCode: c.connectorCode,
          connectorType: c.connectorType,
          pinCount: c.pinCount || c._count?.pins || 0,
          description: c.description || `${c.connectorCode} connector`,
          carType: c.carType,
          systemCode: c.system?.code || '',
          system: c.system || null,
          drawing: c.drawing || null,
          drawingNo: c.drawing?.drawingNo || '',
          pins: (c.pins || []).map((p: any) => ({
            pinNo: p.pinNo,
            pinLabel: p.pinLabel,
            wireNo: p.wireNo,
            signalName: p.signalName,
            conductorClassCode: p.conductorClassCode,
            voltageText: p.voltageText,
            terminalFrom: p.terminalFrom,
            terminalTo: p.terminalTo,
            note: p.note,
            endpointLabel: p.endpointLabel || `${c.connectorCode}:${p.pinNo} - ${p.signalName || 'N/A'}`,
            wireEndpoint: p.wireEndpoint || null,
          })),
          _count: c._count,
        }));
        
        setTotalCount(data.pagination?.total || data.total || data.count || 0);
        
        if (mapped.length > 0) {
          setConnectors(mapped);
          setError(null);
        } else {
          setConnectors([]);
          setError('No connectors found in database.');
        }
      } catch (err) {
        console.error('Connector fetch error:', err);
        setConnectors([]);
        setError('Database unavailable - check connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchConnectors();
  }, [carFilter, systemFilter]);

  const filtered = connectors.filter(cn => {
    const matchSearch = search === '' ||
      cn.connectorCode.toLowerCase().includes(search.toLowerCase()) ||
      (cn.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (cn.drawingNo || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
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
          <span className="text-cyan-400 font-bold">{totalCount > 0 ? totalCount : connectors.length} connectors in database</span>
          <span>4 jumper types (X1-X4)</span>
          <span>DMC, TC, MC</span>
        </div>
        {error && (
          <div className="mt-2 text-amber-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
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
          <option value="ALL">ALL</option>
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          <option value="TRAC">Traction</option>
          <option value="TMS">TCMS</option>
          <option value="DOOR">Door</option>
          <option value="APS">APS</option>
          <option value="TRL">Trainlines</option>
          <option value="CAB">Cab</option>
          <option value="BRAKE">Brake</option>
        </select>
      </div>

      {/* Connector List */}
      <div className="space-y-3">
        {filtered.map(cn => {
          const sysInfo = SYSTEM_COLORS[cn.systemCode || cn.system?.code || 'GEN'] || SYSTEM_COLORS['GEN'];
          const carInfo = CAR_COLORS[cn.carType || 'ALL'] || CAR_COLORS['ALL'];
          const isExpanded = expandedId === cn.id;

          return (
            <div key={cn.id} className="glass-card overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : cn.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link href={`/connectors/${encodeURIComponent(cn.connectorCode)}`} className="font-mono text-cyan-400 font-bold text-lg hover:text-cyan-300">
                      {cn.connectorCode}
                    </Link>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cn.connectorType === 'INTERCAR' ? 'bg-blue-500/20 text-blue-400' : cn.connectorType === 'POWER' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {cn.connectorType || 'Standard'}
                    </span>
                    {cn.carType && cn.carType !== 'ALL' && (
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${carInfo.color} ${carInfo.bg}`}>
                        {cn.carType}
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
                  {cn.drawingNo && (
                    <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-2">
                      <span>Drawing: {cn.drawingNo}</span>
                      {cn.drawing?.id && (
                        <Link href={`/drawings/${cn.drawing.id}`} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                          View <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
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
                        <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500">Action</th>
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
                              <Link href={`/wires?wire=${encodeURIComponent(pin.wireNo)}`}
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
                              <Link href={`/trainlines?wire=${encodeURIComponent(pin.wireNo)}`}
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