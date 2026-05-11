import Link from 'next/link';
import { TRAINLINE_REGISTRY, VCC_DRAWING_REGISTRY, EQUIPMENT_REGISTRY } from '@/types/index';
import { ArrowLeft, ArrowRight, Cpu, Cable, ChevronRight, AlertTriangle, Info, Zap } from 'lucide-react';

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
}

const WIRE_TRACES: Record<string, WireTracePath> = {
  '3005': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC', description: 'Powering command 1' },
    destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC', description: 'Powering input' },
    wires: ['3005'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 19', car: 'ALL', description: 'Crossed at X1-19/20' }
    ]
  },
  '3006': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC', description: 'Powering command 2' },
    destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC', description: 'Powering input' },
    wires: ['3006'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 20', car: 'ALL', description: 'Crossed with 3005' }
    ]
  },
  '6009': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J7', car: 'MC', description: 'Left door open command' },
    destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC', description: 'Door open input' },
    wires: ['6009', '6046'],
    junctions: [
      { type: 'connector', code: 'JUMPER', name: 'Jumper Position 43-44', pin: '43/44', car: 'MC', description: 'Left/Right door open cross-jumper' }
    ]
  },
  '6046': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J8', car: 'MC', description: 'Right door open command' },
    destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-4', car: 'MC', description: 'Door open input' },
    wires: ['6046', '6009'],
    junctions: [
      { type: 'connector', code: 'JUMPER', name: 'Jumper Position 43-44', pin: '43/44', car: 'MC', description: 'Crossed with left door' }
    ]
  },
  '6014': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J9', car: 'MC', description: 'Left door close command' },
    destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-5', car: 'MC', description: 'Door close input' },
    wires: ['6014', '6051'],
    junctions: [
      { type: 'connector', code: 'JUMPER', name: 'Jumper Position 46-47', pin: '46/47', car: 'MC', description: 'Left/Right door close cross-jumper' }
    ]
  },
  '6051': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-J10', car: 'MC', description: 'Right door close command' },
    destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN1-6', car: 'MC', description: 'Door close input' },
    wires: ['6051', '6014'],
    junctions: [
      { type: 'connector', code: 'JUMPER', name: 'Jumper Position 46-47', pin: '46/47', car: 'MC', description: 'Crossed with left door' }
    ]
  },
  '6112': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-L3', car: 'MC', description: 'Zero speed signal input' },
    destination: { type: 'equipment', code: 'DCU1', name: 'Door Control Unit', pin: 'CN2-12', car: 'MC', description: 'Zero speed interlock' },
    wires: ['6112'],
    junctions: []
  },
  '4062': {
    source: { type: 'equipment', code: 'BCU1', name: 'Brake Control Unit', pin: 'X1-42', car: 'DMC', description: 'Emergency brake loop normal' },
    destination: { type: 'equipment', code: 'BCU3', name: 'Brake Control Unit 3', pin: 'X1-42', car: 'MC', description: 'EM brake loop continuation' },
    wires: ['4062', '4103'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 42', car: 'ALL', description: 'Redundant EM brake loop' },
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 44', car: 'ALL', description: 'Redundant EM brake loop return' }
    ]
  },
  '4122': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-K4', car: 'MC', description: 'Parking brake applied status' },
    destination: { type: 'equipment', code: 'PBMV1', name: 'Parking Brake MV', pin: 'CN1-2', car: 'DMC', description: 'Parking brake applied command' },
    wires: ['4122', '4153'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 35', car: 'DMC/MC', description: 'Parking brake applied loop' }
    ]
  },
  '7001': {
    source: { type: 'equipment', code: 'TCMS_RIO2', name: 'TCMS RIO Unit 2', pin: 'U25-F2', car: 'TC', description: 'Cab VAC fault signal' },
    destination: { type: 'equipment', code: 'CAB_VAC1', name: 'Cab VAC Unit', pin: 'CN1-5', car: 'CAB', description: 'VAC fault input' },
    wires: ['7001'],
    junctions: []
  },
  '7050': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'U15-F4', car: 'MC', description: 'Saloon VAC 1 status' },
    destination: { type: 'equipment', code: 'VAC1', name: 'Saloon VAC Unit 1', pin: 'CN1-3', car: 'MC', description: 'VAC 1 power feedback' },
    wires: ['7050', '7060'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 55', car: 'MC', description: 'VAC status trainline' }
    ]
  },
  '3003': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC', description: 'Forward command' },
    destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC', description: 'Forward input' },
    wires: ['3003', '3004'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 17', car: 'ALL', description: 'Forward trainline' }
    ]
  },
  '3004': {
    source: { type: 'equipment', code: 'TCMS_RIO1', name: 'TCMS RIO Unit 1', pin: 'X1-18', car: 'MC', description: 'Reverse command' },
    destination: { type: 'equipment', code: 'V1', name: 'VVVF Inverter 1', pin: 'CN1-13', car: 'DMC', description: 'Reverse input' },
    wires: ['3004', '3003'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 18', car: 'ALL', description: 'Reverse trainline' }
    ]
  },
  '4024': {
    source: { type: 'equipment', code: 'BCU1', name: 'Brake Control Unit', pin: 'X1-24', car: 'DMC', description: 'Brake loop normal' },
    destination: { type: 'equipment', code: 'BCU2', name: 'Brake Control Unit 2', pin: 'X1-24', car: 'TC', description: 'Brake loop continuation' },
    wires: ['4024', '4028'],
    junctions: [
      { type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: 'pin 24', car: 'ALL', description: 'Normal brake loop through all cars' }
    ]
  },
};

function parseTrainlineFromWire(wireNo: string): number | null {
  const match = wireNo.match(/^(\d)/);
  return match ? parseInt(match[1] + '000') : null;
}

function getTrainlineInfo(trainlineNo: number) {
  return TRAINLINE_REGISTRY[trainlineNo] || null;
}

function getNodeIcon(type: string) {
  switch (type) {
    case 'equipment': return <Cpu className="h-4 w-4" />;
    case 'connector': return <ChevronRight className="h-4 w-4" />;
    case 'trainline': return <Zap className="h-4 w-4" />;
    default: return <Cable className="h-4 w-4" />;
  }
}

function getNodeColor(type: string) {
  switch (type) {
    case 'equipment': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'connector': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'trainline': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'terminal': return 'bg-green-100 text-green-700 border-green-200';
    case 'source': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default async function WireDetailPage({ params }: { params: { wireNo: string } }) {
  const wireNo = params.wireNo;
  const wireNum = parseInt(wireNo);
  const trace = WIRE_TRACES[wireNo] || null;
  const trainlineNo = parseTrainlineFromWire(wireNo);
  const trainline = trainlineNo ? getTrainlineInfo(trainlineNo) : null;

  const isCrossConnected = trace?.junctions?.some(j => j.type === 'trainline' && j.description?.includes('Crossed')) ?? false;

  const relatedWires = trainline ? Object.values(TRAINLINE_REGISTRY)
    .filter(t => t.trainline_no === trainlineNo)
    .map(t => t.trainline_no) : [];

  const sourceDrawings = Object.values(VCC_DRAWING_REGISTRY)
    .filter(d => {
      const notes = d.notes || '';
      return notes.includes(wireNo) || notes.includes(trainlineNo?.toString() || '');
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/wires" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Wires
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg">
              <Cable className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">Wire: {wireNo}</h1>
              <p className="mt-1 text-slate-600">
                {trainline ? `${trainline.name} - ${trainline.description}` : `Wire connection trace`}
              </p>
            </div>
          </div>
        </div>

        {isCrossConnected && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900">Cross-Connection Alert</h3>
                <p className="mt-1 text-sm text-amber-700">
                  This wire participates in a cross-connection or jumper arrangement. Verify correct pin/wire assignment during maintenance.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {trace ? (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <h2 className="text-base font-semibold leading-6 text-slate-900">Wire Trace Path</h2>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getNodeColor(trace.source.type)}`}>
                          {getNodeIcon(trace.source.type)}
                          <div>
                            <div className="text-xs font-medium opacity-75">{trace.source.type.toUpperCase()}</div>
                            <div className="font-semibold">{trace.source.code}</div>
                            <div className="text-xs opacity-75">{trace.source.name}</div>
                            {trace.source.pin && <div className="text-xs font-mono mt-1">Pin: {trace.source.pin}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 mx-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-0.5 bg-slate-300"></div>
                          <div className="mt-2 px-3 py-1 rounded bg-slate-100 text-sm font-mono font-semibold text-slate-700">
                            {trace.wires.join(' / ')}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Trainline(s)</div>
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getNodeColor(trace.destination.type)}`}>
                          <div className="text-left">
                            <div className="text-xs font-medium opacity-75">{trace.destination.type.toUpperCase()}</div>
                            <div className="font-semibold">{trace.destination.code}</div>
                            <div className="text-xs opacity-75">{trace.destination.name}</div>
                            {trace.destination.pin && <div className="text-xs font-mono mt-1">Pin: {trace.destination.pin}</div>}
                          </div>
                          {getNodeIcon(trace.destination.type)}
                        </div>
                      </div>
                    </div>

                    {trace.junctions && trace.junctions.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Intermediate Points</h4>
                        <div className="space-y-3">
                          {trace.junctions.map((j, i) => (
                            <div key={i} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getNodeColor(j.type)} mr-3`}>
                              {getNodeIcon(j.type)}
                              <div>
                                <div className="font-semibold text-sm">{j.code}</div>
                                <div className="text-xs opacity-75">{j.pin}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-slate-600">
                          <p><strong>Source:</strong> {trace.source.description}</p>
                          <p className="mt-1"><strong>Destination:</strong> {trace.destination.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <h2 className="text-base font-semibold leading-6 text-slate-900">Wire Trace Path</h2>
                </div>
                <div className="px-4 py-5 sm:p-6 text-center">
                  <Cable className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-sm font-medium text-slate-900">Detailed Trace Not Available</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Wire {wireNo} does not have a detailed trace path defined yet. This will be populated from the database once connected.
                  </p>
                  {trainline && (
                    <Link href={`/trainlines/${trainline.trainline_no}`} className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline">
                      View Trainline {trainline.trainline_no} instead <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {sourceDrawings.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <h2 className="text-base font-semibold leading-6 text-slate-900">Source VCC Drawings</h2>
                </div>
                <ul role="list" className="divide-y divide-slate-200">
                  {sourceDrawings.map(d => (
                    <li key={d.id} className="py-3 px-4 sm:px-6">
                      <Link href={`/drawings/${d.id}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-mono font-medium text-blue-600">{d.drawing_no}</span>
                            <span className="ml-3 text-sm text-slate-500">Sheet {d.sheet_count}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{d.title}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Trainline Connections</h2>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {trace?.wires.map(w => (
                    <Link key={w} href={`/trainlines/${w}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-mono font-medium text-slate-700">
                      {w}
                    </Link>
                  ))}
                  {!trace?.wires?.length && trainline && (
                    <Link href={`/trainlines/${trainline.trainline_no}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-mono font-medium text-slate-700">
                      {trainline.trainline_no}
                    </Link>
                  )}
                </div>
                {trainline && (
                  <p className="mt-3 text-sm text-slate-600">{trainline.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Wire Properties</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Wire Number</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono text-lg">{wireNo}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Trainline Group</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {trainlineNo && (
                        <Link href={`/trainlines/${trainlineNo}`} className="text-blue-600 hover:underline">
                          {trainlineNo} - {trainline?.name || 'Group'}
                        </Link>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Voltage Class</dt>
                    <dd className="mt-1 text-sm text-slate-900">{trainline?.voltage_domain || '110VDC'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">System</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {trainline && (
                        <Link href={`/systems/${trainline.system_id}`} className="text-blue-600 hover:underline">
                          {trainline.system_id}
                        </Link>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Cross-Connected</dt>
                    <dd className="mt-1">
                      {isCrossConnected ? (
                        <span className="inline-flex items-center rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          No
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Fleet Path</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-2">
                  {['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'].map((car, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded border-2 flex items-center justify-center text-xs font-bold ${
                        car === 'DMC' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                        car === 'TC' ? 'border-green-300 bg-green-50 text-green-700' :
                        'border-orange-300 bg-orange-50 text-orange-700'
                      }`}>
                        {car}
                      </div>
                      <div className="flex-1 h-6 rounded bg-slate-100 relative overflow-hidden">
                        {(i === 0 || i === 5) && trace && (
                          <div className="absolute inset-0 bg-blue-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">Source/Dest</span>
                          </div>
                        )}
                        {i > 0 && i < 5 && trace && (
                          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-slate-600">Via X1</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Related Equipment</h3>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {trace && (
                  <>
                    <li className="py-3 px-4 sm:px-6">
                      <Link href={`/equipment/${trace.source.code}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                        <p className="text-sm font-medium text-slate-900">{trace.source.name}</p>
                        <p className="text-xs text-slate-500">{trace.source.code} - {trace.source.car || 'N/A'}</p>
                      </Link>
                    </li>
                    <li className="py-3 px-4 sm:px-6">
                      <Link href={`/equipment/${trace.destination.code}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                        <p className="text-sm font-medium text-slate-900">{trace.destination.name}</p>
                        <p className="text-xs text-slate-500">{trace.destination.code} - {trace.destination.car || 'N/A'}</p>
                      </Link>
                    </li>
                  </>
                )}
                {!trace && (
                  <li className="py-4 px-6 text-sm text-slate-500">No equipment data available.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}