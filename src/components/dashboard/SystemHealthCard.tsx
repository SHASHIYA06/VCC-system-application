'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  Database,
  Zap,
  Shield,
  Loader2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card3D, GlassButton } from '@/components/ui';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: {
    orphanedDevices: number;
    incompleteWires: number;
    emptyConnectors: number;
  };
}

interface SystemStatistics {
  totalSystems: number;
  totalEquipment: number;
  totalWires: number;
  totalConnectors: number;
  totalPins: number;
  hierarchyHealth: number;
}

interface SystemHealthResponse {
  success: boolean;
  statistics: SystemStatistics;
  health: SystemHealth;
  error?: string;
}

export default function SystemHealthCard() {
  const [healthData, setHealthData] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/gsd?action=health');
      const data = await response.json();
      
      if (data.success) {
        setHealthData(data);
        console.log('✅ System health data loaded');
      } else {
        throw new Error(data.message || 'Failed to fetch health data');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      console.error('❌ Health data error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const syncSystemTree = async () => {
    setSyncing(true);
    try {
      console.log('🌳 Starting system tree synchronization...');
      const response = await fetch('/api/tree/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastSync(new Date());
        // Refresh health data after sync
        await fetchHealthData();
        console.log('✅ System tree synchronized successfully');
        
        // Show success notification
        const message = `Tree sync completed: Fixed ${data.statistics.orphansFixed} orphaned records, created ${data.statistics.connectorsCreated} connectors`;
        alert(message); // Replace with proper toast notification in production
      } else {
        throw new Error(data.message || 'Sync failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      console.error('❌ Sync error:', errorMsg);
      alert(`Sync Error: ${errorMsg}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card3D className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-white/80 font-mono">Loading system health...</span>
        </div>
      </Card3D>
    );
  }

  if (error || !healthData) {
    return (
      <Card3D className="p-8 border-red-500/20">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">System Health Unavailable</h3>
          <p className="text-red-300 text-sm mb-4">{error || 'Failed to load health data'}</p>
          <GlassButton
            variant="primary"
            size="sm"
            onClick={fetchHealthData}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </GlassButton>
        </div>
      </Card3D>
    );
  }

  const { statistics, health } = healthData;
  const healthScore = health.score;
  const statusColor = 
    health.status === 'healthy' ? 'text-green-400' :
    health.status === 'warning' ? 'text-yellow-400' : 'text-red-400';
  
  const statusIcon =
    health.status === 'healthy' ? CheckCircle2 :
    health.status === 'warning' ? AlertTriangle : AlertTriangle;

  const StatusIcon = statusIcon;

  return (
    <Card3D className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono">System Health</h3>
              <p className="text-white/60 text-sm">VCC Tree Architecture Status</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-6 w-6 ${statusColor}`} />
            <span className={`font-bold font-mono uppercase ${statusColor}`}>
              {health.status}
            </span>
          </div>
        </div>

        {/* Health Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 font-mono text-sm">Hierarchy Health</span>
            <span className="text-2xl font-bold font-mono text-white">{healthScore}%</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                healthScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                healthScore >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                'bg-gradient-to-r from-red-500 to-pink-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Cpu className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{statistics.totalSystems}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Systems</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Database className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{statistics.totalEquipment.toLocaleString()}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Equipment</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{statistics.totalWires.toLocaleString()}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Wires</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5">
            <Shield className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{statistics.totalConnectors.toLocaleString()}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Connectors</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5">
            <TrendingUp className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{statistics.totalPins.toLocaleString()}</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Pins</div>
          </div>
          
          <div className="text-center p-3 rounded-xl bg-white/5">
            <BarChart3 className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white font-mono">{healthScore}%</div>
            <div className="text-xs text-white/60 uppercase tracking-wider">Health</div>
          </div>
        </div>

        {/* Issues Summary */}
        {(health.issues.orphanedDevices > 0 || health.issues.incompleteWires > 0 || health.issues.emptyConnectors > 0) && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <h4 className="text-red-300 font-bold mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Data Integrity Issues
            </h4>
            <div className="space-y-2 text-sm">
              {health.issues.orphanedDevices > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-200">Orphaned Devices:</span>
                  <span className="text-red-300 font-bold">{health.issues.orphanedDevices}</span>
                </div>
              )}
              {health.issues.incompleteWires > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-200">Incomplete Wires:</span>
                  <span className="text-red-300 font-bold">{health.issues.incompleteWires}</span>
                </div>
              )}
              {health.issues.emptyConnectors > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-200">Empty Connectors:</span>
                  <span className="text-red-300 font-bold">{health.issues.emptyConnectors}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <GlassButton
            variant="primary"
            size="sm"
            onClick={syncSystemTree}
            disabled={syncing}
            className="flex-1"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Tree
              </>
            )}
          </GlassButton>
          
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={fetchHealthData}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </GlassButton>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <div className="mt-4 text-center">
            <p className="text-xs text-white/40 font-mono">
              Last sync: {lastSync.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </Card3D>
  );
}