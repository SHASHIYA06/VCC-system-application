/**
 * DIGITAL TWIN — VALIDATION CENTER API
 *
 * GET /api/twin/validate  — run the wiring integrity report (read-only)
 */
import { NextResponse } from 'next/server';
import { runValidation } from '@/lib/twin/validation-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const report = await runValidation();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Twin validation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
