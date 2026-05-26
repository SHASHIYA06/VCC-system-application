import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { wireNo: string } }) {
  const { wireNo } = params;
  // Try exact numeric wireNo first, then fallback to alphanumeric alias (wireAlias)
  const wire = await prisma.wire.findFirst({
    where: {
      OR: [{ wireNo }, { wireAlias: wireNo }],
    },
    include: {
      endpoints: true,
    },
  });

  if (!wire) {
    return NextResponse.json({ error: 'Wire not found' }, { status: 404 });
  }

  // Gather related pins via connector pins that reference this wire number
  const pins = await prisma.connectorPin.findMany({
    where: { wireNo: wire.wireNo },
    include: { connector: true },
  });

  return NextResponse.json({ wire, pins });
}
