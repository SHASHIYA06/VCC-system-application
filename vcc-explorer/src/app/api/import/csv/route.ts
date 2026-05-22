import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'File empty or invalid format' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

      if (row.wire_no) {
        await prisma.wire.upsert({
          where: { wireNo: row.wire_no },
          update: {
            signalName: row.signal_name,
            sourceConnector: row.from_connector,
            sourcePin: row.from_pin,
            destConnector: row.to_connector,
            destPin: row.to_pin,
            remarks: row.from_device && row.to_device ? `${row.from_device} → ${row.to_device}` : null,
          },
          create: {
            wireNo: row.wire_no,
            wireColor: 'Blue',
            voltageClass: '110V',
            signalName: row.signal_name,
            sourceConnector: row.from_connector,
            sourcePin: row.from_pin,
            destConnector: row.to_connector,
            destPin: row.to_pin,
            remarks: row.from_device && row.to_device ? `${row.from_device} → ${row.to_device}` : null,
          }
        });
        imported++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'CSV import completed', 
      count: imported 
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Import failed', 
      errors: [(error as Error).message] 
    }, { status: 500 });
  }
}