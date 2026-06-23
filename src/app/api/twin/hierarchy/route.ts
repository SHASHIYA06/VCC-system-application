/**
 * DIGITAL TWIN — HIERARCHY NAVIGATION API
 *
 * Lazy-loads each level of the train digital twin on demand.
 *
 *   GET /api/twin/hierarchy?level=train
 *   GET /api/twin/hierarchy?level=car&parentId=<formationId>
 *   GET /api/twin/hierarchy?level=carSystems&parentId=<carId>
 *   GET /api/twin/hierarchy?level=system
 *   GET /api/twin/hierarchy?level=systemDetail&parentId=<systemId>
 *   GET /api/twin/hierarchy?level=drawing&parentId=<drawingId>
 *   GET /api/twin/hierarchy?level=connector&parentId=<connectorId>
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getTrainLevel,
  getCarLevel,
  getCarSystems,
  getSystemLevel,
  getSystemDetail,
  getDrawingDetail,
  getConnectorDetail,
} from '@/lib/twin/hierarchy-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level') || 'system';
  const parentId = searchParams.get('parentId') || '';

  try {
    switch (level) {
      case 'train':
        return NextResponse.json({ success: true, level, nodes: await getTrainLevel() });
      case 'car':
        if (!parentId) return badRequest('parentId (formationId) required');
        return NextResponse.json({ success: true, level, nodes: await getCarLevel(parentId) });
      case 'carSystems':
        if (!parentId) return badRequest('parentId (carId) required');
        return NextResponse.json({ success: true, level, nodes: await getCarSystems(parentId) });
      case 'system':
        return NextResponse.json({ success: true, level, nodes: await getSystemLevel() });
      case 'systemDetail':
        if (!parentId) return badRequest('parentId (systemId) required');
        return NextResponse.json({ success: true, level, ...(await getSystemDetail(parentId)) });
      case 'drawing':
        if (!parentId) return badRequest('parentId (drawingId) required');
        return NextResponse.json({ success: true, level, nodes: await getDrawingDetail(parentId) });
      case 'connector':
        if (!parentId) return badRequest('parentId (connectorId) required');
        return NextResponse.json({ success: true, level, nodes: await getConnectorDetail(parentId) });
      default:
        return badRequest(`Unknown level "${level}"`);
    }
  } catch (error) {
    console.error('Twin hierarchy error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

function badRequest(msg: string) {
  return NextResponse.json({ success: false, error: msg }, { status: 400 });
}
