'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Zap, Cpu, Cable, ChevronRight, MapPin, ArrowRight, Database, FileText, Link as LinkIcon } from 'lucide-react';
import Head from 'next/head';

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

interface RelatedDrawing {
  id: string;
  drawingNo: string;
  title?: string;
}

interface WireTrace {
  source: {
    type: string;
    code: string;
    name: string;
    pin?: string;
    description: string;
  };
  destination: {
    type: string;
    code: string;
    name: string;
    pin?: string;
    description: string;
  };
  wires: string[];
  colorCode: string;
}

const WIRE_TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HV: { bg: 'bg-red-500/20', text: 'text-red-400', label: '750V Main' },
  ED: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Propulsion' },
  AP: { bg: 'bg-green-500/20', text: 'text-green-400', label: '415V AC' },
  BA: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '110V DC' },
  S: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Shielded' },
};

const WIRE_TRACE_COLORS: Record<string, string> = {
  '#00BFFF': 'border-cyan-500 bg-cyan-500/10',
  '#FFA500': 'border-orange-500 bg-orange-500/10',
  '#FF4444': 'border-red-500 bg-red-500/10',
  '#44FF44': 'border-green-500 bg-green-500/10',
};

export default function WireDetailPage() {
  const params = useParams();
  const wireNo = params.wireNo as string;
  
  const [wire, setWire] = useState<WireData | null>(null);
  const [trace, setTrace] = useState<WireTrace | null>(null);
  const [relatedDrawings, setRelatedDrawings] = useState<RelatedDrawing[]>([]);
  const [relatedPins, setRelatedPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWire() {
      if (!wireNo) return;
      try {
        const response = await fetch(`/api/wires/${wireNo}`);
        if (response.ok) {
          const data = await response.json();
          setWire(data.wire);
          setTrace(data.trace);
          setRelatedDrawings(data.relatedDrawings || []);
          setRelatedPins(data.pins || []);
        }
      } catch (error) {
        console.error('Failed to fetch wire:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWire();
  }, [wireNo]);

  const getVoltageClassStyle = (voltageClass?: string) => {
    if (!voltageClass) return WIRE_TYPE_COLORS.BA;
    return WIRE_TYPE_COLORS[voltageClass] || WIRE_TYPE_COLORS.BA;
  };

  const getTraceColorStyle = (colorCode?: string) => {
    if (!colorCode) return 'border-slate-500 bg-slate-500/10';
    return WIRE_TRACE_COLORS[colorCode] || 'border-slate-500 bg-slate-500/10';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!wire) {
    return (
      <div className="animated-bg min-h-screen p-6 grid-pattern">
        <div className="mb-6">
          <Link href="/wires" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Wires
          </Link>
        </div>
        <div className="glass-card p-12 text-center">
          <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Wire {wireNo} not found</p>
          <Link href="/admin/import" className="mt-4 text-cyan-400 hover:text-cyan-300">
            Import wires to add to database
          </Link>
        </div>
      </div>
    );
  }

  const voltageStyle = getVoltageClassStyle(wire.voltageClass);

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-6">
        <Link href="/wires" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Wire List
        </Link>
      </div>

      <div className={`glass-card overflow-hidden mb-6 border-l-4 ${getTraceColorStyle(trace?.colorCode)}`}>
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Zap className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-mono text-white">{wire.wireNo}</h1>
                <p className="text-slate-400">{wire.signalName || wire.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {wire.voltageClass && (
                <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${voltageStyle.bg} ${voltageStyle.text}`}>
                  {wire.voltageClass} - {voltageStyle.label}
                </span>
              )}
              {wire.wireColor && (
                <span className="inline-flex items-center px-3 py-1 rounded text-sm font-medium bg-slate-700/50 text-slate-300">
                  {wire.wireColor}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">Signal</span>
              <span className="text-white font-mono">{wire.signalName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cable Spec</span>
              <span className="text-white font-mono">{wire.cableSpec || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Voltage Class</span>
              <span className={`font-mono ${voltageStyle.text}`}>{wire.voltageClass || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Wire Color</span>
              <span className="text-white">{wire.wireColor || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Cable className="h-5 w-5 text-cyan-400" />
            Connection Path
          </h2>
        </div>
        <div className="p-6">
          {trace ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source</div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Cpu className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <Link href={`/equipment/${trace.source.code}`} className="text-cyan-400 font-bold hover:text-cyan-300 block text-lg">
                      {trace.source.code}
                    </Link>
                    {trace.source.pin && (
                      <span className="text-sm text-slate-400 font-mono mt-1 block">Pin: {trace.source.pin}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-500/50 to-orange-500/50 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                </div>
              </div>

              <div className="flex-1 p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Destination</div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <Cpu className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <Link href={`/equipment/${trace.destination.code}`} className="text-orange-400 font-bold hover:text-orange-300 block text-lg">
                      {trace.destination.code}
                    </Link>
                    {trace.destination.pin && (
                      <span className="text-sm text-slate-400 font-mono mt-1 block">Pin: {trace.destination.pin}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500">No trace data available.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connected Pins */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-cyan-400" />
              Connected Pins
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-300 rounded-md">
              {relatedPins.length} Pins
            </span>
          </div>
          <div className="p-6">
            {relatedPins.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No connected pins found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPins.map((pin) => (
                  <div key={pin.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-start gap-3 hover:border-cyan-500/30 transition-colors">
                    <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                      <LinkIcon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium font-mono text-sm">{pin.connectorCode}</p>
                      <p className="text-slate-400 text-xs mt-1">Pin: {pin.pinNo}</p>
                      {pin.drawingNo && (
                        <Link href={`/drawings/${pin.drawingNo}`} className="text-cyan-500 hover:text-cyan-400 text-xs mt-2 inline-flex items-center gap-1">
                          View Drawing <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Referenced In */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Referenced In
            </h2>
            <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-300 rounded-md">
              {relatedDrawings.length} Drawings
            </span>
          </div>
          <div className="divide-y divide-slate-700/30 max-h-[400px] overflow-y-auto">
            {relatedDrawings.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No related drawings found.</div>
              ) : (
                relatedDrawings.map((drawing) => (
                  <Link
                    key={drawing.id}
                    href={`/drawings/${drawing.drawingNo}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-700/30 transition-colors group"
                  >
                    <div>
                      <span className="font-mono text-blue-400 font-medium group-hover:text-blue-300 transition-colors">{drawing.drawingNo}</span>
                      <p className="text-slate-300 text-sm mt-1">{drawing.title || 'Untitled Drawing'}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-6">
            {(wire.sourceEq || wire.destEq) && !trace && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyan-400" />
                  Routing Info
                </h2>
                
                <div className="space-y-4">
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-500 block mb-1">Source</span>
                    <div className="text-white font-mono">{wire.sourceEq || '-'} {wire.sourceConnector ? `> ${wire.sourceConnector}` : ''} {wire.sourcePin ? `(Pin ${wire.sourcePin})` : ''}</div>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-500 block mb-1">Destination</span>
                    <div className="text-white font-mono">{wire.destEq || '-'} {wire.destConnector ? `> ${wire.destConnector}` : ''} {wire.destPin ? `(Pin ${wire.destPin})` : ''}</div>
                  </div>
                </div>
              </div>
            )}

            {wire.description && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{wire.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}