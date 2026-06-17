import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADDITIONAL_DEVICES = [
  // GEN - General (0 devices)
  { name: 'DRAWING_LIST', tag: 'GEN_DL_01', system: 'GEN', carType: 'ALL', location: 'Documentation' },
  { name: 'CLASSIFICATION_REG', tag: 'GEN_CL_01', system: 'GEN', carType: 'ALL', location: 'Documentation' },
  { name: 'WIRING_STANDARDS', tag: 'GEN_WS_01', system: 'GEN', carType: 'ALL', location: 'Documentation' },
  
  // TRL - Trainlines (0 devices)
  { name: 'Trainline Controller', tag: 'TRL_CTL_01', system: 'TRL', carType: 'ALL', location: 'Ceiling' },
  { name: 'Trainline Bus A', tag: 'TRL_BUS_A', system: 'TRL', carType: 'ALL', location: 'Underframe' },
  { name: 'Trainline Bus B', tag: 'TRL_BUS_B', system: 'TRL', carType: 'ALL', location: 'Underframe' },
  
  // LIGHT - Lighting (0 devices)
  { name: 'Interior Light Controller', tag: 'LIGHT_CTL', system: 'LIGHT', carType: 'ALL', location: 'Ceiling' },
  { name: 'Head Cab Light', tag: 'LIGHT_HEAD_D', system: 'LIGHT', carType: 'DMC', location: 'Cab' },
  { name: 'Tail Light Left', tag: 'LIGHT_TAIL_L', system: 'LIGHT', carType: 'ALL', location: 'Exterior' },
  { name: 'Tail Light Right', tag: 'LIGHT_TAIL_R', system: 'LIGHT', carType: 'ALL', location: 'Exterior' },
  { name: 'Saloon Light Bank A', tag: 'LIGHT_SAL_A', system: 'LIGHT', carType: 'ALL', location: 'Ceiling' },
  { name: 'Saloon Light Bank B', tag: 'LIGHT_SAL_B', system: 'LIGHT', carType: 'ALL', location: 'Ceiling' },
  { name: 'Emergency Light', tag: 'LIGHT_EMG', system: 'LIGHT', carType: 'ALL', location: 'Ceiling' },
  { name: 'Driver Seat Light', tag: 'LIGHT_DR_SEAT', system: 'LIGHT', carType: 'DMC', location: 'Cab' },
  
  // BOGIE (0 devices)
  { name: 'Bogie Controller', tag: 'BOGIE_CTL', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Axle Temperature Sensor 1', tag: 'BOGIE_TEMP_1', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Axle Temperature Sensor 2', tag: 'BOGIE_TEMP_2', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Axle Temperature Sensor 3', tag: 'BOGIE_TEMP_3', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Axle Temperature Sensor 4', tag: 'BOGIE_TEMP_4', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Wheel Sensor 1A', tag: 'BOGIE_WS_1A', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Wheel Sensor 1B', tag: 'BOGIE_WS_1B', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Wheel Sensor 2A', tag: 'BOGIE_WS_2A', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Wheel Sensor 2B', tag: 'BOGIE_WS_2B', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  { name: 'Bogie Junction Box', tag: 'BOGIE_JB', system: 'BOGIE', carType: 'ALL', location: 'Bogie' },
  
  // COUPL - Coupling (0 devices)
  { name: 'Coupling Control Unit', tag: 'COUPL_CTL', system: 'COUPL', carType: 'ALL', location: 'Front' },
  { name: 'Coupling Motor', tag: 'COUPL_MOT', system: 'COUPL', carType: 'ALL', location: 'Front' },
  { name: 'Coupling Sensor A', tag: 'COUPL_SENS_A', system: 'COUPL', carType: 'ALL', location: 'Front' },
  { name: 'Coupling Sensor B', tag: 'COUPL_SENS_B', system: 'COUPL', carType: 'ALL', location: 'Front' },
  { name: 'ICC Lock Mechanism', tag: 'COUPL_LOCK', system: 'COUPL', carType: 'ALL', location: 'Front' },
  
  // COMMS - more devices
  { name: 'Central Control Unit 1', tag: 'CCU_01', system: 'COMMS', carType: 'DMC', location: 'Cab' },
  { name: 'Central Control Unit 2', tag: 'CCU_02', system: 'COMMS', carType: 'DMC', location: 'Cab' },
  { name: 'Intercom Unit 1', tag: 'ICOM_01', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'Intercom Unit 2', tag: 'ICOM_02', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'MOXA Ethernet Switch 1', tag: 'MOXA_01', system: 'COMMS', carType: 'DMC', location: 'Ceiling' },
  { name: 'MOXA Ethernet Switch 2', tag: 'MOXA_02', system: 'COMMS', carType: 'MC', location: 'Ceiling' },
  { name: 'PA Speaker 1', tag: 'SPK_01', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 2', tag: 'SPK_02', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 3', tag: 'SPK_03', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PA Speaker 4', tag: 'SPK_04', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'PIS Controller', tag: 'PIS_CTL', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'Passenger Display 1', tag: 'PIS_DISP_1', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'Passenger Display 2', tag: 'PIS_DISP_2', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'Passenger Display 3', tag: 'PIS_DISP_3', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'PA System Controller', tag: 'PA_CTL', system: 'COMMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'CCTV Controller', tag: 'CCTV_CTL', system: 'COMMS', carType: 'DMC', location: 'Ceiling' },
  { name: 'CCTV Camera 1', tag: 'CAM_01', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'CCTV Camera 2', tag: 'CAM_02', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'CCTV Camera 3', tag: 'CAM_03', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'CCTV Camera 4', tag: 'CAM_04', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'CCTV Camera 5', tag: 'CAM_05', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'CCTV Camera 6', tag: 'CAM_06', system: 'COMMS', carType: 'ALL', location: 'Saloon' },
  { name: 'Radio Transceiver', tag: 'RADIO_01', system: 'COMMS', carType: 'DMC', location: 'Cab' },
  { name: 'CBTC Antenna', tag: 'CBTC_ANT', system: 'COMMS', carType: 'ALL', location: 'Roof' },
  { name: 'GPS Antenna', tag: 'GPS_ANT', system: 'COMMS', carType: 'ALL', location: 'Roof' },
  
  // Additional for existing systems
  { name: 'VVVF Inverter 3', tag: 'V3', system: 'TRAC', carType: 'TC', location: 'Underframe' },
  { name: 'Traction Motor 3', tag: 'TM3', system: 'TRAC', carType: 'DMC', location: 'Bogie' },
  { name: 'Traction Motor 4', tag: 'TM4', system: 'TRAC', carType: 'MC', location: 'Bogie' },
  { name: 'Filter Reactor 2', tag: 'FILT_REACT2', system: 'TRAC', carType: 'TC', location: 'Underframe' },
  { name: 'Brake Resistor 2', tag: 'BRAKE_RES2', system: 'TRAC', carType: 'TC', location: 'Underframe' },
  
  { name: 'Door Control Unit 3', tag: 'DCU3', system: 'DOOR', carType: 'DMC', location: 'Ceiling' },
  { name: 'Door Control Unit 4', tag: 'DCU4', system: 'DOOR', carType: 'TC', location: 'Ceiling' },
  { name: 'Door Sensor L1', tag: 'DOOR_SENS_L1', system: 'DOOR', carType: 'ALL', location: 'Door' },
  { name: 'Door Sensor R1', tag: 'DOOR_SENS_R1', system: 'DOOR', carType: 'ALL', location: 'Door' },
  { name: 'Door Motor L1', tag: 'DOOR_MOT_L1', system: 'DOOR', carType: 'ALL', location: 'Door' },
  { name: 'Door Motor R1', tag: 'DOOR_MOT_R1', system: 'DOOR', carType: 'ALL', location: 'Door' },
  
  { name: 'Compressor Motor 2', tag: 'COMP2', system: 'BRAKE', carType: 'MC', location: 'Underframe' },
  { name: 'Air Drying Unit 2', tag: 'ADU2', system: 'BRAKE', carType: 'MC', location: 'Underframe' },
  { name: 'Brake Valve 1', tag: 'BRAKE_VLV1', system: 'BRAKE', carType: 'ALL', location: 'Underframe' },
  { name: 'Brake Valve 2', tag: 'BRAKE_VLV2', system: 'BRAKE', carType: 'ALL', location: 'Underframe' },
  { name: 'Pressure Sensor 1', tag: 'PRES_SENS1', system: 'BRAKE', carType: 'ALL', location: 'Underframe' },
  { name: 'Pressure Sensor 2', tag: 'PRES_SENS2', system: 'BRAKE', carType: 'ALL', location: 'Underframe' },
  
  { name: 'TCMS Remote IO 3', tag: 'TCMS_RIO3', system: 'TMS', carType: 'DMC', location: 'Ceiling' },
  { name: 'TCMS Gateway', tag: 'TMS_GW', system: 'TMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'Terminal Block 1', tag: 'TMS_TB1', system: 'TMS', carType: 'ALL', location: 'Ceiling' },
  { name: 'Terminal Block 2', tag: 'TMS_TB2', system: 'TMS', carType: 'ALL', location: 'Ceiling' },
  
  { name: 'APS2', tag: 'APS2', system: 'APS', carType: 'MC', location: 'Underframe' },
  { name: 'Battery 2', tag: 'BATT2', system: 'APS', carType: 'MC', location: 'Underframe' },
  { name: 'Charger Unit', tag: 'CHARGER', system: 'APS', carType: 'TC', location: 'Underframe' },
  
  { name: 'VAC3', tag: 'VAC3', system: 'VAC', carType: 'DMC', location: 'Ceiling' },
  { name: 'Cab VAC 2', tag: 'CAB_VAC2', system: 'VAC', carType: 'TC', location: 'Cab' },
  { name: 'Ventilation Fan 1', tag: 'VENT_FAN1', system: 'VAC', carType: 'ALL', location: 'Ceiling' },
  { name: 'Ventilation Fan 2', tag: 'VENT_FAN2', system: 'VAC', carType: 'ALL', location: 'Ceiling' },
];

export async function POST(request: NextRequest) {
  try {
    let added = 0;
    let skipped = 0;
    
    for (const device of ADDITIONAL_DEVICES) {
      const system = await prisma.system.findFirst({
        where: { code: device.system }
      });
      
      if (!system) {
        console.log(`System not found: ${device.system}`);
        skipped++;
        continue;
      }
      
      // Get or create a default drawing for this system
      let drawing = await prisma.drawing.findFirst({
        where: { systemId: system.id }
      });
      
      if (!drawing) {
        // Use GEN drawing as fallback
        drawing = await prisma.drawing.findFirst({
          where: { system: { code: 'GEN' } }
        });
      }
      
      if (!drawing) {
        skipped++;
        continue;
      }
      
      const existing = await prisma.device.findFirst({
        where: { 
          tagNo: device.tag
        }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await prisma.device.create({
        data: {
          drawingId: drawing.id,
          systemId: system.id,
          deviceName: device.name,
          tagNo: device.tag,
          carType: device.carType,
          locationTag: device.location,
          note: `${device.system} system - ${device.location}`
        }
      });
      added++;
    }
    
    const deviceCount = await prisma.device.count();
    
    return NextResponse.json({
      success: true,
      message: `Added ${added} devices, skipped ${skipped} existing`,
      stats: { devices: deviceCount }
    });
    
  } catch (error) {
    console.error('Device seed error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const deviceCount = await prisma.device.count();
  return NextResponse.json({
    current: { devices: deviceCount },
    endpoint: 'POST to /api/seed-devices to add more devices'
  });
}