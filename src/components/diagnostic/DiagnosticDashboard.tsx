'use client';

import React, { useEffect, useState } from 'react';
import { DiagnosticReport, SystemHealth, DiagnosticIssue } from '@/lib/diagnostic/analyzer';
import { AlertTriangle, CheckCircle2, AlertCircle, Zap, Activity, TrendingUp, Loader2 } from 'lucide-react';

interface DiagnosticDashboardProps {
  systemCode?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  systemCode,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (systemCode) {
        const response = await fetch(`/api/diagnostic?system=${systemCode}`);
        const data = await response.json();
        if (data.success) {
          setSystemHealth(data.data);
        } else {
          throw new Error(data.error);
        }
      } else {
        const response = await fetch('/api/diagnostic?report=true');
        const data = await response.json();
        if (data.success) {
          setReport(data.data);
        } else {
          throw new Error(data.error);
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagnostics');
      console.error('Diagnostic fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();

    if (autoRefresh) {
      const interval = setInterval(fetchDiagnostics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [systemCode, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-slate-300">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold text-red-400">Diagnostic Error</h3>
        </div>
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={fetchDiagnostics}
          className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (systemHealth) {
    return (
      <div className="w-full space-y-6 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{systemHealth.systemName}</h2>
            <p className="text-slate-400 text-sm">System Health Analysis</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-cyan-400">{systemHealth.healthScore}%</div>
            <p className={`text-sm font-semibold ${
              systemHealth.status === 'healthy' ? 'text-green-400' :
              systemHealth.status === 'warning' ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {systemHealth.status.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Devices</p>
            <p className="text-2xl font-bold text-cyan-400">{systemHealth.deviceCount}</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Connectors</p>
            <p className="text-2xl font-bold text-blue-400">{systemHealth.connectorCount}</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Wires</p>
            <p className="text-2xl font-bold text-purple-400">{systemHealth.wireCount}</p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-sm">Issues</p>
            <p className={`text-2xl font-bold ${systemHealth.issueCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {systemHealth.issueCount}
            </p>
          </div>
        </div>

        {/* Issues */}
        {systemHealth.issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Issues Found
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {systemHealth.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-lg border ${
                    issue.severity === 'critical'
                      ? 'bg-red-900/20 border-red-500/30'
                      : issue.severity === 'warning'
                      ? 'bg-yellow-900/20 border-yellow-500/30'
                      : 'bg-blue-900/20 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-semibold ${
                        issue.severity === 'critical' ? 'text-red-400' :
                        issue.severity === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {issue.title}
                      </p>
                      <p className="text-sm text-slate-300 mt-1">{issue.description}</p>
                      <p className="text-xs text-slate-400 mt-2">💡 {issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-slate-500 text-right">
          Last updated: {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>
    );
  }

  if (report) {
    return (
      <div className="w-full space-y-6 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">System Diagnostics Report</h2>
            <p className="text-slate-400 text-sm">Comprehensive system health analysis</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-cyan-400">{report.overallHealth}%</div>
            <p className="text-sm text-slate-400">Overall Health</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <p className="text-green-400 text-sm font-semibold">Healthy</p>
            <p className="text-3xl font-bold text-green-400">{report.healthySystems}</p>
          </div>
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 text-sm font-semibold">Warning</p>
            <p className="text-3xl font-bold text-yellow-400">{report.warningSystems}</p>
          </div>
          <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <p className="text-red-400 text-sm font-semibold">Critical</p>
            <p className="text-3xl font-bold text-red-400">{report.criticalSystems}</p>
          </div>
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-400 text-sm font-semibold">Total Systems</p>
            <p className="text-3xl font-bold text-blue-400">{report.totalSystems}</p>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <p className="text-cyan-300 text-sm">• {rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Issues */}
        {report.criticalIssues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Critical Issues
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {report.criticalIssues.map((issue) => (
                <div key={issue.id} className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                  <p className="font-semibold text-red-400">{issue.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-slate-500 text-right">
          Report generated: {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'Unknown'}
        </div>
      </div>
    );
  }

  return null;
};

export default DiagnosticDashboard;
