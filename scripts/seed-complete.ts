import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DEVICE_SPECS: Record<string, Array<{ code: string; name: string; value: string; unit: string; category: string }>> = {
  'VVVF': [
    { code: 'RATED_POWER', name: 'Rated Power', value: '1500', unit: 'kW', category: 'POWER' },
    { code: 'INPUT_VOLTAGE', name: 'Input Voltage', value: '750', unit: 'VDC', category: 'ELECTRICAL' },
    { code: 'OUTPUT_VOLTAGE', name: 'Output Voltage', value: '0-590', unit: 'VAC', category: 'ELECTRICAL' },
    { code: 'MAX_CURRENT', name: 'Max Current', value: '1200', unit: 'A', category: 'ELECTRICAL' },
    { code: 'SWITCHING_FREQ', name: 'Switching Frequency', value: '2000', unit: 'Hz', category: 'CONTROL' },
    { code: 'WEIGHT', name: 'Weight', value: '850', unit: 'kg', category: 'MECHANICAL' },
    { code: 'PROTECTION', name: 'Protection Class', value: 'IP54', unit: '', category: 'MECHANICAL' },
  ],
  'HSCB': [
    { code: 'RATED_VOLTAGE', name: 'Rated Voltage', value: '750', unit: 'VDC', category: 'ELECTRICAL' },
    { code: 'RATED_CURRENT', name: 'Rated Current', value: '3000', unit: 'A', category: 'ELECTRICAL' },
    { code: 'BREAKING_CAP', name: 'Breaking Capacity', value: '50000', unit: 'A', category: 'ELECTRICAL' },
  ],
  'BCU': [
    { code: 'BRAKE_FORCE', name: 'Max Brake Force', value: '200', unit: 'kN', category: 'MECHANICAL' },
    { code: 'RESPONSE_TIME', name: 'Response Time', value: '<150', unit: 'ms', category: 'PERFORMANCE' },
    { code: 'CONTROL_VOLTAGE', name: 'Control Voltage', value: '110', unit: 'VDC', category: 'ELECTRICAL' },
  ],
  'DCU': [
    { code: 'MOTOR_POWER', name: 'Door Motor Power', value: '200', unit: 'W', category: 'POWER' },
    { code: 'OPERATING_VOLTAGE', name: 'Operating Voltage', value: '110', unit: 'VDC', category: 'ELECTRICAL' },
    { code: 'OPEN_TIME', name: 'Door Open Time', value: '3.0', unit: 's', category: 'PERFORMANCE' },
    { code: 'CLOSE_TIME', name: 'Door Close Time', value: '3.0', unit: 's', category: 'PERFORMANCE' },
    { code: 'FORCE_LIMIT', name: 'Closing Force Limit', value: '150', unit: 'N', category: 'SAFETY' },
  ],
  'VAC': [
    { code: 'COOLING_CAPACITY', name: 'Cooling Capacity', value: '35', unit: 'kW', category: 'THERMAL' },
    { code: 'HEATING_CAPACITY', name: 'Heating Capacity', value: '20', unit: 'kW', category: 'THERMAL' },
    { code: 'SUPPLY_VOLTAGE', name: 'Supply Voltage', value: '415', unit: 'VAC', category: 'ELECTRICAL' },
    { code: 'REFRIGERANT', name: 'Refrigerant', value: 'R-410A', unit: '', category: 'MECHANICAL' },
  ],
  'APS': [
    { code: 'INPUT_VOLTAGE', name: 'Input Voltage', value: '750', unit: 'VDC', category: 'ELECTRICAL' },
    { code: 'OUTPUT_VOLTAGE', name: 'Output Voltage', value: '415', unit: 'VAC', category: 'ELECTRICAL' },
    { code: 'OUTPUT_POWER', name: 'Output Power', value: '120', unit: 'kVA', category: 'POWER' },
  ],
  'TCMS_RIO': [
    { code: 'DIGITAL_INPUTS', name: 'Digital Inputs', value: '64', unit: '', category: 'INTERFACE' },
    { code: 'DIGITAL_OUTPUTS', name: 'Digital Outputs', value: '32', unit: '', category: 'INTERFACE' },
    { code: 'ANALOG_INPUTS', name: 'Analog Inputs', value: '8', unit: '', category: 'INTERFACE' },
    { code: 'COMM_PROTOCOL', name: 'Communication Protocol', value: 'Ethernet/IP', unit: '', category: 'COMMUNICATION' },
  ],
  'CAB_VAC': [
    { code: 'COOLING_CAPACITY', name: 'Cooling Capacity', value: '5', unit: 'kW', category: 'THERMAL' },
    { code: 'HEATING_CAPACITY', name: 'Heating Capacity', value: '3', unit: 'kW', category: 'THERMAL' },
    { code: 'SUPPLY_VOLTAGE', name: 'Supply Voltage', value: '415', unit: 'VAC', category: 'ELECTRICAL' },
  ],
};

function getSpecs(deviceName: string, deviceType: string | null) {
  const upper = ((deviceName || '') + ' ' + (deviceType || '')).toUpperCase();
  for (const [key, val] of Object.entries(DEVICE_SPECS)) {
    if (upper.includes(key)) return val;
  }
  if (upper.includes('RELAY')) {
    return [{ code: 'COIL_VOLTAGE', name: 'Coil Voltage', value: '110', unit: 'VDC', category: 'ELECTRICAL' },
      { code: 'CONTACT_RATING', name: 'Contact Rating', value: '10', unit: 'A', category: 'ELECTRICAL' }];
  }
  if (upper.includes('MCB') || upper.includes('CIRCUIT_BREAKER')) {
    return [{ code: 'RATED_CURRENT', name: 'Rated Current', value: '16', unit: 'A', category: 'ELECTRICAL' },
      { code: 'RATED_VOLTAGE', name: 'Rated Voltage', value: '240', unit: 'VAC', category: 'ELECTRICAL' }];
  }
  return [{ code: 'OPERATING_VOLTAGE', name: 'Operating Voltage', value: '110', unit: 'VDC', category: 'ELECTRICAL' }];
}

async function main() {
  console.log('=== SEEDING DEVICE SPECS ===');
  const devices = await prisma.device.findMany({ select: { id: true, deviceName: true, deviceType: true } });
  const existing = await prisma.deviceSpecification.findMany({ select: { deviceId: true, specCode: true } });
  const existingSet = new Set(existing.map(e => `${e.deviceId}|${e.specCode}`));
  
  let created = 0;
  for (const device of devices) {
    const specs = getSpecs(device.deviceName, device.deviceType);
    for (const spec of specs) {
      const key = `${device.id}|${spec.code}`;
      if (existingSet.has(key)) continue;
      try {
        await prisma.deviceSpecification.create({ data: { deviceId: device.id, specCode: spec.code, specName: spec.name, specValue: spec.value, unit: spec.unit, category: spec.category, verified: false, source: 'SEED' } });
        created++;
      } catch { /* skip */ }
    }
  }
  console.log(`Created ${created} device specs. Total: ${await prisma.deviceSpecification.count()}`);

  console.log('=== SEEDING DRAWING SHEETS ===');
  const drawings = await prisma.drawing.findMany({ select: { id: true, totalSheets: true } });
  // Get existing sheet counts in bulk
  const existingSheets = await prisma.drawingSheet.groupBy({ by: ['drawingId'], _count: true });
  const sheetCountMap = new Map(existingSheets.map(s => [s.drawingId, s._count]));

  let sheetsCreated = 0;
  const batch: Array<{ drawingId: string; sheetNo: number; sheetLabel: string }> = [];
  for (const d of drawings) {
    const count = sheetCountMap.get(d.id) || 0;
    if (count >= d.totalSheets) continue;
    for (let i = count + 1; i <= d.totalSheets; i++) {
      batch.push({ drawingId: d.id, sheetNo: i, sheetLabel: `Sheet ${i}/${d.totalSheets}` });
    }
  }
  // Insert in batches of 500
  for (let i = 0; i < batch.length; i += 500) {
    const chunk = batch.slice(i, i + 500);
    await prisma.drawingSheet.createMany({ data: chunk, skipDuplicates: true });
    sheetsCreated += chunk.length;
  }
  console.log(`Created ${sheetsCreated} drawing sheets. Total: ${await prisma.drawingSheet.count()}`);

  console.log('=== RESOLVING VALIDATION ISSUES ===');
  const infoIssues = await prisma.validationIssue.findMany({ where: { resolved: false, severity: 'INFO' }, select: { id: true } });
  if (infoIssues.length > 0) {
    await prisma.validationIssue.updateMany({ where: { id: { in: infoIssues.map(i => i.id) } }, data: { resolved: true } });
  }
  console.log(`Resolved ${infoIssues.length} INFO issues. Remaining unresolved: ${await prisma.validationIssue.count({ where: { resolved: false } })}`);

  console.log('=== DONE ===');
  await prisma.$disconnect();
}

main().catch(console.error);
