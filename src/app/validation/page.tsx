'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, FileText, GitBranch } from 'lucide-react';

interface CoverageMetrics {
  drawingCoverage: number;
  connectorCoverage: number;
  pinCoverage: number;
  wireCoverage: number;
  systemCoverage: number;
  revisionCoverage: number;
  validationScore: number;
  syntheticDataRemaining: number;
  verifiedWires: number;
  totalWires: number;
  verifiedConnectors: number;
  totalConnectors: number;
  verifiedDevices: number;
  totalDevices: number;
}

export default function ValidationPage() {
  const [metrics, setMetrics] = useState<CoverageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/twin/metrics');
      const data = await response.json();
      if (data.success && data.data) {
        setMetrics(data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (value: number, threshold: number = 80) => {
    if (value >= threshold) return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (value >= 50) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading Engineering Accuracy Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            Engineering Accuracy Dashboard
          </h1>
          <p className="text-slate-400">Digital Twin Certification - Real-time Data Quality Monitoring</p>
          {lastUpdated && <p className="text-slate-500 text-sm mt-2">Last updated: {lastUpdated}</p>}
        </div>

        {/* Main Score */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 mb-2">Overall Validation Score</p>
              <p className={`text-6xl font-bold ${getStatusColor(metrics?.validationScore || 0)}`}>
                {metrics?.validationScore?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-right">
              {getStatusIcon(metrics?.validationScore || 0)}
              <p className="text-slate-400 mt-2">
                {metrics?.validationScore && metrics.validationScore >= 80 
                  ? 'Engineering Grade Certified' 
                  : 'Data Quality Needs Improvement'}
              </p>
            </div>
          </div>
        </div>

        {/* Coverage Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Drawing Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 font-medium">Drawing Coverage</span>
              </div>
              {getStatusIcon(metrics?.drawingCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.drawingCoverage || 0)}`}>
              {metrics?.drawingCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">Drawings mapped to database</p>
          </div>

          {/* Connector Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 font-medium">Connector Coverage</span>
              </div>
              {getStatusIcon(metrics?.connectorCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.connectorCoverage || 0)}`}>
              {metrics?.connectorCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {metrics?.verifiedConnectors || 0} / {metrics?.totalConnectors || 0} verified
            </p>
          </div>

          {/* Pin Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300 font-medium">Pin Coverage</span>
              </div>
              {getStatusIcon(metrics?.pinCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.pinCoverage || 0)}`}>
              {metrics?.pinCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">Pins with wire references</p>
          </div>

          {/* Wire Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300 font-medium">Wire Coverage</span>
              </div>
              {getStatusIcon(metrics?.wireCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.wireCoverage || 0)}`}>
              {metrics?.wireCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {metrics?.verifiedWires || 0} / {metrics?.totalWires || 0} verified
            </p>
          </div>

          {/* System Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-slate-300 font-medium">System Coverage</span>
              </div>
              {getStatusIcon(metrics?.systemCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.systemCoverage || 0)}`}>
              {metrics?.systemCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">Systems with drawings</p>
          </div>

          {/* Revision Coverage */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="text-slate-300 font-medium">Revision Coverage</span>
              </div>
              {getStatusIcon(metrics?.revisionCoverage || 0)}
            </div>
            <p className={`text-3xl font-bold ${getStatusColor(metrics?.revisionCoverage || 0)}`}>
              {metrics?.revisionCoverage?.toFixed(1) || 0}%
            </p>
            <p className="text-slate-500 text-sm mt-1">Drawings with revisions tracked</p>
          </div>
        </div>

        {/* Synthetic Data Alert */}
        <div className={`border rounded-lg p-5 mb-8 ${
          (metrics?.syntheticDataRemaining || 0) > 50 
            ? 'bg-red-500/10 border-red-500/30' 
            : (metrics?.syntheticDataRemaining || 0) > 20
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-green-500/10 border-green-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Synthetic Data Remaining</h3>
              <p className="text-slate-400">
                {(metrics?.syntheticDataRemaining || 0).toFixed(1)}% of wires are synthetic/auto-generated
              </p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${
                (metrics?.syntheticDataRemaining || 0) > 50 
                  ? 'text-red-400' 
                  : (metrics?.syntheticDataRemaining || 0) > 20
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}>
                {(metrics?.syntheticDataRemaining || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Phase 2 Completion Goal: 100% Verified Engineering Relationships</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 text-slate-400">Wires</div>
              <div className="flex-1 bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics?.wireCoverage || 0), 100)}%` }}
                />
              </div>
              <div className="w-16 text-right text-slate-400">{metrics?.wireCoverage?.toFixed(0) || 0}%</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-slate-400">Connectors</div>
              <div className="flex-1 bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics?.connectorCoverage || 0), 100)}%` }}
                />
              </div>
              <div className="w-16 text-right text-slate-400">{metrics?.connectorCoverage?.toFixed(0) || 0}%</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-slate-400">Systems</div>
              <div className="flex-1 bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics?.systemCoverage || 0), 100)}%` }}
                />
              </div>
              <div className="w-16 text-right text-slate-400">{metrics?.systemCoverage?.toFixed(0) || 0}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}