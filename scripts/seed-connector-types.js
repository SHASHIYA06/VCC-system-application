const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

const connectorTypes = [
  { code: '74P', nominalPins: 74, description: '74-Pin Intercar Connector', voltageClass: '110V', remarks: 'Standard 74-pin connector for intercar connections between train cars' },
  { code: 'CN', nominalPins: null, description: 'Standard Connector', voltageClass: null, remarks: 'Generic connector type used across multiple systems' },
  { code: 'CN1', nominalPins: null, description: 'CN1 Series Connector', voltageClass: null, remarks: 'CN1 series connector - first connector in a group' },
  { code: 'CN2', nominalPins: null, description: 'CN2 Series Connector', voltageClass: null, remarks: 'CN2 series connector - second connector in a group' },
  { code: 'CN3', nominalPins: null, description: 'CN3 Series Connector', voltageClass: null, remarks: 'CN3 series connector - third connector in a group' },
  { code: 'CN4', nominalPins: null, description: 'CN4 Series Connector', voltageClass: null, remarks: 'CN4 series connector - fourth connector in a group' },
  { code: 'CN5', nominalPins: null, description: 'CN5 Series Connector', voltageClass: null, remarks: 'CN5 series connector - fifth connector in a group' },
  { code: 'X', nominalPins: null, description: 'X-Series Connector', voltageClass: null, remarks: 'X-series connector base type' },
  { code: 'X1', nominalPins: null, description: 'X1 Connector', voltageClass: '110V', remarks: 'X1 connector for CAB (Cab) systems' },
  { code: 'X2', nominalPins: null, description: 'X2 Connector', voltageClass: '110V', remarks: 'X2 connector for CAB (Cab) systems' },
  { code: 'X3', nominalPins: null, description: 'X3 Connector', voltageClass: '110V', remarks: 'X3 connector for CAB (Cab) systems' },
  { code: 'X4', nominalPins: null, description: 'X4 Connector', voltageClass: '110V', remarks: 'X4 connector for CAB (Cab) systems' },
  { code: 'J', nominalPins: null, description: 'J-Series Connector', voltageClass: null, remarks: 'J-series connector for EDB panels' },
  { code: 'J1', nominalPins: null, description: 'J1 Connector', voltageClass: '110V', remarks: 'J1 connector for EDB (Emergency Door Bypass) panels' },
  { code: 'J2', nominalPins: null, description: 'J2 Connector', voltageClass: '110V', remarks: 'J2 connector for EDB panels' },
  { code: 'J3', nominalPins: null, description: 'J3 Connector', voltageClass: '110V', remarks: 'J3 connector for EDB panels' },
  { code: 'J4', nominalPins: null, description: 'J4 Connector', voltageClass: '110V', remarks: 'J4 connector for EDB panels' },
  { code: 'P', nominalPins: null, description: 'Panel Connector', voltageClass: null, remarks: 'Panel-mounted connector base type' },
  { code: 'P1', nominalPins: null, description: 'P1 Panel Connector', voltageClass: null, remarks: 'P1 panel-mounted connector' },
  { code: 'P2', nominalPins: null, description: 'P2 Panel Connector', voltageClass: null, remarks: 'P2 panel-mounted connector' },
  { code: 'P3', nominalPins: null, description: 'P3 Panel Connector', voltageClass: null, remarks: 'P3 panel-mounted connector' },
  { code: 'TB', nominalPins: null, description: 'Terminal Block', voltageClass: null, remarks: 'Terminal block connector' },
  { code: 'PL', nominalPins: null, description: 'Plug Connector', voltageClass: null, remarks: 'Plug-type connector' },
  { code: 'SK', nominalPins: null, description: 'Socket Connector', voltageClass: null, remarks: 'Socket-type connector' },
  { code: 'JP', nominalPins: null, description: 'Jumper Connector', voltageClass: null, remarks: 'Jumper connector for configuration' },
  { code: 'SW', nominalPins: null, description: 'Switch Connector', voltageClass: null, remarks: 'Switch-type connector' }
];

async function main() {
  console.log('🌱 Seeding connector types...');
  for (const type of connectorTypes) {
    await prisma.connectorType.upsert({
      where: { code: type.code },
      update: {
        nominalPins: type.nominalPins,
        description: type.description,
        voltageClass: type.voltageClass,
        remarks: type.remarks
      },
      create: {
        code: type.code,
        nominalPins: type.nominalPins,
        description: type.description,
        voltageClass: type.voltageClass,
        remarks: type.remarks
      }
    });
  }
  console.log('✅ Seeding complete. All connector types inserted/updated.');
}

main()
  .catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
