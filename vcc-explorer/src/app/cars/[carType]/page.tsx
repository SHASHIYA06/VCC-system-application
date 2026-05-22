import Link from 'next/link';
import { EQUIPMENT_REGISTRY, VCC_DRAWING_REGISTRY } from '@/types/index';
import { ArrowLeft, Cpu, Cable, FileText, ChevronRight, Box, Zap, Shield } from 'lucide-react';

const CAR_CONNECTORS: Record<string, { code: string; type: string; pin_count: number; description: string; equipment: string; drawing: string }[]> = {
  DMC: [
    { code: 'X1', type: '74P', pin_count: 74, description: 'Inter-car control jumper', equipment: 'LTEB1', drawing: '942-38409' },
    { code: 'X2', type: '74PW', pin_count: 74, description: 'Inter-car control + power jumper', equipment: 'LTEB1', drawing: '942-38409' },
    { code: 'X3', type: '11P', pin_count: 11, description: '415V AC power jumper', equipment: 'LTJB1', drawing: '942-38409' },
    { code: 'X4', type: '3P', pin_count: 3, description: '110V DC power jumper', equipment: 'LTJB1', drawing: '942-38409' },
    { code: 'CN1', type: 'VVVF', pin_count: 0, description: 'VVVF inverter CN1 - propulsion commands', equipment: 'V1', drawing: '942-58120' },
    { code: 'CN2', type: 'VVVF', pin_count: 0, description: 'VVVF inverter CN2 - mode signals', equipment: 'V1', drawing: '942-58120' },
    { code: 'X6', type: 'HT', pin_count: 0, description: 'High tension power connector', equipment: 'HTEB1', drawing: '942-38103' },
    { code: 'X7', type: 'HT_EARTH', pin_count: 0, description: 'High tension earth connector', equipment: 'HTEB1', drawing: '942-38103' },
  ],
  TC: [
    { code: 'X1', type: '74P', pin_count: 74, description: 'Inter-car control jumper', equipment: 'LTEB2', drawing: '942-38509' },
    { code: 'X2', type: '74PW', pin_count: 74, description: 'Inter-car control + power jumper', equipment: 'LTEB2', drawing: '942-38509' },
    { code: 'X3', type: '11P', pin_count: 11, description: '415V AC power jumper', equipment: 'LTJB1', drawing: '942-38509' },
    { code: 'X4', type: '3P', pin_count: 3, description: '110V DC power jumper', equipment: 'LTJB1', drawing: '942-38509' },
    { code: 'CN1', type: 'APS', pin_count: 0, description: 'APS unit main connector', equipment: 'APS1', drawing: '942-58130' },
    { code: 'CN2', type: 'APS', pin_count: 0, description: 'APS unit control connector', equipment: 'APS1', drawing: '942-58130' },
    { code: 'CN3', type: 'SIV', pin_count: 0, description: 'Static inverter contactor', equipment: 'APS1', drawing: '942-58130' },
    { code: 'CN1', type: 'TCMS', pin_count: 0, description: 'TCMS RIO unit connector', equipment: 'TCMS_RIO2', drawing: '942-38510' },
    { code: 'CN5', type: 'BCU', pin_count: 0, description: 'Brake control unit connector', equipment: 'BCU2', drawing: '942-58129' },
  ],
  MC: [
    { code: 'X1', type: '74P', pin_count: 74, description: 'Inter-car control jumper', equipment: 'LTEB3', drawing: '942-38609' },
    { code: 'X2', type: '74PW', pin_count: 74, description: 'Inter-car control + power jumper', equipment: 'LTEB3', drawing: '942-38609' },
    { code: 'X3', type: '11P', pin_count: 11, description: '415V AC power jumper', equipment: 'LTEB3', drawing: '942-38609' },
    { code: 'X4', type: '3P', pin_count: 3, description: '110V DC power jumper', equipment: 'LTEB3', drawing: '942-38609' },
    { code: 'CN1', type: 'VVVF', pin_count: 0, description: 'VVVF inverter CN1 - propulsion commands', equipment: 'V2', drawing: '942-58120' },
    { code: 'CN2', type: 'VVVF', pin_count: 0, description: 'VVVF inverter CN2 - mode signals', equipment: 'V2', drawing: '942-58120' },
    { code: 'CN1', type: 'TCMS', pin_count: 0, description: 'TCMS RIO unit connector', equipment: 'TCMS_RIO1', drawing: '942-38610' },
    { code: 'CN1', type: 'DCU', pin_count: 0, description: 'Door control unit', equipment: 'DCU1', drawing: '942-58137' },
    { code: 'CN1', type: 'VAC', pin_count: 0, description: 'VAC unit connector', equipment: 'VAC1', drawing: '942-58144' },
    { code: 'X5', type: 'CCTV', pin_count: 0, description: 'CCTV/TCMS/EBCU connectivity', equipment: 'ETH_SW1', drawing: '942-58154' },
    { code: 'X10', type: 'CBTC', pin_count: 0, description: 'CBTC dedicated connector', equipment: 'TCMS_CN1', drawing: '942-58152' },
  ],
  CAB: [
    { code: 'CN1', type: 'PANEL', pin_count: 0, description: 'Operating panel main connector', equipment: 'OP_PNL1', drawing: '942-58107' },
    { code: 'CN2', type: 'PANEL', pin_count: 0, description: 'Indicator panel connector', equipment: 'IND_PNL1', drawing: '942-58109' },
    { code: 'CN3', type: 'VAC', pin_count: 0, description: 'Cab VAC unit connector', equipment: 'CAB_VAC1', drawing: '942-58143' },
    { code: 'CN4', type: 'MCB', pin_count: 0, description: 'MCB panel connector', equipment: 'MCB_PNL1', drawing: '942-58110' },
  ],
};

const CAR_DRAWINGS: Record<string, { drawing_no: string; title: string; type: string; description: string }[]> = {
  DMC: [
    { drawing_no: '942-38309', title: 'DMC Underframe PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'Underframe equipment connectors and pin assignments' },
    { drawing_no: '942-38609', title: 'MC Underframe PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'MC underframe PIN diagram (shared format)' },
    { drawing_no: '942-38103', title: 'HV System', type: 'SCHEMATIC', description: 'High tension system schematic' },
    { drawing_no: '942-58119', title: 'Speed Control', type: 'SCHEMATIC', description: 'Traction speed control circuit' },
    { drawing_no: '942-58123', title: 'Compressor Control', type: 'SCHEMATIC', description: 'Brake compressor control' },
    { drawing_no: '942-58125', title: 'Emergency Brake', type: 'SCHEMATIC', description: 'Emergency brake circuit' },
  ],
  TC: [
    { drawing_no: '942-38509', title: 'TC Underframe PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'TC underframe equipment connectors and pin assignments' },
    { drawing_no: '942-38409', title: 'TC Ceiling PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'TC ceiling equipment connectors' },
    { drawing_no: '942-58130', title: 'APS - Auxiliary Power Supply', type: 'SCHEMATIC', description: 'Auxiliary power supply schematic' },
    { drawing_no: '942-58131', title: 'AC 415V Shore Supply', type: 'SCHEMATIC', description: 'Shore supply connection' },
    { drawing_no: '942-58129', title: 'Brake Control - TC', type: 'SCHEMATIC', description: 'TC car brake control' },
    { drawing_no: '942-58132', title: 'Battery Control', type: 'SCHEMATIC', description: 'Battery monitoring and control' },
  ],
  MC: [
    { drawing_no: '942-38609', title: 'MC Underframe PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'MC underframe equipment connectors and pin assignments' },
    { drawing_no: '942-38610', title: 'MC Ceiling PIN Drawing', type: 'PIN_ASSIGNMENT', description: 'MC ceiling equipment connectors' },
    { drawing_no: '942-58137', title: 'Saloon Door Supply Voltage', type: 'SCHEMATIC', description: 'Door system supply voltage' },
    { drawing_no: '942-58138', title: 'Left Door Operation', type: 'SCHEMATIC', description: 'Left side door operation circuit' },
    { drawing_no: '942-58139', title: 'Right Door Operation', type: 'SCHEMATIC', description: 'Right side door operation circuit' },
    { drawing_no: '942-58144', title: 'Saloon VAC Power', type: 'SCHEMATIC', description: 'Saloon VAC power circuit' },
    { drawing_no: '942-58154', title: 'CCTV', type: 'SCHEMATIC', description: 'Closed circuit television' },
    { drawing_no: '942-58152', title: 'CBTC', type: 'SCHEMATIC', description: 'Communication based train control' },
    { drawing_no: '942-58146', title: 'TMS Interface 1 to 4', type: 'SCHEMATIC', description: 'TCMS interface sheets' },
  ],
  CAB: [
    { drawing_no: '942-58107', title: 'Controlling Cab', type: 'SCHEMATIC', description: 'Head control relay, tail control relay logic' },
    { drawing_no: '942-58108', title: 'Start-up Relay', type: 'SCHEMATIC', description: 'Startup relay sequencing' },
    { drawing_no: '942-58109', title: 'System Status Indication', type: 'SCHEMATIC', description: 'System status indicators' },
    { drawing_no: '942-58143', title: 'Cab VAC', type: 'SCHEMATIC', description: 'Cab air conditioning' },
  ],
};

const CAR_ZONES = [
  { id: 'UNDERFRAME', name: 'Underframe', icon: Shield, description: 'Equipment mounted on underframe - VVVF, BCU, APS, brake valves' },
  { id: 'CEILING', name: 'Ceiling', icon: Box, description: 'Ceiling mounted equipment - TCMS RIO, DCU, VAC, ETH switch' },
  { id: 'CAB', name: 'Cab Desk', icon: Cpu, description: 'Operating and indicator panels, cab VAC' },
  { id: 'BOGIE', name: 'Bogie', icon: Zap, description: 'Bogie-mounted components - traction motor, speed sensor, anti-skid' },
  { id: 'INTERIOR', name: 'Interior', icon: Box, description: 'Interior equipment - PIS displays, emergency devices' },
];

function getCarColor(carType: string) {
  switch (carType) {
    case 'DMC': return { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200' };
    case 'TC': return { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200' };
    case 'MC': return { bg: 'bg-orange-600', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200' };
    case 'CAB': return { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200' };
    default: return { bg: 'bg-slate-600', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200' };
  }
}

function getPositionInFormation(carType: string, type: 'DMC' | 'TC' | 'MC' | 'CAB'): number[] {
  const formation = ['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'];
  return formation.map((c, i) => c === carType ? i + 1 : -1).filter(p => p > 0);
}

export default async function CarDetailPage({ params }: { params: { carType: string } }) {
  const carType = params.carType.toUpperCase() as 'DMC' | 'TC' | 'MC' | 'CAB';
  const colors = getCarColor(carType);

  if (!['DMC', 'TC', 'MC', 'CAB'].includes(carType)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/cars" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Cars
          </Link>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12 text-center">
            <Box className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">Car Type Not Found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Car type "{params.carType}" is not recognized. Valid types are: DMC, TC, MC, CAB.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const equipment = EQUIPMENT_REGISTRY[carType] || [];
  const connectors = CAR_CONNECTORS[carType] || [];
  const drawings = CAR_DRAWINGS[carType] || [];
  const positions = getPositionInFormation(carType, carType);

  const equipmentByZone = equipment.reduce((acc, eq) => {
    const zone = eq.location_hint?.includes('Ceiling') ? 'CEILING' :
                 eq.location_hint?.includes('Cab') ? 'CAB' :
                 eq.location_hint?.includes('Bogie') ? 'BOGIE' :
                 eq.location_hint?.includes('Interior') ? 'INTERIOR' : 'UNDERFRAME';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(eq);
    return acc;
  }, {} as Record<string, typeof equipment>);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cars" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Cars
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className={`flex items-center justify-center w-20 h-20 rounded-2xl ${colors.bg} text-white shadow-lg`}>
              <span className="text-3xl font-bold">{carType}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">
                {carType === 'DMC' ? 'Driving Motor Car' :
                 carType === 'TC' ? 'Trailer Car' :
                 carType === 'MC' ? 'Motor Car' : 'Cab'} - {carType}
              </h1>
              <p className="mt-1 text-slate-600">
                {carType === 'DMC' ? 'Driving motor car with cab at one end, VVVF inverter, pantograph' :
                 carType === 'TC' ? 'Trailer car with auxiliary power supply, battery, TCMS RIO' :
                 carType === 'MC' ? 'Motor car with VVVF inverter, door control, TCMS RIO' :
                 'Operating cab with control panels and status indicators'}
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                <span>Position in formation: {positions.map(p => `#${p}`).join(', ')}</span>
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {equipment.length} Equipment
                </span>
                <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {connectors.length} Connectors
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Equipment by Zone</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {CAR_ZONES.map(zone => {
                    const zoneEquipment = equipmentByZone[zone.id] || [];
                    if (zoneEquipment.length === 0) return null;
                    const ZoneIcon = zone.icon;
                    return (
                      <div key={zone.id} className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <ZoneIcon className="h-5 w-5 text-slate-500" />
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">{zone.name}</h3>
                            <p className="text-xs text-slate-500">{zone.description}</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-400">{zoneEquipment.length} items</span>
                        </div>
                        <ul role="list" className="divide-y divide-slate-200">
                          {zoneEquipment.map(eq => (
                            <li key={eq.id} className="flex items-center justify-between gap-x-6 py-3 px-4 hover:bg-slate-50">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-x-3">
                                  <span className="text-sm font-mono font-semibold text-slate-900">{eq.equipment_code}</span>
                                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors.light} ${colors.text}`}>
                                    {eq.equipment_type}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500 truncate">{eq.equipment_name}</p>
                              </div>
                              <Link
                                href={`/equipment/${eq.equipment_code}`}
                                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                              >
                                View
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Connectors & Jumpers</h2>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {connectors.map((cn, i) => (
                  <li key={i} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-sm font-mono font-bold text-slate-700">
                          {cn.code}
                        </span>
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${colors.light} ${colors.text}`}>
                          {cn.type}
                        </span>
                        {cn.pin_count > 0 && (
                          <span className="text-xs text-slate-500">{cn.pin_count}P</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 truncate">{cn.description}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Equipment: {cn.equipment}</p>
                    </div>
                    <div className="flex flex-none items-center gap-x-4">
                      <span className="text-xs text-slate-400 font-mono">{cn.drawing}</span>
                      <Link
                        href={`/drawings/${cn.drawing}`}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Drawing
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Fleet Formation</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center gap-2">
                  {['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'].map((c, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-14 rounded border-2 flex items-center justify-center text-xs font-bold ${
                        c === 'DMC' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                        c === 'TC' ? 'border-green-300 bg-green-50 text-green-700' :
                        'border-orange-300 bg-orange-50 text-orange-700'
                      } ${c === carType ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
                        {c}
                      </div>
                      <span className="mt-1 text-xs text-slate-500">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Key Drawings</h3>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {drawings.map((d, i) => (
                  <li key={i} className="py-3 px-4 sm:px-6">
                    <Link href={`/drawings/${d.drawing_no}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-medium text-blue-600">{d.drawing_no}</span>
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                          d.type === 'PIN_ASSIGNMENT' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {d.type === 'PIN_ASSIGNMENT' ? 'PIN' : 'SCH'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{d.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">PIN Drawing Reference</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {carType === 'DMC' && (
                    <>
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="text-xs font-medium text-blue-800">UNDERFRAME</div>
                        <div className="text-sm font-mono text-blue-900 mt-1">942-38309</div>
                      </div>
                    </>
                  )}
                  {carType === 'TC' && (
                    <>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <div className="text-xs font-medium text-green-800">UNDERFRAME</div>
                        <div className="text-sm font-mono text-green-900 mt-1">942-38509</div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                        <div className="text-xs font-medium text-green-800">CEILING</div>
                        <div className="text-sm font-mono text-green-900 mt-1">942-38409</div>
                      </div>
                    </>
                  )}
                  {carType === 'MC' && (
                    <>
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                        <div className="text-xs font-medium text-orange-800">UNDERFRAME</div>
                        <div className="text-sm font-mono text-orange-900 mt-1">942-38609</div>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                        <div className="text-xs font-medium text-orange-800">CEILING</div>
                        <div className="text-sm font-mono text-orange-900 mt-1">942-38610</div>
                      </div>
                    </>
                  )}
                  {carType === 'CAB' && (
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="text-xs font-medium text-purple-800">CAB DESK</div>
                      <div className="text-sm font-mono text-purple-900 mt-1">942-38107</div>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  PIN drawings show physical connector pin assignments, wire numbers, and signal names for each zone.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Stats</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">Total Equipment</dt>
                    <dd className="text-sm font-semibold text-slate-900">{equipment.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">Total Connectors</dt>
                    <dd className="text-sm font-semibold text-slate-900">{connectors.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">VCC Drawings</dt>
                    <dd className="text-sm font-semibold text-slate-900">{drawings.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-slate-500">Positions in Train</dt>
                    <dd className="text-sm font-semibold text-slate-900">{positions.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}