'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Zap, AlertTriangle, Info, ChevronRight } from 'lucide-react';

interface TrainlineDetail {
  trainline_no: string;
  name: string;
  description: string;
  voltage_domain: string;
  car_code: string;
  system_code: string;
  is_cross_connected: boolean;
}

interface CrossingInfo {
  type: 'crossed' | 'jumper' | 'loop';
  from: string;
  to: string;
  description: string;
}

const TRAINLINE_CROSSINGS: Record<number, CrossingInfo[]> = {
  3005: [{ type: 'crossed', from: 'X1 pin 19', to: 'X1 pin 20', description: 'Crossed with 3006 - Powering 2 loop' }],
  3006: [{ type: 'crossed', from: 'X1 pin 20', to: 'X1 pin 19', description: 'Crossed with 3005 - Powering 1 loop' }],
  6009: [{ type: 'jumper', from: 'Jumper 43', to: 'Jumper 44', description: 'Left door open crossed with 6046 at jumper positions' }],
  6046: [{ type: 'jumper', from: 'Jumper 43', to: 'Jumper 44', description: 'Right door open crossed with 6009 at jumper positions' }],
  6014: [{ type: 'jumper', from: 'Jumper 46', to: 'Jumper 47', description: 'Left door close crossed with 6051 at jumper positions' }],
  6051: [{ type: 'jumper', from: 'Jumper 46', to: 'Jumper 47', description: 'Right door close crossed with 6014 at jumper positions' }],
  4024: [{ type: 'loop', from: 'BCU/BECU', to: 'All cars', description: 'Brake loop normal - runs through all cars' }],
  4062: [{ type: 'loop', from: 'EBMV/EBSS', to: 'All cars', description: 'Emergency brake loop normal - failsafe redundant path' }],
  4103: [{ type: 'loop', from: 'EBMV/EBSS', to: 'All cars', description: 'Emergency brake loop redundant - secondary failsafe path' }],
  4122: [{ type: 'loop', from: 'PBMV/PBPS', to: 'DMC/MC', description: 'Parking brake applied - DMC and MC cars' }],
  4153: [{ type: 'loop', from: 'PBMV/PBPS', to: 'DMC/MC', description: 'Parking brake released - DMC and MC cars' }],
};

function getVoltageColor(domain: string): string {
  if (domain?.includes('750') || domain?.includes('415') || domain?.includes('230')) return 'text-red-600 bg-red-50';
  if (domain?.includes('110')) return 'text-amber-600 bg-amber-50';
  return 'text-slate-600 bg-slate-50';
}

function getSystemForTrainline(systemCode: string): string {
  return systemCode || 'GEN';
}

export default function TrainlineDetailPage() {
  const params = useParams();
  const trainlineNo = params.trainlineNo as string;
  
  const [trainline, setTrainline] = useState<TrainlineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrainline() {
      try {
        const response = await fetch(`/api/trainlines/${trainlineNo}`);
        if (!response.ok) {
          // Try MCP endpoint as fallback
          const mcpResponse = await fetch('/api/mcp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'tools/call',
              params: { name: 'get_trainline_trace', arguments: { trainline_no: parseInt(trainlineNo) } }
            })
          });
          
          if (mcpResponse.ok) {
            const data = await mcpResponse.json();
            if (data.result?.trace) {
              setTrainline({
                trainline_no: trainlineNo,
                name: `Trainline ${trainlineNo}`,
                description: data.result.trace.description || 'See database for details',
                voltage_domain: '110V',
                car_code: data.result.trace.source?.car || 'MC',
                system_code: 'TRL',
                is_cross_connected: data.result.is_cross_connected || false
              });
              setLoading(false);
              return;
            }
          }
          throw new Error('Trainline not found');
        }
        const data = await response.json();
        setTrainline(data.trainline || data);
      } catch (err) {
        setError(`Trainline ${trainlineNo} is not in the registry. It may not be defined in the VCC documents.`);
      } finally {
        setLoading(false);
      }
    }
    
    if (trainlineNo) {
      fetchTrainline();
    }
  }, [trainlineNo]);

  const crossing = TRAINLINE_CROSSINGS[parseInt(trainlineNo)]?.[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trainline) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/trainlines" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Trainlines
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Trainline Not Found</h2>
            <p className="text-slate-600">{error || `Trainline ${trainlineNo} is not in the registry.`}</p>
            <p className="text-sm text-slate-500 mt-2">It may not be defined in the VCC documents.</p>
            
            <div className="mt-6">
              <Link href="/trainlines" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse All Trainlines
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const systemCode = getSystemForTrainline(trainline.system_code);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/trainlines" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Trainlines
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-white font-mono">{trainlineNo}</span>
                  {trainline.is_cross_connected && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Crossed
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold text-white">{trainline.name || `Trainline ${trainlineNo}`}</h1>
                <p className="mt-1 text-slate-300">{trainline.description || 'No description available'}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${getVoltageColor(trainline.voltage_domain || '110V')}`}>
                  {trainline.voltage_domain || '110V'}
                </div>
                <p className="mt-2 text-sm text-slate-400">{systemCode}</p>
              </div>
            </div>
          </div>

          {/* Cross-connection Warning */}
          {crossing && (
            <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Cross-Connection Details</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>{crossing.description}</p>
                    <p className="mt-1">From: <span className="font-mono">{crossing.from}</span> → To: <span className="font-mono">{crossing.to}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">System</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{systemCode}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Car Type</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{trainline.car_code || 'All Cars'}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Voltage Domain</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">{trainline.voltage_domain || '110V DC'}</p>
              </div>
            </div>
          </div>

          {/* Related Section */}
          <div className="px-6 py-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Related Wiring</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                View the full wire connections and routing details in the wiring database.
              </p>
              <div className="mt-4 flex gap-3">
                <Link href={`/wires/${trainlineNo}`} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  View Wire Details
                </Link>
                <Link href={`/equipment?search=${systemCode}`} className="inline-flex items-center px-3 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300">
                  Related Equipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}