'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Zap, Cpu, Cable, ChevronRight, MapPin, ArrowRight, Database, FileText } from 'lucide-react';

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

      {/* Wire Header */}
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

      {/* Wire Trace Path */}
      {trace && (
        <div className={`glass-card p-6 mb-6 border-l-4 ${getTraceColorStyle(trace.colorCode)}`}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cable className="h-5 w-5 text-cyan-400" />
            Wire Connection Trace
          </h2>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1">Source</div>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-400" />
                <Link href={`/equipment/${trace.source.code}`} className="text-cyan-400 font-bold hover:text-cyan-300">
                  {trace.source.code}
                </Link>
              </div>
              {trace.source.pin && (
                <div className="mt-2 text-sm text-slate-400">
                  <span className="font-mono">{trace.source.pin}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="h-0.5 w-12 bg-cyan-500/50"></div>
              <Zap className="h-5 w-5 text-cyan-400" />
              <div className="h-0.5 w-12 bg-cyan-500/50"></div>
            </div>

            <div className="flex-1 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-1">Destination</div>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-orange-400" />
                <Link href={`/equipment/${trace.destination.code}`} className="text-orange-400 font-bold hover:text-orange-300">
                  {trace.destination.code}
                </Link>
              </div>
              {trace.destination.pin && (
                <div className="mt-2 text-sm text-slate-400">
                  <span className="font-mono">{trace.destination.pin}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="text-slate-500">Wire Path:</span>
            {trace.wires.map((w, i) => (
              <span key={i} className="font-mono text-cyan-400">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Manual Trace Fields (if trace not available) */}
      {!trace && (wire.sourceEq || wire.destEq) && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            Connection Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-2">Source Equipment</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment</span>
                  <span className="text-white font-mono">{wire.sourceEq || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connector</span>
                  <span className="text-cyan-400 font-mono">{wire.sourceConnector || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pin</span>
                  <span className="text-white font-mono">{wire.sourcePin || '-'}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-500 mb-2">Destination Equipment</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment</span>
                  <span className="text-white font-mono">{wire.destEq || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connector</span>
                  <span className="text-orange-400 font-mono">{wire.destConnector || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pin</span>
                  <span className="text-white font-mono">{wire.destPin || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Drawings */}
      {relatedDrawings.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              Related Drawings
            </h2>
          </div>
          <div className="divide-y divide-slate-700/30">
            {relatedDrawings.map((drawing) => (
              <Link
                key={drawing.id}
                href={`/drawings/${drawing.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="font-mono text-cyan-400 font-medium">{drawing.drawingNo}</span>
                    <span className="ml-2 text-slate-400 text-sm">{drawing.title || ''}</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Wire Info */}
      {wire.description && (
        <div className="glass-card p-6 mt-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-slate-300">{wire.description}</p>
        </div>
      )}
    </div>
  );
}