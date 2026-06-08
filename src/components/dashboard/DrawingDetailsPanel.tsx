'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cable, Cpu, Box, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface Wire {
  id: string;
  wireNo: string;
  signalName: string;
  wireColor: string;
  source: { device: string; connector: string; pin: string } | null;
  destination: { device: string; connector: string; pin: string } | null;
}

interface Connector {
  id: string;
  code: string;
  pinCount: number;
  pins: Array<{
    pinNo: string;
    signalName: string;
    wireNo: string;
  }>;
}

interface Equipment {
  id: string;
  deviceName: string;
  deviceType: string;
  wireCount: number;
  wireConnections: Array<{
    wireNo: string;
    signalName: string;
    connectedAt: { connector: string; pin: string };
  }>;
}

interface DrawingData {
  drawing: any;
  summary: {
    totalWires: number;
    totalConnectors: number;
    totalEquipment: number;
  };
  wires: Wire[];
  connectors: Connector[];
  equipment: Equipment[];
}

export function DrawingDetailsPanel({ drawingId }: { drawingId: string }) {
  const [data, setData] = useState<DrawingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    wires: true,
    connectors: true,
    equipment: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/drawings/${drawingId}`);
        const detailedData = await response.json();
        setData(detailedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load drawing details');
        console.error('Error fetching drawing details:', err);
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

  return (
    <div className="mt-8 pt-6 border-t border-accent-500/20 space-y-6">
      {/* Wires Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-premium backdrop-blur-xl border border-glass-border rounded-2xl overflow-hidden"
      >
        <button
          onClick={() => toggleSection('wires')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-accent-500/10 to-purple-500/10 hover:from-accent-500/20 hover:to-purple-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Cable className="h-5 w-5 text-accent-400" />
            <div className="text-left">
              <h3 className="font-bold text-white uppercase tracking-wider">Wires</h3>
              <p className="text-xs text-white/60">{data.summary.totalWires} wires connected</p>
            </div>
          </div>
          {expandedSections.wires ? (
            <ChevronUp className="h-5 w-5 text-accent-400" />
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
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Source</th>
                      <th className="text-left text-white/80 py-2 px-3 font-bold text-xs uppercase">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.wires.slice(0, 20).map((wire, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 text-accent-400 font-bold">{wire.wireNo}</td>
                        <td className="py-2 px-3 text-white/90">{wire.signalName || '—'}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-1 rounded bg-gradient-accent text-white text-xs font-bold">{wire.wireColor || '—'}</span>
                        </td>
                        <td className="py-2 px-3 text-white/70 text-xs">
                          {wire.source ? `${wire.source.device} @ ${wire.source.connector}:${wire.source.pin}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-white/70 text-xs">
                          {wire.destination ? `${wire.destination.device} @ ${wire.destination.connector}:${wire.destination.pin}` : '—'}
                        </td>
                      </tr>
                    ))}
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

      {/* Connectors Section */}
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
              <p className="text-xs text-white/60">{data.summary.totalConnectors} connectors with pinouts</p>
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
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-white text-sm uppercase font-mono">{connector.code}</h4>
                      <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">{connector.pinCount} pins</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {connector.pins.slice(0, 8).map((pin, pidx) => (
                        <div key={pidx} className="p-2 bg-slate-900/60 rounded border border-white/10">
                          <div className="font-mono text-accent-400 font-bold">{pin.pinNo}</div>
                          <div className="text-white/70 text-[10px] line-clamp-1">{pin.signalName || '—'}</div>
                          {pin.wireNo && <div className="text-cyan-400 font-mono text-[10px]">{pin.wireNo}</div>}
                        </div>
                      ))}
                      {connector.pins.length > 8 && (
                        <div className="p-2 bg-slate-900/60 rounded border border-white/10 flex items-center justify-center">
                          <span className="text-white/50 text-[10px]">+{connector.pins.length - 8}</span>
                        </div>
                      )}
                    </div>
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

      {/* Equipment Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
              <p className="text-xs text-white/60">{data.summary.totalEquipment} devices with wire connections</p>
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
                        <p className="text-xs text-white/60">{eq.deviceType}</p>
                      </div>
                      <span className="text-xs bg-green-500/30 text-green-300 px-2 py-1 rounded font-mono">
                        {eq.wireCount} wires
                      </span>
                    </div>
                    {eq.wireConnections.length > 0 && (
                      <div className="text-xs text-white/70 space-y-1 pt-2 border-t border-white/10">
                        {eq.wireConnections.slice(0, 3).map((conn, cidx) => (
                          <div key={cidx} className="flex items-center gap-2 font-mono">
                            <span className="text-cyan-400">{conn.wireNo}</span>
                            <span className="text-white/50">→</span>
                            <span className="text-purple-400">{conn.connectedAt.connector}:{conn.connectedAt.pin}</span>
                          </div>
                        ))}
                        {eq.wireConnections.length > 3 && (
                          <p className="text-white/50">+{eq.wireConnections.length - 3} more connections</p>
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
