import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use /api/fix/sync-pins instead',
    availableModes: ['pins-to-wires', 'create-endpoints']
  });
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to /api/fix/sync-pins' });
}