import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wire_no = searchParams.get('wire_no');

  try {
    if (wire_no) {
      const wire = await prisma.wire.findUnique({
        where: { wireNo: wire_no },
        include: { endpoints: { include: { connector: true, device: true, pin: true } } },
      });
      if (!wire) return NextResponse.json({ wire: null }, { status: 404 });
      return NextResponse.json({ wire });
    }
    return NextResponse.json({ error: 'wire_no required' }, { status: 400 });
  } catch {
    return NextResponse.json({ wire: null, error: 'Database unavailable' }, { status: 500 });
  }
}