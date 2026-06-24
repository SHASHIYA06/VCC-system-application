'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronRight, ChevronDown, Train, Layers, Box, Cpu, MapPin, Cable,
  FileText, Loader2, RefreshCw, Search, Zap, Activity, Shield,
  DoorOpen, Wind, Radio, Battery, Settings, Lightbulb,
} from 'lucide-react';

// Types
interface Formation { id: string; code: string; name: string; carCount: number; project: string; cars: CarSummary[]; }
interface CarSummary { id: string; carCode: string; carType: string; carPosition: number; carLabel: string | null; }
interface SystemSummary { id: string; code: string; name: string; category: string | null; deviceCount: number; drawingCount: number; subsystemCount: number; }
interface DeviceSummary { id: string; deviceName: string; deviceType: string | null; tagNo: string | null; carType: string | null; _count: { wireEndpoints: number }; }
interface ConnectorSummary { id: string; connectorCode: string; description: string | null; carType: string | null; pinCount: number | null; _count: { pins: number; wireEndpoints: number }; }
interface PinSummary { id: string; pinNo: string; pinLabel: string | null; wireNo: string | null; signalName: string | null; conductorClassCode: string | null; voltageText: string | null; }

// System icon map
const SYSTEM_ICONS: Record<string, any> = {
  TRAC: Zap, BRAKE: Shield, DOOR: DoorOpen, VAC: Wind, APS: Battery,
  COMMS: Radio, TMS: Cpu, HV: Activity, LIGHT: Lightbulb, GEN: Settings,
  TRL: Train, CAB: Settings, BOGIE: Box,
};
const SYSTEM_COLORS: Record<string, string> = {
  TRAC: 'text-orange-400', BRAKE: 'text-red-400', DOOR: 'text-amber-400',
  VAC: 'text-cyan-400', APS: 'text-green-400', COMMS: 'text-emerald-400',
  TMS: 'text-purple-400', HV: 'text-rose-400', LIGHT: 'text-yellow-400',
  GEN: 'text-slate-400', TRL: 'text-blue-400', CAB: 'text-indigo-400',
  BOGIE: 'text-stone-400',
};

export default function GSDExplorePage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [systems, setSystems] = useState<SystemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Expanded state tracking
  const [expandedFormations, setExpandedFormations] = useState<Set<string>>(new Set());
  const [expandedCars, setExpandedCars] = useState<Set<string>>(new Set());
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [expandedConnectors, setExpandedConnectors] = useState<Set<string>>(new Set());

  // Loaded child data
  const [systemDevices, setSystemDevices] = useState<Record<string, DeviceSummary[]>>({});
  const [systemConnectors, setSystemConnectors] = useState<Record<string, ConnectorSummary[]>>({});
  const [connectorPins, setConnectorPins] = useState<Record<string, PinSummary[]>>({});
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const [formRes, sysRes] = await Promise.all([
          fetch('/api/twin/hierarchy?level=formation'),
          fetch('/api/twin/hierarchy?level=system'),
        ]);
        const formData = await formRes.json();
        const sysData = await sysRes.json();
        if (formData.success) setFormations(formData.data);
        if (sysData.success) setSystems(sysData.data);
      } catch (err) {
        console.error('Failed to load hierarchy:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleFormation = (id: string) => {
    setExpandedFormations(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleCar = (id: string) => {
    setExpandedCars(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSystem = useCallback(async (systemId: string) => {
    const isExpanded = expandedSystems.has(systemId);
    setExpandedSystems(prev => {
      const next = new Set(prev);
      isExpanded ? next.delete(systemId) : next.add(systemId);
      return next;
    });

    if (!isExpanded && !systemDevices[systemId]) {
      setLoadingNodes(prev => new Set(prev).add(systemId));
      try {
        const res = await fetch(`/api/twin/hierarchy?level=system&parentId=${systemId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSystemDevices(prev => ({ ...prev, [systemId]: data.data.devices || [] }));
        }
      } catch (err) { console.error(err); }
      finally { setLoadingNodes(prev => { const n = new Set(prev); n.delete(systemId); return n; }); }
    }
  }, [expandedSystems, systemDevices]);

  const toggleDevice = useCallback(async (deviceId: string) => {
    const isExpanded = expandedDevices.has(deviceId);
    setExpandedDevices(prev => {
      const next = new Set(prev);
      isExpanded ? next.delete(deviceId) : next.add(deviceId);
      return next;
    });
  }, [expandedDevices]);

  const toggleConnector = useCallback(async (connectorId: string) => {
    const isExpanded = expandedConnectors.has(connectorId);
    setExpandedConnectors(prev => {
      const next = new Set(prev);
      isExpanded ? next.delete(connectorId) : next.add(connectorId);
      return next;
    });

    if (!isExpanded && !connectorPins[connectorId]) {
      setLoadingNodes(prev => new Set(prev).add(connectorId));
      try {
        const res = await fetch(`/api/twin/hierarchy?level=connector&parentId=${connectorId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setConnectorPins(prev => ({ ...prev, [connectorId]: data.data.pins || [] }));
        }
      } catch (err) { console.error(err); }
      finally { setLoadingNodes(prev => { const n = new Set(prev); n.delete(connectorId); return n; }); }
    }
  }, [expandedConnectors, connectorPins]);

  const filteredSystems = systems.filter(s =>
    !search || s.code.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">GSD Topology Explorer</h1>
          <p className="text-slate-400 mt-1">Navigate the complete train hierarchy — expand any node to drill down</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter systems..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Tree */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-1">

          {/* Formation Level */}
          {formations.map(formation => (
            <div key={formation.id}>
              <TreeNode
                icon={<Train className="h-4 w-4 text-blue-400" />}
                label={`${formation.name} (${formation.code})`}
                badge={`${formation.carCount} cars`}
                expanded={expandedFormations.has(formation.id)}
                onToggle={() => toggleFormation(formation.id)}
                depth={0}
              />

              {expandedFormations.has(formation.id) && formation.cars.map(car => (
                <div key={car.id}>
                  <TreeNode
                    icon={<Box className="h-4 w-4 text-purple-400" />}
                    label={`${car.carCode} — ${car.carType}`}
                    badge={car.carLabel || `Pos ${car.carPosition}`}
                    expanded={expandedCars.has(car.id)}
                    onToggle={() => toggleCar(car.id)}
                    depth={1}
                    href={`/cars/${car.carType}`}
                  />

                  {expandedCars.has(car.id) && (
                    <div className="ml-8 pl-4 border-l border-slate-700/50">
                      <p className="text-xs text-slate-500 py-1 pl-6">Systems installed on this car:</p>
                      {filteredSystems.map(sys => (
                        <SystemTreeNode
                          key={`${car.id}-${sys.id}`}
                          system={sys}
                          expanded={expandedSystems.has(sys.id)}
                          onToggle={() => toggleSystem(sys.id)}
                          devices={systemDevices[sys.id]}
                          expandedDevices={expandedDevices}
                          onToggleDevice={toggleDevice}
                          expandedConnectors={expandedConnectors}
                          onToggleConnector={toggleConnector}
                          connectorPins={connectorPins}
                          loadingNodes={loadingNodes}
                          depth={2}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Also show all systems at root level for direct access */}
          {formations.length === 0 && (
            <>
              <p className="text-sm text-slate-400 mb-2 px-2">All Systems:</p>
              {filteredSystems.map(sys => (
                <SystemTreeNode
                  key={sys.id}
                  system={sys}
                  expanded={expandedSystems.has(sys.id)}
                  onToggle={() => toggleSystem(sys.id)}
                  devices={systemDevices[sys.id]}
                  expandedDevices={expandedDevices}
                  onToggleDevice={toggleDevice}
                  expandedConnectors={expandedConnectors}
                  onToggleConnector={toggleConnector}
                  connectorPins={connectorPins}
                  loadingNodes={loadingNodes}
                  depth={0}
                />
              ))}
            </>
          )}

          {/* Direct Systems access below formations */}
          {formations.length > 0 && (
            <>
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">All Systems (Direct Access)</p>
              </div>
              {filteredSystems.map(sys => (
                <SystemTreeNode
                  key={`direct-${sys.id}`}
                  system={sys}
                  expanded={expandedSystems.has(sys.id)}
                  onToggle={() => toggleSystem(sys.id)}
                  devices={systemDevices[sys.id]}
                  expandedDevices={expandedDevices}
                  onToggleDevice={toggleDevice}
                  expandedConnectors={expandedConnectors}
                  onToggleConnector={toggleConnector}
                  connectorPins={connectorPins}
                  loadingNodes={loadingNodes}
                  depth={0}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── System Tree Node (renders devices + connectors underneath) ─────────────────

function SystemTreeNode({ system, expanded, onToggle, devices, expandedDevices, onToggleDevice, expandedConnectors, onToggleConnector, connectorPins, loadingNodes, depth }: {
  system: SystemSummary;
  expanded: boolean;
  onToggle: () => void;
  devices?: DeviceSummary[];
  expandedDevices: Set<string>;
  onToggleDevice: (id: string) => void;
  expandedConnectors: Set<string>;
  onToggleConnector: (id: string) => void;
  connectorPins: Record<string, PinSummary[]>;
  loadingNodes: Set<string>;
  depth: number;
}) {
  const Icon = SYSTEM_ICONS[system.code] || Layers;
  const color = SYSTEM_COLORS[system.code] || 'text-slate-400';

  return (
    <div>
      <TreeNode
        icon={<Icon className={`h-4 w-4 ${color}`} />}
        label={`${system.code} — ${system.name}`}
        badge={`${system.deviceCount} devices · ${system.drawingCount} dwgs`}
        expanded={expanded}
        onToggle={onToggle}
        loading={loadingNodes.has(system.id)}
        depth={depth}
        href={`/systems/${system.code}`}
      />

      {expanded && devices && (
        <div className="space-y-0.5">
          {devices.length === 0 ? (
            <p className="text-xs text-slate-500 py-1" style={{ paddingLeft: `${(depth + 1) * 24 + 28}px` }}>
              No devices registered
            </p>
          ) : (
            devices.map(device => (
              <div key={device.id}>
                <TreeNode
                  icon={<Cpu className="h-3.5 w-3.5 text-pink-400" />}
                  label={device.deviceName}
                  badge={device.tagNo || device.deviceType || ''}
                  expanded={expandedDevices.has(device.id)}
                  onToggle={() => onToggleDevice(device.id)}
                  depth={depth + 1}
                  href={`/equipment/${encodeURIComponent(device.deviceName)}`}
                  small
                />
              </div>
            ))
          )}
        </div>
      )}

      {expanded && loadingNodes.has(system.id) && (
        <div className="flex items-center gap-2 py-1" style={{ paddingLeft: `${(depth + 1) * 24 + 28}px` }}>
          <Loader2 className="h-3 w-3 text-cyan-400 animate-spin" />
          <span className="text-xs text-slate-500">Loading devices...</span>
        </div>
      )}
    </div>
  );
}

// ─── Generic Tree Node ──────────────────────────────────────────────────────────

function TreeNode({ icon, label, badge, expanded, onToggle, loading, depth, href, small }: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  loading?: boolean;
  depth: number;
  href?: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group ${
        small ? 'py-1 px-2' : 'py-2 px-3'
      }`}
      style={{ paddingLeft: `${depth * 24 + 8}px` }}
      onClick={onToggle}
    >
      <button className="shrink-0 w-5 h-5 flex items-center justify-center text-slate-500 group-hover:text-slate-300">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
        ) : expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {icon}
      <span className={`font-medium text-slate-200 ${small ? 'text-xs' : 'text-sm'}`}>
        {href ? (
          <Link href={href} className="hover:text-cyan-400 transition-colors" onClick={(e) => e.stopPropagation()}>
            {label}
          </Link>
        ) : label}
      </span>
      {badge && (
        <span className="ml-auto text-xs text-slate-500 font-mono">{badge}</span>
      )}
    </div>
  );
}
