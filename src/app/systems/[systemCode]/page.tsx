import Link from 'next/link';
import {
  ArrowLeft, FileText, Cpu, Cable, Train, AlertTriangle, ChevronRight,
  Settings, Zap, ShieldCheck, Wind, Radio, Battery, DoorOpen, Activity, Layers
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

const SYSTEM_META: Record<string, any> = {
  GEN: {
    icon: Settings,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500',
  },
  TRL: {
    icon: Train,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
  },
  CAB: {
    icon: Activity,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500',
  },
  BRAKE: {
    icon: ShieldCheck,
    color: 'text-red-400',
    bgColor: 'bg-red-500',
  },
  TRAC: {
    icon: Zap,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
  },
  APS: {
    icon: Battery,
    color: 'text-green-400',
    bgColor: 'bg-green-500',
  },
  DOOR: {
    icon: DoorOpen,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500',
  },
  VAC: {
    icon: Wind,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500',
  },
  TMS: {
    icon: Cpu,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500',
  },
  COMMS: {
    icon: Radio,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
  },
  PIS: {
    icon: Radio,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500',
  }
};

export default async function SystemDetailPage({ params }: { params: { systemCode: string } }) {
  const code = params.systemCode.toUpperCase();
  
  // Fetch system from database
  const systemRecord = await prisma.system.findUnique({
    where: { code },
    include: {
      drawings: {
        orderBy: { drawingNo: 'asc' }
      },
      devices: {
        orderBy: { tagNo: 'asc' }
      }
    }
  });

  if (!systemRecord) {
    notFound();
  }

  const meta = SYSTEM_META[code] || { icon: Settings, color: 'text-slate-400', bgColor: 'bg-slate-500' };
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </Link>
            <div className={`p-2 rounded-xl ${meta.bgColor}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{systemRecord.code}</h1>
                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{systemRecord.name}</span>
              </div>
              <p className="text-sm text-slate-400">{systemRecord.description || 'No description available for this system.'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drawings */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Related Drawings</h2>
                <span className="ml-auto text-sm text-slate-400">{systemRecord.drawings.length} drawings</span>
              </div>
              <div className="divide-y divide-slate-700/50 max-h-[600px] overflow-y-auto">
                {systemRecord.drawings.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">No drawings linked to this system.</div>
                ) : (
                  systemRecord.drawings.map((drawing) => (
                    <Link href={`/drawings/${drawing.drawingNo}`} key={drawing.id} className="block px-5 py-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-cyan-400 font-medium">{drawing.drawingNo}</p>
                          <p className="text-white font-medium mt-1">{drawing.title}</p>
                          {drawing.remarks && <p className="text-sm text-slate-400 mt-1">{drawing.remarks}</p>}
                        </div>
                        <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                          {drawing.totalSheets} Sheets
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Equipment */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Equipment & Devices</h2>
                <span className="ml-auto text-sm text-slate-400">{systemRecord.devices.length}</span>
              </div>
              <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                {systemRecord.devices.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-4">No equipment records found.</div>
                ) : (
                  systemRecord.devices.map((eq) => (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div>
                        <p className="font-mono text-purple-400">{eq.tagNo || 'No Tag'}</p>
                        <p className="text-sm text-slate-300">{eq.deviceName}</p>
                      </div>
                      <p className="text-xs text-slate-500">{eq.locationTag || eq.carType}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Drawings</span>
                  <span className="text-white font-medium">{systemRecord.drawings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment</span>
                  <span className="text-white font-medium">{systemRecord.devices.length}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <Link href="/dashboard" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">Back to Dashboard</span>
              </Link>
              <Link href="/drawings" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300">All Drawings</span>
              </Link>
              <Link href="/wires/trace" className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                <Cable className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300">Wire Trace Tool</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}