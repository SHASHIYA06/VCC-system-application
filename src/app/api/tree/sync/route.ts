import { NextRequest, NextResponse } from 'next/server';
import { syncSystemTree, getTreeStatistics } from '@/lib/database/tree-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for complex sync operations

/**
 * POST /api/tree/sync - Synchronize the VCC system tree
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌳 Starting VCC tree synchronization...');
    
    const result = await syncSystemTree();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        statistics: result.statistics,
        warnings: result.warnings,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        errors: result.errors,
        warnings: result.warnings,
        statistics: result.statistics,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Tree sync API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Tree synchronization failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * GET /api/tree/sync - Get current tree statistics and health
 */
export async function GET() {
  try {
    const statistics = await getTreeStatistics();
    
    return NextResponse.json({
      success: true,
      statistics,
      status: statistics.hierarchyHealth >= 90 ? 'healthy' : 
              statistics.hierarchyHealth >= 70 ? 'warning' : 'critical',
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations(statistics),
    });
  } catch (error) {
    console.error('Tree stats API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Generate recommendations based on tree health statistics
 */
function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = [];

  if (stats.orphanedDevices > 0) {
    recommendations.push(`Fix ${stats.orphanedDevices} orphaned devices - assign them to appropriate systems`);
  }

  if (stats.incompleteWires > 0) {
    recommendations.push(`Complete ${stats.incompleteWires} wires with missing endpoints`);
  }

  if (stats.emptyConnectors > 0) {
    recommendations.push(`Add pins to ${stats.emptyConnectors} empty connectors`);
  }

  if (stats.hierarchyHealth < 90) {
    recommendations.push('Run tree synchronization to improve data integrity');
  }

  if (recommendations.length === 0) {
    recommendations.push('VCC system tree is healthy - no immediate actions required');
  }

  return recommendations;
}