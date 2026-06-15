'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Cable, Cpu, Zap, MapPin, Loader2, AlertTriangle } from 'lucide-react';

interface PinDetail {
  id: string;
  pinNo: string;
  signalName: string | null;
  wireNo: string | null;
  voltageText: string | null;
  conductorClassCode: string | null;
  terminalFrom: string | null;
  terminalTo: string | null;
  note: string | null;
  connector: {
    connectorCode: string;
    carType: string | null;
    locationTag: string | null;
    pinCount: number | null;
    drawing: {
      drawingNo: string;
      title: string;
      system: { code: string; name: string } | null;
    } | null;
  } | null;
  wire: {
    wireNo: string;
    signalName: string | null;
    description: string | null;
    wireColor: string | null;
    wireSize: string | null;
    voltageClass: string | null;
    sourceEquipment: string | null;
    sourceConnector: string | null;
    sourcePin: string | null;
    destEquipment: string | null;
    destConnector: string | null;
    destPin: string | null;
  } | null;
  otherPinsOnConnector: Array<{
    pinNo: string;
    signalName: string | null;
    wireNo: string | null;
  }>;
}

export default function PinDetailPage() {
  const params = useParams();
  const pinId = params.pinId as string;
  const [pin, setPin] = useState<PinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPin() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pins/${pinId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Pin not found');
        }
        const data = await res.json();
        setPin(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load pin');
      } finally {
        setLoading(false);
      }
    }
    if (pinId) fetchPin();
  }, [pinId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        <span className="ml-3 text-slate-400">Loading pin details...</span>
      </div>
    );
  }

  if (error || !pin) {
    return (
      <div className="min-h-screen p-6">
        <Link href="/pins" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Pins
        </Link>
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span>{error || 'Pin not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Link href="/pins" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to Pins
      </Link>

      {/* Pin Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
            <MapPin className="h-7 w-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">
              Pin {pin.pinNo}
              {pin.connector && <span className="text-slate-400 ml-2">on {pin.connector.connectorCode}</span>}
            </h1>
            <p className="text-slate-400">
              {pin.signalName || 'No signal assigned'}
              {pin.wireNo && <span className="ml-2 text-cyan-400">→ Wire {pin.wireNo}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pin Connection Details */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            Pin Connection
          </h3>
          <dl className="space-y-4">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Pin Number</dt>
              <dd className="text-sm font-mono font-bold text-white">{pin.pinNo}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Signal Name</dt>
              <dd className="text-sm font-mono text-cyan-400">{pin.signalName || '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Wire Number</dt>
              <dd className="text-sm font-mono">
                {pin.wireNo ? (
                  <Link href={`/wires/${pin.wireNo}`} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                    {pin.wireNo}
                  </Link>
                ) : '—'}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Voltage</dt>
              <dd className="text-sm text-white">{pin.voltageText || '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Conductor Class</dt>
              <dd className="text-sm text-white">{pin.conductorClassCode || '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Terminal From</dt>
              <dd className="text-sm text-white">{pin.terminalFrom || '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <dt className="text-sm text-slate-400">Terminal To</dt>
              <dd className="text-sm text-white">{pin.terminalTo || '—'}</dd>
            </div>
            {pin.note && (
              <div className="pt-2">
                <dt className="text-sm text-slate-400 mb-1">Note</dt>
                <dd className="text-sm text-slate-300 bg-slate-800/50 p-2 rounded">{pin.note}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Wire Details (if connected) */}
        {pin.wire && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cable className="h-5 w-5 text-green-400" />
              Wire: {pin.wire.wireNo}
            </h3>
            <dl className="space-y-4">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <dt className="text-sm text-slate-400">Signal</dt>
                <dd className="text-sm text-white">{pin.wire.signalName || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <dt className="text-sm text-slate-400">Description</dt>
                <dd className="text-sm text-white">{pin.wire.description || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <dt className="text-sm text-slate-400">Wire Size</dt>
                <dd className="text-sm text-white">{pin.wire.wireSize || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <dt className="text-sm text-slate-400">Color</dt>
                <dd className="text-sm text-white">{pin.wire.wireColor || '—'}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <dt className="text-sm text-slate-400">Voltage Class</dt>
                <dd className="text-sm text-white">{pin.wire.voltageClass || '—'}</dd>
              </div>
              <div className="border-t border-slate-700 pt-3 mt-3">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">Route</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">{pin.wire.sourceEquipment || '?'}</span>
                  <span className="text-slate-600">({pin.wire.sourceConnector}:{pin.wire.sourcePin})</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-orange-400">{pin.wire.destEquipment || '?'}</span>
                  <span className="text-slate-600">({pin.wire.destConnector}:{pin.wire.destPin})</span>
                </div>
              </div>
            </dl>
          </div>
        )}

        {/* Connector Info */}
        {pin.connector && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-purple-400" />
              Connector: {pin.connector.connectorCode}
            </h3>
            <dl className="space-y-3">
              {pin.connector.carType && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <dt className="text-sm text-slate-400">Car Type</dt>
                  <dd className="text-sm text-white">{pin.connector.carType}</dd>
                </div>
              )}
              {pin.connector.locationTag && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <dt className="text-sm text-slate-400">Location</dt>
                  <dd className="text-sm text-white">{pin.connector.locationTag}</dd>
                </div>
              )}
              {pin.connector.pinCount && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <dt className="text-sm text-slate-400">Total Pins</dt>
                  <dd className="text-sm text-white">{pin.connector.pinCount}</dd>
                </div>
              )}
              {pin.connector.drawing && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <dt className="text-sm text-slate-400">Drawing</dt>
                  <dd className="text-sm">
                    <Link href={`/drawings/${pin.connector.drawing.drawingNo}`} className="text-cyan-400 hover:text-cyan-300 cursor-pointer">
                      {pin.connector.drawing.drawingNo}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Other Pins on Same Connector */}
        {pin.otherPinsOnConnector && pin.otherPinsOnConnector.length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Other Pins on {pin.connector?.connectorCode}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-2 text-left text-slate-400">Pin</th>
                    <th className="py-2 text-left text-slate-400">Signal</th>
                    <th className="py-2 text-left text-slate-400">Wire</th>
                  </tr>
                </thead>
                <tbody>
                  {pin.otherPinsOnConnector.slice(0, 20).map((p, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="py-1.5 font-mono text-cyan-400">{p.pinNo}</td>
                      <td className="py-1.5 text-white">{p.signalName || '—'}</td>
                      <td className="py-1.5">
                        {p.wireNo ? (
                          <Link href={`/wires/${p.wireNo}`} className="text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer">
                            {p.wireNo}
                          </Link>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
