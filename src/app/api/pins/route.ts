import { NextRequest, NextResponse } from 'next/server';

const STATIC_PIN_REGISTRY = [
  { id: 'p1', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '12', signal_name: 'FORWARD_CMD', wire: '3003', description: 'Forward propulsion command' },
  { id: 'p2', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '13', signal_name: 'REVERSE_CMD', wire: '3004', description: 'Reverse propulsion command' },
  { id: 'p3', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '14', signal_name: 'POWERING_1', wire: '3005', description: 'Powering 1 (X1-19 crossed)' },
  { id: 'p4', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '15', signal_name: 'POWERING_2', wire: '3006', description: 'Powering 2 (X1-20 crossed)' },
  { id: 'p5', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '16', signal_name: 'BRAKE_CMD', wire: '3010', description: 'Braking command' },
  { id: 'p6', connector_code: 'V1-CN1', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '17', signal_name: 'FSB_CMD', wire: '3011', description: 'Full service brake command' },
  { id: 'p7', connector_code: 'V1-CN2', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed feedback' },
  { id: 'p8', connector_code: 'V1-CN2', equipment_code: 'V1', car_code: 'DMC', system_code: 'TRAC', pin_no: '5', signal_name: 'VVVF_FAULT', wire: '1207', description: 'VVVF fault indication' },
  { id: 'p9', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J7', signal_name: 'DOOR_OPEN_LEFT', wire: '6009', description: 'Left door open command output' },
  { id: 'p10', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J8', signal_name: 'DOOR_OPEN_RIGHT', wire: '6046', description: 'Right door open command output' },
  { id: 'p11', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J9', signal_name: 'DOOR_CLOSE_LEFT', wire: '6014', description: 'Left door close command output' },
  { id: 'p12', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'J10', signal_name: 'DOOR_CLOSE_RIGHT', wire: '6051', description: 'Right door close command output' },
  { id: 'p13', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'K4', signal_name: 'PARKING_BRAKE_APPLIED', wire: '4122', description: 'Parking brake applied status input' },
  { id: 'p14', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'K5', signal_name: 'PARKING_BRAKE_RELEASED', wire: '4153', description: 'Parking brake released status input' },
  { id: 'p15', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'L3', signal_name: 'ZERO_SPEED', wire: '6112', description: 'Zero speed signal input' },
  { id: 'p16', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'F4', signal_name: 'VAC1_STATUS', wire: '7050', description: 'Saloon VAC 1 status feedback' },
  { id: 'p17', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'F5', signal_name: 'VAC2_STATUS', wire: '7060', description: 'Saloon VAC 2 status feedback' },
  { id: 'p18', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H2', signal_name: 'DOOR1_STATUS', wire: '6073', description: 'Door 1 open/closed status input' },
  { id: 'p19', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H3', signal_name: 'DOOR2_STATUS', wire: '6076', description: 'Door 2 open/closed status input' },
  { id: 'p20', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'H4', signal_name: 'HSCB_TRIP', wire: '1209', description: 'HSCB trip status input' },
  { id: 'p21', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'M2', signal_name: 'VVVF_FAULT', wire: '1207', description: 'VVVF fault status input' },
  { id: 'p22', connector_code: 'TCMS_RIO1-CN1', equipment_code: 'TCMS_RIO1', car_code: 'MC', system_code: 'TMS', pin_no: 'G2', signal_name: 'RESET', wire: '1032', description: 'System reset command' },
  { id: 'p23', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'F2', signal_name: 'CAB_VAC_FAULT', wire: '7001', description: 'Cab VAC fault status input' },
  { id: 'p24', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'G3', signal_name: 'APS_FAULT', wire: '1215', description: 'APS auxiliary fault input' },
  { id: 'p25', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'G4', signal_name: 'BATTERY_UNDER_VOLT', wire: '5064', description: 'Battery under-voltage warning' },
  { id: 'p26', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'H5', signal_name: 'SHORE_SUPPLY_CMD', wire: '5000', description: 'Shore supply contactor command' },
  { id: 'p27', connector_code: 'TCMS_RIO2-CN1', equipment_code: 'TCMS_RIO2', car_code: 'TC', system_code: 'TMS', pin_no: 'J6', signal_name: 'SIV_CONTACT_STATUS', wire: '5030', description: 'SIV contactor feedback' },
  { id: 'p28', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '3', signal_name: 'DOOR_OPEN_LEFT', wire: '6009', description: 'Left door open input' },
  { id: 'p29', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '4', signal_name: 'DOOR_OPEN_RIGHT', wire: '6046', description: 'Right door open input' },
  { id: 'p30', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '5', signal_name: 'DOOR_CLOSE_LEFT', wire: '6014', description: 'Left door close input' },
  { id: 'p31', connector_code: 'DCU1-CN1', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '6', signal_name: 'DOOR_CLOSE_RIGHT', wire: '6051', description: 'Right door close input' },
  { id: 'p32', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '3', signal_name: 'DOOR_PROVE_1', wire: '6073', description: 'Door 1 proving loop input' },
  { id: 'p33', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '4', signal_name: 'DOOR_PROVE_2', wire: '6076', description: 'Door 2 proving loop input' },
  { id: 'p34', connector_code: 'DCU1-CN2', equipment_code: 'DCU1', car_code: 'MC', system_code: 'DOOR', pin_no: '12', signal_name: 'ZERO_SPEED_IN', wire: '6112', description: 'Zero speed interlock input' },
  { id: 'p35', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '1', signal_name: 'AUX_ON', wire: '1040', description: 'Auxiliary power on command' },
  { id: 'p36', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '2', signal_name: 'SHUTDOWN', wire: '1050', description: 'System shutdown command' },
  { id: 'p37', connector_code: 'APS1-CN1', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '5', signal_name: 'AUX_FAULT', wire: '1215', description: 'Auxiliary system fault output' },
  { id: 'p38', connector_code: 'APS1-CN3', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '1', signal_name: 'SIV_CONTACT1', wire: '5030', description: 'SIV contactor 1 feedback' },
  { id: 'p39', connector_code: 'APS1-CN3', equipment_code: 'APS1', car_code: 'TC', system_code: 'APS', pin_no: '2', signal_name: 'SIV_CONTACT2', wire: '5031', description: 'SIV contactor 2 feedback' },
  { id: 'p40', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '17', signal_name: 'FORWARD', wire: '3003', description: 'Forward trainline' },
  { id: 'p41', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '18', signal_name: 'REVERSE', wire: '3004', description: 'Reverse trainline' },
  { id: 'p42', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '19', signal_name: 'POWERING_1', wire: '3005', description: 'Powering 1 (CROSSED with pin 20)' },
  { id: 'p43', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '20', signal_name: 'POWERING_2', wire: '3006', description: 'Powering 2 (CROSSED with pin 19)' },
  { id: 'p44', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '24', signal_name: 'BRAKE_LOOP', wire: '4024', description: 'Normal brake loop' },
  { id: 'p45', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '42', signal_name: 'EM_LOOP_NORMAL', wire: '4062', description: 'EM brake loop normal path' },
  { id: 'p46', connector_code: 'X1', equipment_code: 'LTEB1', car_code: 'DMC', system_code: 'TRL', pin_no: '44', signal_name: 'EM_LOOP_REDUNDANT', wire: '4103', description: 'EM brake loop redundant path' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectorCode = searchParams.get('connector_code');
  const carType = searchParams.get('car_type');
  const systemCode = searchParams.get('system_code');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    let pins = STATIC_PIN_REGISTRY;

    if (connectorCode) {
      pins = pins.filter(p => p.connector_code.toLowerCase().includes(connectorCode.toLowerCase()));
    }

    if (carType) {
      pins = pins.filter(p => p.car_code === carType);
    }

    if (systemCode) {
      pins = pins.filter(p => p.system_code === systemCode);
    }

    if (search) {
      const q = search.toLowerCase();
      pins = pins.filter(p => 
        p.signal_name.toLowerCase().includes(q) ||
        p.connector_code.toLowerCase().includes(q) ||
        p.pin_no.toLowerCase().includes(q) ||
        p.wire.includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    const connectors = [...new Set(pins.map(p => p.connector_code))].sort();
    const cars = [...new Set(pins.map(p => p.car_code))].sort();
    const systems = [...new Set(pins.map(p => p.system_code))].sort();

    return NextResponse.json({
      pins: pins.slice(0, limit),
      count: pins.length,
      connectors,
      cars,
      systems,
    });
  } catch (error) {
    console.error('Error fetching pins:', error);
    return NextResponse.json({ error: 'Failed to fetch pins' }, { status: 500 });
  }
}