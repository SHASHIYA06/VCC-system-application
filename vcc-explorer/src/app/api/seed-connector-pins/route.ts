import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CONNECTOR_PIN_DATA = [
  // COMMS - Ethernet Switch (942-38406)
  { drawingNo: '942-38406', connectorCode: 'PORT1', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT2', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT3', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT4', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT5', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT6', pinCount: 4, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'PORT7', pinCount: 8, carType: 'TC', system: 'COMMS' },
  { drawingNo: '942-38406', connectorCode: 'POWER', pinCount: 4, carType: 'TC', system: 'COMMS' },
  
  // COMMS - CCU/CCTV (942-58149)
  { drawingNo: '942-58149', connectorCode: 'CCU_PWR', pinCount: 4, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58149', connectorCode: 'CCU_COM1', pinCount: 8, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58149', connectorCode: 'CCU_COM2', pinCount: 8, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58149', connectorCode: 'CCTV_IN', pinCount: 4, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58149', connectorCode: 'CCTV_OUT', pinCount: 4, carType: 'DMC', system: 'COMMS' },
  
  // COMMS - PA Amplifier (942-58150)
  { drawingNo: '942-58150', connectorCode: 'PA_PWR', pinCount: 3, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58150', connectorCode: 'PA_AUDIO_IN', pinCount: 2, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58150', connectorCode: 'PA_AUDIO_OUT', pinCount: 4, carType: 'DMC', system: 'COMMS' },
  { drawingNo: '942-58150', connectorCode: 'PA_CTRL', pinCount: 6, carType: 'DMC', system: 'COMMS' },
  
  // COMMS - CBTC (942-58152)
  { drawingNo: '942-58152', connectorCode: 'CBTC_ANT', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58152', connectorCode: 'CBTC_PWR', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58152', connectorCode: 'CBTC_COM', pinCount: 8, carType: 'ALL', system: 'COMMS' },
  
  // COMMS - Train Radio (942-58153)
  { drawingNo: '942-58153', connectorCode: 'RADIO_PWR', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58153', connectorCode: 'RADIO_ANT', pinCount: 2, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58153', connectorCode: 'RADIO_COM', pinCount: 6, carType: 'ALL', system: 'COMMS' },
  
  // COMMS - CCTV (942-58154)
  { drawingNo: '942-58154', connectorCode: 'CCTV_CAM1', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58154', connectorCode: 'CCTV_CAM2', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  { drawingNo: '942-58154', connectorCode: 'CCTV_PWR', pinCount: 4, carType: 'ALL', system: 'COMMS' },
  
  // TMS - TCMS RIO (942-38409)
  { drawingNo: '942-38409', connectorCode: 'CN1', pinCount: 40, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN2', pinCount: 40, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN3', pinCount: 4, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN5', pinCount: 4, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN7', pinCount: 4, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN11', pinCount: 40, carType: 'MC', system: 'TMS' },
  { drawingNo: '942-38409', connectorCode: 'CN13', pinCount: 40, carType: 'MC', system: 'TMS' },
  
  // LTEB - Low Tension Equipment Box (942-38305)
  { drawingNo: '942-38305', connectorCode: 'CN1', pinCount: 74, carType: 'DMC', system: 'LTEB' },
  { drawingNo: '942-38305', connectorCode: 'CN2', pinCount: 74, carType: 'DMC', system: 'LTEB' },
  { drawingNo: '942-38305', connectorCode: 'CN3', pinCount: 11, carType: 'DMC', system: 'LTEB' },
  { drawingNo: '942-38305', connectorCode: 'CN4', pinCount: 74, carType: 'DMC', system: 'LTEB' },
  
  // LTJB - Low Tension Junction Box (942-38312)
  { drawingNo: '942-38312', connectorCode: 'X1', pinCount: 74, carType: 'TC', system: 'LTJB' },
  { drawingNo: '942-38312', connectorCode: 'X2', pinCount: 74, carType: 'TC', system: 'LTJB' },
  { drawingNo: '942-38312', connectorCode: 'X3', pinCount: 11, carType: 'TC', system: 'LTJB' },
  { drawingNo: '942-38312', connectorCode: 'X4', pinCount: 3, carType: 'TC', system: 'LTJB' },
  { drawingNo: '942-38312', connectorCode: 'X5', pinCount: 20, carType: 'TC', system: 'LTJB' },
  
  // APS (942-38512)
  { drawingNo: '942-38512', connectorCode: 'CN1', pinCount: 37, carType: 'TC', system: 'APS' },
  { drawingNo: '942-38512', connectorCode: 'CN2', pinCount: 20, carType: 'TC', system: 'APS' },
  { drawingNo: '942-38512', connectorCode: 'CN3', pinCount: 8, carType: 'TC', system: 'APS' },
  { drawingNo: '942-38512', connectorCode: 'CN4', pinCount: 3, carType: 'TC', system: 'APS' },
  
  // BRAKE - BCU (942-38310)
  { drawingNo: '942-38310', connectorCode: 'BCU_X1', pinCount: 37, carType: 'MC', system: 'BRAKE' },
  { drawingNo: '942-38310', connectorCode: 'BCU_X2', pinCount: 23, carType: 'MC', system: 'BRAKE' },
  { drawingNo: '942-38310', connectorCode: 'BCU_PE', pinCount: 1, carType: 'MC', system: 'BRAKE' },
  
  // DOOR - DCU (942-38603)
  { drawingNo: '942-38603', connectorCode: 'X1', pinCount: 5, carType: 'MC', system: 'DOOR' },
  { drawingNo: '942-38603', connectorCode: 'X2', pinCount: 12, carType: 'MC', system: 'DOOR' },
  { drawingNo: '942-38603', connectorCode: 'X3', pinCount: 10, carType: 'MC', system: 'DOOR' },
  
  // VAC (942-38602)
  { drawingNo: '942-38602', connectorCode: 'VAC1X01', pinCount: 5, carType: 'MC', system: 'VAC' },
  { drawingNo: '942-38602', connectorCode: 'VAC1X02', pinCount: 12, carType: 'MC', system: 'VAC' },
  { drawingNo: '942-38602', connectorCode: 'VAC1X03', pinCount: 10, carType: 'MC', system: 'VAC' },
  
  // TRAC - VVVF (942-38306)
  { drawingNo: '942-38306', connectorCode: 'CN1', pinCount: 3, carType: 'DMC', system: 'TRAC' },
  { drawingNo: '942-38306', connectorCode: 'X1', pinCount: 50, carType: 'DMC', system: 'TRAC' },
  { drawingNo: '942-38306', connectorCode: 'PE', pinCount: 1, carType: 'DMC', system: 'TRAC' },
  
  // CAB (942-58107)
  { drawingNo: '942-58107', connectorCode: 'MASTER_SW', pinCount: 6, carType: 'DMC', system: 'CAB' },
  { drawingNo: '942-58107', connectorCode: 'IND_LAMP', pinCount: 20, carType: 'DMC', system: 'CAB' },
  { drawingNo: '942-58107', connectorCode: 'THROTTLE', pinCount: 8, carType: 'DMC', system: 'CAB' },
  { drawingNo: '942-58107', connectorCode: 'BRAKE_PEDAL', pinCount: 6, carType: 'DMC', system: 'CAB' },

  // DOOR - Saloon Door Supply Voltage (942-58137)
  { drawingNo: '942-58137', connectorCode: 'DCUA', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58137', connectorCode: 'DCUB', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58137', connectorCode: 'DOS', pinCount: 4, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58137', connectorCode: 'DCS', pinCount: 4, carType: 'ALL', system: 'DOOR' },

  // DOOR - Door Operation (942-58138)
  { drawingNo: '942-58138', connectorCode: 'DCUA', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58138', connectorCode: 'DCUB', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58138', connectorCode: 'DOS', pinCount: 4, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58138', connectorCode: 'DCS', pinCount: 4, carType: 'ALL', system: 'DOOR' },

  // DOOR - Door Proving Loop (942-58139)
  { drawingNo: '942-58139', connectorCode: 'DCUA', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58139', connectorCode: 'DCUB', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58139', connectorCode: 'DPR', pinCount: 6, carType: 'ALL', system: 'DOOR' },

  // DOOR - Local Door Interlock (942-58140)
  { drawingNo: '942-58140', connectorCode: 'LCP', pinCount: 20, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58140', connectorCode: 'DOLR', pinCount: 6, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58140', connectorCode: 'DORR', pinCount: 6, carType: 'ALL', system: 'DOOR' },

  // DOOR - TCMS Communication (942-58141)
  { drawingNo: '942-58141', connectorCode: 'DCUA', pinCount: 25, carType: 'ALL', system: 'DOOR' },
  { drawingNo: '942-58141', connectorCode: 'DCUB', pinCount: 25, carType: 'ALL', system: 'DOOR' },
];

const SIGNAL_MAPPING: Record<string, string[]> = {
  'PORT1': ['CAM1_D0+', 'CAM1_D0-', 'CAM1_D1+', 'CAM1_D1-'],
  'PORT2': ['CAM2_D0+', 'CAM2_D0-', 'CAM2_D1+', 'CAM2_D1-'],
  'PORT3': ['CAM3_D0+', 'CAM3_D0-', 'CAM3_D1+', 'CAM3_D1-'],
  'PORT4': ['CAM4_D0+', 'CAM4_D0-', 'CAM4_D1+', 'CAM4_D1-'],
  'PORT5': ['CAM5_D0+', 'CAM5_D0-', 'CAM5_D1+', 'CAM5_D1-'],
  'PORT6': ['CAM6_D0+', 'CAM6_D0-', 'CAM6_D1+', 'CAM6_D1-'],
  'PORT7': ['ETH_TX+', 'ETH_TX-', 'ETH_RX+', 'ETH_RX-', 'NC', 'NC', 'NC', 'NC'],
  'POWER': ['PWR_110V', 'GND', 'GND', 'NC'],
  'CN1': ['DI_00', 'DI_01', 'DI_02', 'DI_03', 'DI_04', 'DI_05', 'DI_06', 'DI_07', 'DO_00', 'DO_01', 'DO_02', 'DO_03'],
  'CN2': ['DI_08', 'DI_09', 'DI_10', 'DI_11', 'DI_12', 'DI_13', 'DI_14', 'DI_15', 'DO_04', 'DO_05', 'DO_06', 'DO_07'],

  // DOOR System - DCUA (Door Control Unit A - 25 pins)
  'DCUA': [
    'DCU_PWR', 'DCU_GND', 'DO_CMD_L', 'DO_CMD_R', 'DC_CMD_L', 'DC_CMD_R',
    'DL_STATUS_L', 'DL_STATUS_R', 'DOLR_IN', 'DOLR_OUT', 'DORR_IN', 'DORR_OUT',
    'DPR_L', 'DPR_R', 'EDR_L', 'EDR_R', 'TCMS_TX', 'TCMS_RX', 'CAN_H', 'CAN_L',
    'FDBK_L', 'FDBK_R', 'NC', 'NC', 'NC'
  ],

  // DOOR System - DCUB (Door Control Unit B - 25 pins)
  'DCUB': [
    'DCU_PWR', 'DCU_GND', 'DO_CMD_L', 'DO_CMD_R', 'DC_CMD_L', 'DC_CMD_R',
    'DL_STATUS_L', 'DL_STATUS_R', 'DOLR_IN', 'DOLR_OUT', 'DORR_IN', 'DORR_OUT',
    'DPR_L', 'DPR_R', 'EDR_L', 'EDR_R', 'TCMS_TX', 'TCMS_RX', 'CAN_H', 'CAN_L',
    'FDBK_L', 'FDBK_R', 'NC', 'NC', 'NC'
  ],

  // DOOR System - DOS (Door Open Sensor - 4 pins)
  'DOS': ['DOS_SIG_L', 'DOS_SIG_R', 'DOS_GND', 'NC'],

  // DOOR System - DCS (Door Close Sensor - 4 pins)
  'DCS': ['DCS_SIG_L', 'DCS_SIG_R', 'DCS_GND', 'NC'],

  // DOOR System - DPR (Door Proving Relay - 6 pins)
  'DPR': ['DPR_COIL', 'DPR_NC', 'DPR_NO', 'DPR_PWR', 'DPR_GND', 'NC'],

  // DOOR System - LCP (Local Control Panel - 20 pins)
  'LCP': [
    'LCP_PWR', 'LCP_GND', 'DO_BTN_L', 'DO_BTN_R', 'DC_BTN_L', 'DC_BTN_R',
    'ED_BTN_L', 'ED_BTN_R', 'IND_L1', 'IND_L2', 'IND_L3', 'IND_L4',
    'IND_R1', 'IND_R2', 'IND_R3', 'IND_R4', 'NC', 'NC', 'NC', 'NC'
  ],

  // DOOR System - DOLR/DORR (Door Open/Close Relay - 6 pins)
  'DOLR': ['DOLR_COIL', 'DOLR_NC', 'DOLR_NO', 'DOLR_PWR', 'DOLR_GND', 'NC'],
  'DORR': ['DORR_COIL', 'DORR_NC', 'DORR_NO', 'DORR_PWR', 'DORR_GND', 'NC'],
};

export async function POST(request: NextRequest) {
  try {
    let added = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const connData of CONNECTOR_PIN_DATA) {
      const drawing = await prisma.drawing.findFirst({
        where: { drawingNo: connData.drawingNo }
      });
      
      if (!drawing) {
        console.log(`Drawing not found: ${connData.drawingNo}`);
        skipped++;
        continue;
      }
      
      const system = await prisma.system.findFirst({
        where: { code: connData.system }
      });
      
      let connector = await prisma.connector.findFirst({
        where: { drawingId: drawing.id, connectorCode: connData.connectorCode }
      });
      
      if (connector) {
        connector = await prisma.connector.update({
          where: { id: connector.id },
          data: { 
            pinCount: connData.pinCount,
            carType: connData.carType,
            scope: 'COMMUNICATION'
          }
        });
        updated++;
      } else {
        connector = await prisma.connector.create({
          data: {
            drawingId: drawing.id,
            connectorCode: connData.connectorCode,
            description: `${connData.connectorCode} for ${connData.system}`,
            pinCount: connData.pinCount,
            carType: connData.carType,
            scope: 'COMMUNICATION'
          }
        });
        added++;
      }
      
      // Generate pins
      const signals = SIGNAL_MAPPING[connData.connectorCode] || [];
      for (let i = 1; i <= connData.pinCount; i++) {
        const signalName = signals[i-1] || `PIN_${i}`;
        await prisma.connectorPin.upsert({
          where: { 
            connectorId_pinNo: { 
              connectorId: connector.id, 
              pinNo: String(i) 
            }
          },
          update: { signalName },
          create: { 
            connectorId: connector.id, 
            pinNo: String(i), 
            signalName 
          }
        });
      }
    }
    
    const connectorCount = await prisma.connector.count();
    const pinCount = await prisma.connectorPin.count();
    
    return NextResponse.json({
      success: true,
      message: `Seeded connector pins: ${added} added, ${updated} updated, ${skipped} skipped`,
      stats: { connectors: connectorCount, pins: pinCount }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const connectorCount = await prisma.connector.count();
  const pinCount = await prisma.connectorPin.count();
  
  return NextResponse.json({
    current: { connectors: connectorCount, pins: pinCount },
    endpoint: 'POST to /api/seed-connector-pins to add missing pins'
  });
}