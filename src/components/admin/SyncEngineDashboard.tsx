'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Database, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SyncEngineDashboard() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sync/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'audit' })
      });
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleDeepSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sync' })
      });
      await fetchHealth();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !health) {
    return (
      <div className="glass-card-premium rounded-xl p-6 border border-white/10 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const score = health?.health?.score?.toFixed(1) || '0.0';
  const status = health?.health?.status || 'UNKNOWN';

  return (
    <div className="glass-card-premium rounded-xl overflow-hidden border border-white/10">
      <div className="bg-slate-800/80 p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          Master Synchronization Engine
        </h2>
        <button
          onClick={handleDeepSync}
          disabled={syncing}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-blue-500 shadow-glow-sm transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Running Deep Sync...' : 'Trigger Deep Sync'}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Overall Health Score */}
        <div className="bg-slate-900/50 rounded-lg p-6 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
          {status === 'HEALTHY' ? (
            <div className="absolute inset-0 bg-green-500/10 z-0"></div>
          ) : (
            <div className="absolute inset-0 bg-yellow-500/10 z-0"></div>
          )}
          <div className="relative z-10 flex flex-col items-center">
            <Activity className={`w-8 h-8 mb-2 ${status === 'HEALTHY' ? 'text-green-400' : 'text-yellow-400'}`} />
            <div className="text-4xl font-black text-white">{score}%</div>
            <div className="text-sm font-mono mt-1 text-slate-400 uppercase tracking-widest">Integrity Score</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wires Indexed</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono text-white">{health?.metrics?.wiresWithEndpoints || 0}</div>
            <div className="text-xs text-slate-500 mt-1">/ {health?.metrics?.totalWires || 0} Total</div>
            {health?.metrics?.orphanedWires > 0 && (
              <div className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {health?.metrics?.orphanedWires} orphaned
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pins Indexed</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono text-white">{health?.metrics?.totalPins - (health?.metrics?.orphanedPins || 0)}</div>
            <div className="text-xs text-slate-500 mt-1">/ {health?.metrics?.totalPins || 0} Total</div>
            {health?.metrics?.orphanedPins > 0 && (
              <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {health?.metrics?.orphanedPins} orphaned
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connectors Indexed</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-mono text-white">{health?.metrics?.totalConnectors - (health?.metrics?.orphanedConnectors || 0)}</div>
            <div className="text-xs text-slate-500 mt-1">/ {health?.metrics?.totalConnectors || 0} Total</div>
            {health?.metrics?.orphanedConnectors > 0 && (
              <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {health?.metrics?.orphanedConnectors} orphaned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
