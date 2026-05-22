import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const QUICK_MAPPINGS = {
  '942-58123': [
    { conn: 'BCU', pins: { '1': '7001', '2': '7002', '3': '7003', '4': '7004' }, signals: ['Brake Demand', 'Brake Release', 'Brake Pressure', 'WSP Active'] },
    { conn: 'EBCU', pins: { '1': '7001', '2': '7002', '3': '7005' }, signals: ['Brake Demand', 'Brake Release', 'EBCU Status'] },
    { conn: 'WSP', pins: { '1': '7004', '2': '7004' }, signals: ['WSP Active', 'WSP Active'] },
    { conn: 'PRES', pins: { '1': '7010', '2': '7011' }, signals: ['Pressure Signal', 'Ground'] }
  ],
  '942-58103': [
    { conn: 'X1', pins: { '1': '3001', '2': '3002', '3': '3003', '4': '3004', '5': '3005' }, signals: ['Emergency Brake', 'Forward', 'Reverse', 'Service Brake', 'Traction Enable'] },
    { conn: 'X2', pins: { '1': '3001', '2': '3002', '3': '3003' }, signals: ['Emergency Brake', 'Forward', 'Reverse'] }
  ],
  '942-38305': [
    { conn: 'VVVF1', pins: { '1': '3001', '2': '3002', '3': '3003', '4': '3004' }, signals: ['Emergency Brake', 'Forward', 'Reverse', 'Service Brake'] },
    { conn: 'HSCB', pins: { '1': '5001', '2': '5002' }, signals: ['HSCB Close', 'HSCB Open'] },
    { conn: 'BCU1', pins: { '1': '7001', '2': '7002' }, signals: ['Brake Demand', 'Brake Release'] },
    { conn: 'LTEB', pins: { '1': '8001', '2': '8002', '3': '8003' }, signals: ['Power Supply', 'Ground', 'TCMS Data'] },
    { conn: 'CN1', pins: { '1': '3001', '2': '3002', '3': '3003' }, signals: ['Emergency Brake', 'Forward', 'Reverse'] }
  ],
  '942-38310': [
    { conn: 'BCU_X1', pins: { '1': '7001', '2': '7002', '3': '7003', '4': '7004' }, signals: ['Brake Demand', 'Brake Release', 'Brake Pressure', 'WSP Active'] },
    { conn: 'BCU_X2', pins: { '1': '7005', '2': '7006' }, signals: ['EBCU Status', 'BCU Fault'] }
  ]
};

export async function GET() {
  let totalUpdated = 0;

  for (const [dwgNo, mappings] of Object.entries(QUICK_MAPPINGS)) {
    const drawing = await prisma.drawing.findFirst({ where: { drawingNo: dwgNo } });
    if (!drawing) continue;

    for (const m of mappings as any[]) {
      const connector = await prisma.connector.findFirst({
        where: { drawingId: drawing.id, connectorCode: m.conn }
      });
      if (!connector) continue;

      for (const [pinNo, wireNo] of Object.entries(m.pins)) {
        const pin = await prisma.connectorPin.findFirst({
          where: { connectorId: connector.id, pinNo }
        });
        if (pin) {
          const signalIdx = parseInt(pinNo) - 1;
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: { 
              wireNo: wireNo as string,
              signalName: m.signals[signalIdx] || `Signal ${pinNo}`
            }
          });
          totalUpdated++;
        }
      }
    }
  }

  return NextResponse.json({ updated: totalUpdated, mappings: Object.keys(QUICK_MAPPINGS) });
}