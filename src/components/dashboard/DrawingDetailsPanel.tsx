'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cable, Cpu, Box, AlertTriangle, Loader2, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ConnectorPin {
  pinNo: string;
  signalName?: string;
  wireNo?: string;
  conductorClass?: string;
  connectorCode?: string;
}

interface Wire {
  id: string;
  wireNo: string;
  signalName?: string;
  wireColor?: string;
  wireSize?: string;
  cableSpec?: string;
  endpoints: Array<{
    role?: string;
    label?: string;
    device?: string;
    deviceTag?: string;
    connector?: string;
    pin?: string;
  }>;
}

interface Connector {
  id: string;
  code: string;
  type?: string;
  pinCount: number;
  pins: ConnectorPin[];
}

interface Equipment {
  id: string;
  deviceName: string;
  deviceType?: string;
  connectedWires: Array<{
    wireNo: string;
    signalName?: string;
  }>;
  wireCount: number;
}

interface DrawingData {
  drawing: any;
  summary: {
    totalWires: number;
    totalConnectors: number;
    totalEquipment: number;
    totalPins?: number;
  };
  wires: Wire[];
  connectors: Connector[];
  equipment: Equipment[];
  pins?: ConnectorPin[];
}

export function DrawingDetailsPanel({ drawingId }: { drawingId: string }) {
  const [data, setData] = useState<DrawingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    pins: true,
    wires: true,
    connectors: true,
    equipment: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/drawings/${drawingId}?detailed=true`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const detailedData = await response.json();
        console.log('✅ Drawing details loaded:', {
          pins: detailedData.pins?.length || 0,
          wires: detailedData.wires?.length || 0,
          connectors: detailedData.connectors?.length || 0,
          equipment: detailedData.equipment?.length || 0,
        });
        setData(detailedData);
        setError(null);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load drawing details';
        setError(errMsg);
        console.error('❌ Error fetching drawing details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (drawingId) {
      fetchData();
    }
  }, [drawingId]);

  if (loading) {
    return (
      <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        <span className="text-sm text-white/70">Loading drawing details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/30 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
        <span className="text-sm text-red-300">{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Calculate coverage statistics
  const pinsCovered = data.pins?.filter(p => p.wireNo)?.length || 0;
  const pinsTotal = data.pins?.length || 0;
  const pinsCoverage = pinsTotal > 0 ? Math.round((pinsCovered / pinsTotal) * 100) : 0;

  const wiresCovered = data.wires?.filter(w => w.endpoints?.length > 0)?.length || 0;
  const wiresTotal = data.wires?.length || 0;
  const wiresCoverage = wiresTotal > 0 ? Math.round((wiresCovered / wiresTotal) * 100) : 0;

  return (
    <div className="mt-8 pt-6 border-t border-accent-500/20 space-y-6">
      {/* PIN ASSIGNMENTS SECTION - CRITICAL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-premium backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('pins')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={`h-5 w-5 ${pinsCoverage === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
              {pinsCoverage === 100 ? <CheckCircle /> : <AlertCircle />}
            </div>
            <div className="text-left">
              <h3 className="font-bold text-white uppercase tracking-wider">Pin Assignments</h3>
              <p className="text-xs text-white/60">{pinsCovered}/{pinsTotal} pins assigned to wires ({pinsCoverage}%)</p>
            </div>
          </div>
          {expandedSections.pins ? (
            <ChevronUp className="h-5 w-5 text-yellow-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/60" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.pins && data.pins && data.pins.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Connector</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Pin</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Signal</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Wire #</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pins.slice(0, 30).map((pin, idx) => (
                      <tr key={idx} className={`border-b border-white/5 transition-colors ${pin.wireNo ? 'hover:bg-green-500/10' : 'hover:bg-red-500/10'}`}>
                        <td className="py-2 px-3 text-purple-400 font-bold">{pin.connectorCode || '—'}</td>
                        <td className="py-2 px-3 text-cyan-400 font-bold">{pin.pinNo}</td>
                        <td className="py-2 px-3 text-white/90">{pin.signalName || '—'}</td>
                        <td className="py-2 px-3">
                          {pin.wireNo ? (
                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs font-bold">{pin.wireNo}</span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs font-bold">UNASSIGNED</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-white/70 text-xs">{pin.conductorClass || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.pins.length > 30 && (
                  <div className="text-center py-3 border-t border-white/10 text-xs text-white/60">
                    +{data.pins.length - 30} more pins...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* WIRES SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card-premium backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('wires')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            <Cable className="h-5 w-5 text-cyan-400" />
            <div className="text-left">
              <h3 className="font-bold text-white uppercase tracking-wider">Wires</h3>
              <p className="text-xs text-white/60">{wiresCovered}/{wiresTotal} wires with endpoints ({wiresCoverage}%)</p>
            </div>
          </div>
          {expandedSections.wires ? (
            <ChevronUp className="h-5 w-5 text-cyan-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/60" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.wires && data.wires.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Wire No.</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Signal</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Color</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">From</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.wires.slice(0, 20).map((wire, idx) => {
                      const source = wire.endpoints?.[0];
                      const dest = wire.endpoints?.[wire.endpoints.length - 1];
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3 text-cyan-400 font-bold">{wire.wireNo}</td>
                          <td className="py-2 px-3 text-white/90">{wire.signalName || '—'}</td>
                          <td className="py-2 px-3">
                            {wire.wireColor && (
                              <span className="px-2 py-1 rounded bg-gradient-accent text-white text-xs font-bold">{wire.wireColor}</span>
                            )}
                            {!wire.wireColor && <span className="text-white/50">—</span>}
                          </td>
                          <td className="py-2 px-3 text-white/70 text-xs">
                            {source ? `${source.device || source.connector || '?'}${source.pin ? ':' + source.pin : ''}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-white/70 text-xs">
                            {dest ? `${dest.device || dest.connector || '?'}${dest.pin ? ':' + dest.pin : ''}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {data.wires.length > 20 && (
                  <div className="text-center py-3 border-t border-white/10 text-xs text-white/60">
                    +{data.wires.length - 20} more wires...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CONNECTORS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-premium backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('connectors')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-purple-400" />
            <div className="text-left">
              <h3 className="font-bold text-white uppercase tracking-wider">Connectors</h3>
              <p className="text-xs text-white/60">{data.summary.totalConnectors} connectors with {data.summary.totalPins || 0} pins total</p>
            </div>
          </div>
          {expandedSections.connectors ? (
            <ChevronUp className="h-5 w-5 text-purple-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/60" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.connectors && data.connectors.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 space-y-4">
                {data.connectors.slice(0, 10).map((connector, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white text-sm uppercase font-mono">{connector.code}</h4>
                      <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded font-bold">{connector.pins.length}/{connector.pinCount} pins</span>
                    </div>
                    {connector.pins.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        {connector.pins.slice(0, 12).map((pin, pidx) => (
                          <div key={pidx} className={`p-2 rounded border ${pin.wireNo ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900/60 border-white/10'}`}>
                            <div className={`font-mono font-bold ${pin.wireNo ? 'text-green-400' : 'text-cyan-400'}`}>{pin.pinNo}</div>
                            <div className="text-white/70 text-[9px] line-clamp-1">{pin.signalName || '—'}</div>
                            {pin.wireNo && <div className="text-green-300 font-mono text-[9px] font-bold">{pin.wireNo}</div>}
                          </div>
                        ))}
                        {connector.pins.length > 12 && (
                          <div className="p-2 bg-slate-900/60 rounded border border-white/10 flex items-center justify-center">
                            <span className="text-white/50 text-[9px] font-bold">+{connector.pins.length - 12}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-white/50">No pins defined</div>
                    )}
                  </div>
                ))}
                {data.connectors.length > 10 && (
                  <div className="text-center py-3 text-xs text-white/60">
                    +{data.connectors.length - 10} more connectors...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* EQUIPMENT SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card-premium backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('equipment')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Box className="h-5 w-5 text-green-400" />
            <div className="text-left">
              <h3 className="font-bold text-white uppercase tracking-wider">Equipment</h3>
              <p className="text-xs text-white/60">{data.summary.totalEquipment} devices connected</p>
            </div>
          </div>
          {expandedSections.equipment ? (
            <ChevronUp className="h-5 w-5 text-green-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-white/60" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.equipment && data.equipment.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 space-y-3">
                {data.equipment.slice(0, 15).map((eq, idx) => (
                  <div key={idx} className="glass-card p-3 rounded-lg border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{eq.deviceName}</h4>
                        <p className="text-xs text-white/60">{eq.deviceType || 'Device'}</p>
                      </div>
                      <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded font-mono font-bold">
                        {eq.wireCount} wires
                      </span>
                    </div>
                    {eq.connectedWires.length > 0 && (
                      <div className="text-xs text-white/70 space-y-1 pt-2 border-t border-white/10">
                        {eq.connectedWires.slice(0, 3).map((conn, cidx) => (
                          <div key={cidx} className="flex items-center gap-2 font-mono">
                            <span className="text-green-400 font-bold">{conn.wireNo}</span>
                            <span className="text-white/50">→</span>
                            <span className="text-white/70 text-[11px]">{conn.signalName || 'Signal'}</span>
                          </div>
                        ))}
                        {eq.connectedWires.length > 3 && (
                          <p className="text-white/50">+{eq.connectedWires.length - 3} more</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {data.equipment.length > 15 && (
                  <div className="text-center py-3 text-xs text-white/60">
                    +{data.equipment.length - 15} more equipment...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
