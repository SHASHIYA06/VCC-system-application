'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Cable, ChevronRight, AlertTriangle, Info, Zap, X } from 'lucide-react';

interface TraceEndpoint {
  type: 'equipment' | 'connector' | 'terminal' | 'trainline' | 'source';
  code: string;
  name: string;
  pin?: string;
  car?: string;
  description?: string;
}

interface WireTracePath {
  source: TraceEndpoint;
  destination: TraceEndpoint;
  wires: string[];
  junctions?: TraceEndpoint[];
  colorCode?: string;
}

interface WireData {
  id: string;
  wireNo: string;
  signalName?: string;
  description?: string;
  wireColor?: string;
  voltageClass?: string;
  cableSpec?: string;
  sourceEq?: string;
  sourceConnector?: string;
  sourcePin?: string;
  destEq?: string;
  destConnector?: string;
  destPin?: string;
}

export default function WireDetailPage({ params }: { params: { wireNo: string } }) {
  const [wireData, setWireData] = useState<WireData | null>(null);
  const [trace, setTrace] = useState<WireTracePath | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedDrawings, setRelatedDrawings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchWireData() {
      try {
        const response = await fetch(`/api/wires/${params.wireNo}`);
        if (response.ok) {
          const data = await response.json();
          setWireData(data.wire);
          
          if (data.trace) {
            setTrace(data.trace);
          }
          
          if (data.relatedDrawings) {
            setRelatedDrawings(data.relatedDrawings);
          }
        } else {
          setWireData(null);
        }
      } catch (error) {
        console.error('Failed to fetch wire:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWireData();
  }, [params.wireNo]);

  const getColorStyle = (colorCode?: string) => {
    if (!colorCode) return { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400' };
    
    const colorMap: Record<string, { border: string; bg: string; text: string; hex: string }> = {
      '#00BFFF': { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', hex: '#00BFFF' },
      '#FF6600': { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-400', hex: '#FF6600' },
      '#FFA500': { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', hex: '#FFA500' },
      '#FF0000': { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-400', hex: '#FF0000' },
      '#00FF00': { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-400', hex: '#00FF00' },
      '#444444': { border: 'border-slate-500', bg: 'bg-slate-500', text: 'text-slate-400', hex: '#444444' },
      '#FF4444': { border: 'border-red-400', bg: 'bg-red-400', text: 'text-red-400', hex: '#FF4444' },
    };
    
    return colorMap[colorCode] || { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', hex: '#00BFFF' };
  };

  const isCrossConnected = trace?.junctions?.some(j => j.type === 'trainline' && j.description?.includes('Crossed')) ?? false;
  const colorStyle = getColorStyle(trace?.colorCode);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <Link href="/wires" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Wires
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${colorStyle.bg}`} style={{ backgroundColor: trace?.colorCode || '#00BFFF' }}>
            <Cable className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Wire: {params.wireNo}</h1>
            <p className="text-slate-400">{wireData?.signalName || wireData?.description || 'Trainline connection trace'}</p>
          </div>
        </div>
      </div>

      {isCrossConnected && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-400">Cross-Connection Alert</h3>
              <p className="text-sm text-slate-300 mt-1">
                This wire participates in a cross-connection. Verify correct pin/wire assignment during maintenance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className={`px-6 py-4 border-b border-slate-700/50 ${colorStyle.bg} bg-opacity-20`}>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="h-5 w-5" style={{ color: trace?.colorCode || '#00BFFF' }} />
                Wire Trace Path
              </h2>
            </div>
            <div className="p-6">
              {trace || (wireData?.sourceEq && wireData?.destEq) ? (
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className={`inline-flex items-start gap-3 p-4 rounded-lg border-2 ${colorStyle.border} bg-slate-800/50`}>
                        <div className={`p-2 rounded-lg ${colorStyle.bg}`} style={{ backgroundColor: trace?.colorCode || '#00BFFF' }}>
                          <Cpu className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 uppercase">Source</div>
                          <div className="font-semibold text-white">{wireData?.sourceEq || trace?.source.code || 'N/A'}</div>
                          <div className="text-sm text-slate-400">{wireData?.sourceConnector || trace?.source.name || ''}</div>
                          {(wireData?.sourcePin || trace?.source.pin) && (
                            <div className="text-xs font-mono mt-1 text-cyan-400">
                              Pin: {wireData?.sourcePin || trace?.source.pin}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-1 rounded" style={{ backgroundColor: trace?.colorCode || '#00BFFF' }}></div>
                        <div className="mt-2 px-3 py-1 rounded bg-slate-800 border border-slate-700 text-sm font-mono font-semibold text-white">
                          {params.wireNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Trainline</div>
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className={`inline-flex items-start gap-3 p-4 rounded-lg border-2 ${colorStyle.border} bg-slate-800/50`}>
                        <div>
                          <div className="text-xs font-medium text-slate-400 uppercase">Destination</div>
                          <div className="font-semibold text-white">{wireData?.destEq || trace?.destination.code || 'N/A'}</div>
                          <div className="text-sm text-slate-400">{wireData?.destConnector || trace?.destination.name || ''}</div>
                          {(wireData?.destPin || trace?.destination.pin) && (
                            <div className="text-xs font-mono mt-1 text-cyan-400">
                              Pin: {wireData?.destPin || trace?.destination.pin}
                            </div>
                          )}
                        </div>
                        <div className={`p-2 rounded-lg ${colorStyle.bg}`} style={{ backgroundColor: trace?.colorCode || '#00BFFF' }}>
                          <Cpu className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {trace?.junctions && trace.junctions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-700/50">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Intermediate Points</h4>
                      <div className="space-y-2">
                        {trace.junctions.map((j, i) => (
                          <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/30 mr-3">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <div>
                              <div className="font-semibold text-sm text-white">{j.code}</div>
                              <div className="text-xs text-slate-400">{j.pin} - {j.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="text-sm text-slate-400">
                        <p><strong>Source:</strong> {wireData?.sourceEq || trace?.source.description || 'See documentation'}</p>
                        <p className="mt-1"><strong>Destination:</strong> {wireData?.destEq || trace?.destination.description || 'See documentation'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cable className="mx-auto h-12 w-12 text-slate-500" />
                  <h3 className="mt-4 text-sm font-medium text-slate-400">Detailed Trace Not Available</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Run seed or import wires to populate trace data
                  </p>
                </div>
              )}
            </div>
          </div>

          {relatedDrawings.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-purple-500/10">
                <h2 className="text-lg font-semibold text-white">Related VCC Drawings</h2>
              </div>
              <ul className="divide-y divide-slate-700/30">
                {relatedDrawings.map((d) => (
                  <li key={d.id}>
                    <Link href={`/drawings/${d.id}`} className="block hover:bg-slate-800/30 px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-mono font-medium text-cyan-400">{d.drawingNo}</span>
                          <span className="ml-3 text-sm text-slate-500">Sheet {d.pageCount}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{d.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/30">
              <h3 className="text-base font-semibold text-white">Wire Properties</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Wire Number</dt>
                  <dd className="mt-1 text-lg font-mono text-white">{params.wireNo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Signal Name</dt>
                  <dd className="mt-1 text-sm text-white">{wireData?.signalName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Wire Color</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      wireData?.wireColor === 'Orange' ? 'bg-orange-500/20 text-orange-400' :
                      wireData?.wireColor === 'Red' ? 'bg-red-500/20 text-red-400' :
                      wireData?.wireColor === 'Green' ? 'bg-green-500/20 text-green-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {wireData?.wireColor || 'Blue'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Voltage Class</dt>
                  <dd className="mt-1 text-sm text-white">{wireData?.voltageClass || '110V'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Cable Spec</dt>
                  <dd className="mt-1 text-sm text-white">{wireData?.cableSpec || '1.5sqmm'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Cross-Connected</dt>
                  <dd className="mt-1">
                    {isCrossConnected ? (
                      <span className="inline-flex items-center rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-slate-700 px-2 py-1 text-xs font-medium text-slate-400">
                        No
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/30">
              <h3 className="text-base font-semibold text-white">Fleet Path</h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'].map((car, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
                      car === 'DMC' ? 'border-blue-500/50 bg-blue-500/20 text-blue-400' :
                      car === 'TC' ? 'border-green-500/50 bg-green-500/20 text-green-400' :
                      'border-orange-500/50 bg-orange-500/20 text-orange-400'
                    }`}>
                      {car}
                    </div>
                    <div className="flex-1 h-6 rounded bg-slate-800/50 relative overflow-hidden">
                      {(i === 0 || i === 5) && (wireData?.sourceEq || trace) && (
                        <div className="absolute inset-0 opacity-30" style={{ backgroundColor: trace?.colorCode || '#00BFFF' }}></div>
                      )}
                      {i > 0 && i < 5 && (wireData?.sourceEq || trace) && (
                        <div className="absolute inset-0 bg-slate-700/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-500">Via X1</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-700/30">
              <h3 className="text-base font-semibold text-white">Related Equipment</h3>
            </div>
            <ul className="divide-y divide-slate-700/30">
              {wireData?.sourceEq && (
                <li className="px-6 py-3">
                  <Link href={`/equipment/${wireData.sourceEq}`} className="block hover:bg-slate-800/30 -mx-6 px-6 py-2">
                    <p className="text-sm font-medium text-white">{wireData.sourceEq}</p>
                    <p className="text-xs text-slate-500">Source - {wireData.sourceConnector || 'N/A'}</p>
                  </Link>
                </li>
              )}
              {wireData?.destEq && (
                <li className="px-6 py-3">
                  <Link href={`/equipment/${wireData.destEq}`} className="block hover:bg-slate-800/30 -mx-6 px-6 py-2">
                    <p className="text-sm font-medium text-white">{wireData.destEq}</p>
                    <p className="text-xs text-slate-500">Destination - {wireData.destConnector || 'N/A'}</p>
                  </Link>
                </li>
              )}
              {!wireData?.sourceEq && !wireData?.destEq && (
                <li className="px-6 py-4 text-sm text-slate-500">No equipment data available</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}