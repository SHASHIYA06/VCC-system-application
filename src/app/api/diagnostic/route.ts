import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeSystemHealth,
  checkWireContinuity,
  generateDiagnosticReport,
  getSystemHealthStatus,
  validatePinConnections,
} from '@/lib/diagnostic/analyzer';

/**
 * Diagnostic API Endpoint
 * Provides system health checks, fault detection, and wire continuity verification
 *
 * Query Parameters:
 * - system: Analyze specific system
 * - wire: Check wire continuity
 * - connector: Validate connector pins
 * - report: Generate full diagnostic report
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const systemCode = searchParams.get('system') || undefined;
  const wireNo = searchParams.get('wire') || undefined;
  const connectorId = searchParams.get('connector') || undefined;
  const generateReport = searchParams.get('report') === 'true';

  try {
    if (generateReport) {
      // Generate comprehensive diagnostic report
      const report = await generateDiagnosticReport();
      return NextResponse.json({
        success: true,
        data: report,
        type: 'diagnostic_report',
      });
    }

    if (systemCode) {
      // Get health for specific system
      const health = await getSystemHealthStatus(systemCode);
      return NextResponse.json({
        success: true,
        data: health,
        type: 'system_health',
      });
    }

    if (wireNo) {
      // Check wire continuity
      const continuities = await checkWireContinuity(wireNo);
      return NextResponse.json({
        success: true,
        data: continuities,
        type: 'wire_continuity',
      });
    }

    if (connectorId) {
      // Validate connector pins
      const issues = await validatePinConnections(connectorId);
      return NextResponse.json({
        success: true,
        data: issues,
        type: 'pin_validation',
      });
    }

    // Default: analyze all systems
    const systemHealths = await analyzeSystemHealth();
    return NextResponse.json({
      success: true,
      data: systemHealths,
      type: 'all_systems_health',
    });
  } catch (error) {
    console.error('Diagnostic API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run diagnostics',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for advanced diagnostic queries
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { systemCode, wireNo, connectorId, generateReport } = body;

    if (generateReport) {
      const report = await generateDiagnosticReport();
      return NextResponse.json({
        success: true,
        data: report,
        type: 'diagnostic_report',
      });
    }

    if (systemCode) {
      const health = await getSystemHealthStatus(systemCode);
      return NextResponse.json({
        success: true,
        data: health,
        type: 'system_health',
      });
    }

    if (wireNo) {
      const continuities = await checkWireContinuity(wireNo);
      return NextResponse.json({
        success: true,
        data: continuities,
        type: 'wire_continuity',
      });
    }

    if (connectorId) {
      const issues = await validatePinConnections(connectorId);
      return NextResponse.json({
        success: true,
        data: issues,
        type: 'pin_validation',
      });
    }

    const systemHealths = await analyzeSystemHealth();
    return NextResponse.json({
      success: true,
      data: systemHealths,
      type: 'all_systems_health',
    });
  } catch (error) {
    console.error('Diagnostic POST API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process diagnostic request',
      },
      { status: 500 }
    );
  }
}
