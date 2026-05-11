import Link from 'next/link';
import { TRAINLINE_REGISTRY, EQUIPMENT_REGISTRY, VCC_DRAWING_REGISTRY } from '@/types/index';
import { ArrowLeft, Cpu, Cable, ChevronRight, Zap, Info, ArrowRight } from 'lucide-react';

const TCMS_POINTS: Record<string, {
  point_code: string;
  rio_unit: string;
  connector_code: string;
  pin_no: string;
  signal_type: 'DI' | 'DO' | 'AI' | 'AO';
  signal_name: string;
  description: string;
  system_code: string;
  car_type: string;
  function: string;
  related_trainlines: string[];
  related_equipment: string[];
}> = {
  'U15-J7': { point_code: 'U15-J7', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: '7', signal_type: 'DO', signal_name: 'DOOR_OPEN_LEFT', description: 'Left door open command output', system_code: 'DOOR', car_type: 'MC', function: 'Commands left door to open', related_trainlines: ['6009'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U15-J8': { point_code: 'U15-J8', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: '8', signal_type: 'DO', signal_name: 'DOOR_OPEN_RIGHT', description: 'Right door open command output', system_code: 'DOOR', car_type: 'MC', function: 'Commands right door to open', related_trainlines: ['6046'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U15-J9': { point_code: 'U15-J9', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: '9', signal_type: 'DO', signal_name: 'DOOR_CLOSE_LEFT', description: 'Left door close command output', system_code: 'DOOR', car_type: 'MC', function: 'Commands left door to close', related_trainlines: ['6014'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U15-J10': { point_code: 'U15-J10', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: '10', signal_type: 'DO', signal_name: 'DOOR_CLOSE_RIGHT', description: 'Right door close command output', system_code: 'DOOR', car_type: 'MC', function: 'Commands right door to close', related_trainlines: ['6051'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U15-K4': { point_code: 'U15-K4', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'K4', signal_type: 'DI', signal_name: 'PARKING_BRAKE_APPLIED', description: 'Parking brake applied status input', system_code: 'BRAKE', car_type: 'MC', function: 'Monitors parking brake applied state', related_trainlines: ['4122'], related_equipment: ['PBMV1', 'TCMS_RIO1'] },
  'U15-K5': { point_code: 'U15-K5', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'K5', signal_type: 'DI', signal_name: 'PARKING_BRAKE_RELEASED', description: 'Parking brake released status input', system_code: 'BRAKE', car_type: 'MC', function: 'Monitors parking brake released state', related_trainlines: ['4153'], related_equipment: ['PBMV1', 'TCMS_RIO1'] },
  'U15-L3': { point_code: 'U15-L3', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'L3', signal_type: 'DI', signal_name: 'ZERO_SPEED', description: 'Zero speed signal input', system_code: 'DOOR', car_type: 'MC', function: 'Enables door opening when train is stopped', related_trainlines: ['6112'], related_equipment: ['V1', 'TCMS_RIO1'] },
  'U15-F4': { point_code: 'U15-F4', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'F4', signal_type: 'DI', signal_name: 'VAC1_STATUS', description: 'Saloon VAC 1 status input', system_code: 'VAC', car_type: 'MC', function: 'Monitors VAC unit 1 operational status', related_trainlines: ['7050'], related_equipment: ['VAC1', 'TCMS_RIO1'] },
  'U15-F5': { point_code: 'U15-F5', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'F5', signal_type: 'DI', signal_name: 'VAC2_STATUS', description: 'Saloon VAC 2 status input', system_code: 'VAC', car_type: 'MC', function: 'Monitors VAC unit 2 operational status', related_trainlines: ['7060'], related_equipment: ['VAC1', 'TCMS_RIO1'] },
  'U15-D2': { point_code: 'U15-D2', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'D2', signal_type: 'DO', signal_name: 'BRAKE_NORMAL', description: 'Normal brake command output', system_code: 'BRAKE', car_type: 'MC', function: 'Commands normal braking', related_trainlines: ['4024'], related_equipment: ['BCU3', 'TCMS_RIO1'] },
  'U15-D3': { point_code: 'U15-D3', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'D3', signal_type: 'DO', signal_name: 'EMERGENCY_BRAKE', description: 'Emergency brake command output', system_code: 'BRAKE', car_type: 'MC', function: 'Commands emergency braking', related_trainlines: ['4062'], related_equipment: ['BCU3', 'TCMS_RIO1'] },
  'U15-H2': { point_code: 'U15-H2', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'H2', signal_type: 'DI', signal_name: 'DOOR1_STATUS', description: 'Door 1 status input', system_code: 'DOOR', car_type: 'MC', function: 'Monitors door 1 open/closed state', related_trainlines: ['6009', '6073'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U15-H3': { point_code: 'U15-H3', rio_unit: 'TCMS_RIO1', connector_code: 'CN1', pin_no: 'H3', signal_type: 'DI', signal_name: 'DOOR2_STATUS', description: 'Door 2 status input', system_code: 'DOOR', car_type: 'MC', function: 'Monitors door 2 open/closed state', related_trainlines: ['6046', '6076'], related_equipment: ['DCU1', 'TCMS_RIO1'] },
  'U25-F2': { point_code: 'U25-F2', rio_unit: 'TCMS_RIO2', connector_code: 'CN1', pin_no: 'F2', signal_type: 'DI', signal_name: 'CAB_VAC_FAULT', description: 'Cab VAC fault status input', system_code: 'VAC', car_type: 'TC', function: 'Monitors cab VAC fault condition', related_trainlines: ['7001'], related_equipment: ['CAB_VAC1', 'TCMS_RIO2'] },
  'U25-G3': { point_code: 'U25-G3', rio_unit: 'TCMS_RIO2', connector_code: 'CN1', pin_no: 'G3', signal_type: 'DI', signal_name: 'APS_FAULT', description: 'APS auxiliary fault status', system_code: 'APS', car_type: 'TC', function: 'Monitors auxiliary power fault', related_trainlines: ['1215'], related_equipment: ['APS1', 'TCMS_RIO2'] },
  'U25-G4': { point_code: 'U25-G4', rio_unit: 'TCMS_RIO2', connector_code: 'CN1', pin_no: 'G4', signal_type: 'DI', signal_name: 'BATTERY_UNDER_VOLT', description: 'Battery under-voltage warning', system_code: 'APS', car_type: 'TC', function: 'Monitors battery voltage level', related_trainlines: ['5064'], related_equipment: ['BATT1', 'TCMS_RIO2'] },
  'U25-H5': { point_code: 'U25-H5', rio_unit: 'TCMS_RIO2', connector_code: 'CN1', pin_no: 'H5', signal_type: 'DO', signal_name: 'SHORE_SUPPLY_CMD', description: 'Shore supply contactor command', system_code: 'APS', car_type: 'TC', function: 'Commands shore supply connection', related_trainlines: ['5000'], related_equipment: ['SSB1', 'TCMS_RIO2'] },
  'U25-J6': { point_code: 'U25-J6', rio_unit: 'TCMS_RIO2', connector_code: 'CN1', pin_no: 'J6', signal_type: 'DI', signal_name: 'SIV_CONTACT_STATUS', description: 'SIV contactor status feedback', system_code: 'APS', car_type: 'TC', function: 'Monitors SIV contactor state', related_trainlines: ['5030', '5031'], related_equipment: ['APS1', 'TCMS_RIO2'] },
};

const SIGNAL_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  DI: { color: 'text-blue-700', bg: 'bg-blue-50', label: 'Digital Input' },
  DO: { color: 'text-green-700', bg: 'bg-green-50', label: 'Digital Output' },
  AI: { color: 'text-purple-700', bg: 'bg-purple-50', label: 'Analog Input' },
  AO: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Analog Output' },
};

export default async function TcmsPointDetailPage({ params }: { params: { pointCode: string } }) {
  const pointCode = params.pointCode.toUpperCase();
  const point = TCMS_POINTS[pointCode];

  if (!point) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/tcms" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to TCMS
          </Link>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12 text-center">
            <Cpu className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">TCMS Point Not Found</h3>
            <p className="mt-2 text-sm text-slate-500">
              TCMS point "{pointCode}" is not in the registry. Point codes follow format: U15-J7, U25-F2, etc.
            </p>
            <Link href="/tcms" className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Browse TCMS Points
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const signalConfig = SIGNAL_TYPE_CONFIG[point.signal_type];
  const relatedDrawings = Object.values(VCC_DRAWING_REGISTRY)
    .filter(d => d.system_code === point.system_code)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/tcms" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to TCMS
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg">
              <div className="text-center">
                <div className="text-xs font-medium opacity-75">TCMS</div>
                <div className="text-lg font-bold">{point.point_code}</div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold leading-tight text-slate-900">{point.signal_name}</h1>
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${signalConfig.bg} ${signalConfig.color}`}>
                  {point.signal_type}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{point.description}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                <span>RIO Unit: <Link href={`/equipment/${point.rio_unit}`} className="text-blue-600 hover:underline">{point.rio_unit}</Link></span>
                <span>Car: {point.car_type}</span>
                <span>System: <Link href={`/systems/${point.system_code}`} className="text-blue-600 hover:underline">{point.system_code}</Link></span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Point Details</h2>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Point Code</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono text-lg">{point.point_code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Signal Type</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${signalConfig.bg} ${signalConfig.color}`}>
                        {signalConfig.label}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Connector</dt>
                    <dd className="mt-1 text-sm text-slate-900">{point.connector_code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Pin Number</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono">{point.pin_no}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">RIO Unit</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <Link href={`/equipment/${point.rio_unit}`} className="text-blue-600 hover:underline">
                        {point.rio_unit}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Car Type</dt>
                    <dd className="mt-1 text-sm text-slate-900">{point.car_type}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-slate-500">Function</dt>
                    <dd className="mt-1 text-sm text-slate-900">{point.function}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Signal Flow</h2>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex-1 p-4 rounded-lg border-2 ${signalConfig.bg} ${signalConfig.color}`}>
                    <div className="text-xs font-medium opacity-75 mb-1">SOURCE</div>
                    <div className="font-semibold">{point.rio_unit}</div>
                    <div className="text-sm">{point.connector_code} - Pin {point.pin_no}</div>
                    <div className="mt-2 text-xs opacity-75">
                      {point.signal_type === 'DI' ? 'Receives' : point.signal_type === 'DO' ? 'Sends' : 'Signal'} signal: {point.signal_name}
                    </div>
                  </div>
                  <div className="flex-shrink-0 mx-4">
                    <ArrowRight className={`h-6 w-6 ${signalConfig.color}`} />
                  </div>
                  <div className="flex-1 p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                    <div className="text-xs font-medium text-slate-500 mb-1">DESTINATION</div>
                    <div className="font-semibold text-slate-700">{point.related_equipment[0]}</div>
                    <div className="text-sm text-slate-500">Connected equipment</div>
                    <div className="mt-2 text-xs text-slate-400">
                      Via: {point.signal_type === 'DO' ? 'DO_' : 'DI_'}trainline
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Related Trainlines</h4>
                  <div className="flex items-center gap-3">
                    {point.related_trainlines.map(tl => (
                      <Link key={tl} href={`/trainlines/${tl}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm font-mono font-medium text-slate-700">
                        {tl}
                      </Link>
                    ))}
                    <span className="text-sm text-slate-500">
                      ({TRAINLINE_REGISTRY[parseInt(point.related_trainlines[0])]?.name || 'Signal'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Related Equipment</h2>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {point.related_equipment.map(eq => (
                  <li key={eq} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-3">
                        <Cpu className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-mono font-semibold text-slate-900">{eq}</span>
                      </div>
                    </div>
                    <Link
                      href={`/equipment/${eq}`}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Related VCC Drawings</h2>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {relatedDrawings.map(d => (
                  <li key={d.id} className="py-3 px-4 sm:px-6">
                    <Link href={`/drawings/${d.id}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-medium text-blue-600">{d.drawing_no}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{d.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">TCMS Architecture</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center">
                  <div className="w-full">
                    <div className="p-3 rounded-lg bg-slate-100 border-2 border-slate-300 text-center">
                      <div className="text-xs font-medium text-slate-600">CENTRAL TCMS</div>
                      <div className="text-sm font-bold text-slate-800">TMS CPU</div>
                    </div>
                    <div className="flex items-center justify-center my-3">
                      <div className="w-0.5 h-6 bg-slate-300"></div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-200 text-center">
                        <div className="text-xs font-medium text-blue-600">MC RIO</div>
                        <div className="text-xs font-mono text-blue-800">TCMS_RIO1</div>
                      </div>
                      <div className="flex-1 p-2 rounded-lg bg-green-50 border border-green-200 text-center">
                        <div className="text-xs font-medium text-green-600">TC RIO</div>
                        <div className="text-xs font-mono text-green-800">TCMS_RIO2</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-3">
                      <div className="w-0.5 h-6 bg-slate-300"></div>
                    </div>
                    <div className={`p-3 rounded-lg ${signalConfig.bg} border-2 ${signalConfig.color.replace('text-', 'border-')} text-center`}>
                      <div className="text-xs font-medium opacity-75">THIS POINT</div>
                      <div className="text-sm font-bold font-mono">{point.point_code}</div>
                      <div className="text-xs opacity-75">{point.signal_type} - {point.signal_name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Quick Reference</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Signal Name</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono">{point.signal_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Location</dt>
                    <dd className="mt-1 text-sm text-slate-900">{point.rio_unit} / {point.connector_code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">System</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <Link href={`/systems/${point.system_code}`} className="text-blue-600 hover:underline">
                        {point.system_code}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Pin</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono">{point.pin_no}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Trainlines</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {point.related_trainlines.map(tl => (
                        <Link key={tl} href={`/trainlines/${tl}`} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-xs font-mono font-medium text-slate-700 hover:bg-slate-200">
                          {tl}
                        </Link>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Pin Assignment</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-20 rounded-lg border-2 border-slate-300 bg-slate-50 flex items-center justify-center">
                      <div className="text-xs font-mono text-slate-600">{point.connector_code}</div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${signalConfig.bg} border-2 ${signalConfig.color.replace('text-', 'border-')} flex items-center justify-center text-xs font-bold`}>
                      {point.pin_no}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-xs text-slate-500">
                  Pin {point.pin_no} on {point.connector_code} (TCMS RIO connector)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}