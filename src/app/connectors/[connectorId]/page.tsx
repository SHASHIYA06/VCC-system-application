'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Cable, ArrowLeft, Search, MapPin, FileText, 
  Cpu, ChevronDown, ChevronUp, Box, AlertTriangle, Loader2
} from 'lucide-react';

interface ConnectorData {
  id: string;
  connectorCode: string;
  description: string;
  carType: string;
  pinCount: number;
  scope: string;
  drawing: { id: string; drawingNo: string; title: string } | null;
  pins: { id: string; pinNo: string; signalName: string; wireNo: string }[];
  system: { code: string; name: string } | null;
}

export default function ConnectorDetailPage() {
  const params = useParams();
  const connectorId = typeof params.connectorId === 'string' ? params.connectorId : '';
  
  const [connector, setConnector] = useState<ConnectorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectorId) {
      fetchConnector(connectorId);
    }
  }, [connectorId]);

  async function fetchConnector(code: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/connectors?connector_code=${encodeURIComponent(code)}&limit=1`);
      const data = await res.json();
      
      if (data.connectors && data.connectors.length > 0) {
        setConnector(data.connectors[0]);
        setError(null);
      } else {
        setError('Connector not found in database');
      }
    } catch (err) {
      setError('Failed to load connector');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <Link href="/connectors" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Connectors
        </Link>
      </div>

      {error && (
        <div className="glass-card p-4 bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
          {error}
        </div>
      )}

      {connector && (
        <>
          <div className="glass-card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Cable className="h-6 w-6 text-cyan-400" />
                  {connector.connectorCode}
                </h1>
                <p className="text-slate-400 mt-1">{connector.description || 'Connector'}</p>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {connector.carType && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-sm">
                      {connector.carType}
                    </span>
                  )}
                  {connector.scope && (
                    <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-sm">
                      {connector.scope}
                    </span>
                  )}
                  {connector.system && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-sm">
                      {connector.system.code}
                    </span>
                  )}
                </div>
              </div>
              {connector.drawing && (
                <Link href={`/drawings/${connector.drawing.drawingNo}`}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg">
                  <FileText className="h-4 w-4" />
                  View Drawing
                </Link>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400">Total Pins</div>
                <div className="text-2xl font-bold text-white">{connector.pinCount}</div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400">Pins with Wires</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {connector.pins.filter(p => p.wireNo).length}
                </div>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <div className="text-slate-400">Drawing</div>
                <div className="text-cyan-400 font-mono">
                  {connector.drawing?.drawingNo || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Pin Details */}
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                Pin Assignments
              </h2>
              <span className="text-sm text-slate-400">
                {connector.pins.length} pins defined
              </span>
            </div>
            
            {connector.pins.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <p className="text-slate-400">No pin details available for this connector</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/30">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Pin #</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Signal Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Wire Number</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {connector.pins.map((pin) => (
                      <tr key={pin.id} className="hover:bg-slate-800/20">
                        <td className="px-6 py-3">
                          <span className="font-mono font-bold text-cyan-400 text-lg">
                            {pin.pinNo}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-white">{pin.signalName || '-'}</span>
                        </td>
                        <td className="px-6 py-3">
                          {pin.wireNo ? (
                            <Link href={`/wires/${pin.wireNo}`}
                              className="inline-flex items-center px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 font-mono hover:bg-cyan-500/20">
                              {pin.wireNo}
                            </Link>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {pin.wireNo && (
                            <Link href={`/wires/trace?wire=${pin.wireNo}`}
                              className="text-cyan-400 hover:text-cyan-300 text-sm">
                              Trace Wire
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
        </>
      )}
    </div>
  );
}