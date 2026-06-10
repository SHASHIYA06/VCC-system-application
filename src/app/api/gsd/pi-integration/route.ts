/**
 * GSD Pi Integration API
 * GET /api/gsd/pi-integration
 * 
 * Provides enhanced GSD topology visualization with system metrics
 * Supports multiple actions: topology, systems, metrics, details, health, statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { gsdPiService } from '@/lib/services/gsd-pi-integration';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'topology';
    const systemCode = searchParams.get('systemCode');

    let result;

    switch (action) {
      case 'systems':
        console.log('📊 Fetching all systems...');
        result = await gsdPiService.getSystems();
        break;

      case 'topology':
        console.log('🔗 Generating GSD topology...');
        result = await gsdPiService.getTopology();
        break;

      case 'enhanced-topology':
        console.log('📈 Generating enhanced topology with metrics...');
        result = await gsdPiService.getEnhancedTopology();
        break;

      case 'details':
        if (!systemCode) {
          return NextResponse.json(
            { error: 'systemCode parameter required' },
            { status: 400 }
          );
        }
        console.log(`📋 Fetching details for system: ${systemCode}`);
        result = await gsdPiService.getSystemDetails(systemCode);
        break;

      case 'health':
        console.log('🏥 Running health check...');
        result = await gsdPiService.healthCheck();
        break;

      case 'statistics':
        console.log('📊 Generating statistics dashboard...');
        result = await gsdPiService.getStatistics();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const executionTime = Date.now() - startTime;

    console.log(`✅ GSD Pi ${action} completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      action,
      data: result,
      executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('❌ GSD Pi integration error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/gsd/pi-integration
 * Update system metadata or sync status
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { systemCode, action, metadata } = body;

    if (!systemCode) {
      return NextResponse.json(
        { error: 'systemCode required in body' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update-metadata':
        console.log(`🔄 Updating metadata for system: ${systemCode}`);
        result = await gsdPiService.updateSystemMetadata(systemCode, metadata || {});
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    const executionTime = Date.now() - startTime;

    console.log(`✅ GSD Pi ${action} completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      action,
      systemCode,
      data: result,
      executionTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('❌ GSD Pi update error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
