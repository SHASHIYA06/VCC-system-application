'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D, GlassButton, GlassPanel } from '@/components/ui';
import { Search, Cable, Loader2, Filter } from 'lucide-react';

interface PinData {
  id: string;
  connector_code: string;
  equipment_code: string;
  car_code: string;
  system_code: string;
  pin_no: string;
  signal_name: string;
  wire: string;
  description: string;
}

export default function PinsPage() {
  const [search, setSearch] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('all');
  const [carFilter, setCarFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [pins, setPins] = useState<PinData[]>([]);
  const [connectors, setConnectors] = useState<string[]>([]);
  const [cars, setCars] = useState<string[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPins() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (connectorFilter !== 'all') params.append('connector_code', connectorFilter);
        if (carFilter !== 'all') params.append('car_type', carFilter);
        if (systemFilter !== 'all') params.append('system_code', systemFilter);
        if (search) params.append('search', search);

        const response = await fetch(`/api/pins?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        
        setPins(data.pins || []);
        setConnectors(data.connectors || []);
        setCars(data.cars || []);
        setSystems(data.systems || []);
      } catch (err) {
        setError('Failed to load pins from database');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPins();
  }, [connectorFilter, carFilter, systemFilter, search]);

  const filtered = pins;

  // Get unique values for dropdowns
  const uniqueConnectors = [...new Set(connectors)].sort();
  const uniqueCars = [...new Set(cars)].filter(Boolean).sort();
  const uniqueSystems = [...new Set(systems)].filter(Boolean).sort();

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Pin Directory</h1>
        <p className="mt-2 text-slate-400">
          Complete pin listing across all connectors with signal and wire assignments
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading pins...
            </span>
          ) : (
            <>
              <span>{pins.length} pins defined</span>
              <span>{connectors.length} connectors</span>
              <span>{cars.length} car types</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search pins, signals, wires..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
        <select value={connectorFilter} onChange={(e) => setConnectorFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Connectors</option>
          {uniqueConnectors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={carFilter} onChange={(e) => setCarFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Cars</option>
          {uniqueCars.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300">
          <option value="all">All Systems</option>
          {uniqueSystems.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Pin Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <span className="ml-3 text-slate-400">Loading pins from database...</span>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Connector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Pin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Wire</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.map(pin => (
                <tr key={pin.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/equipment/${pin.equipment_code}`}
                      className="text-sm font-mono text-purple-400 hover:text-purple-300">
                      {pin.equipment_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-cyan-400">{pin.connector_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-lg text-white">{pin.pin_no}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-white">{pin.signal_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/wires/${pin.wire}`}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-sm font-mono hover:bg-cyan-500/20">
                      {pin.wire}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 max-w-xs truncate block">{pin.description}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/trainlines/${pin.wire}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300">
                        Trainline
                      </Link>
                      <span className="text-slate-600">|</span>
                      <Link href={`/pins/${pin.id}`}
                        className="text-xs text-purple-400 hover:text-purple-300">
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No pins match your filters</p>
        </div>
      )}
    </div>
  );
}