import { NextRequest, NextResponse } from 'next/server';
import { getSystemTopology, getDeviceConnections, getWirePath, searchTopologyNodes } from '@/lib/gsd/topology';
import { getSystemTree, getTreeStatistics } from '@/lib/database/tree-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Enhanced GSD API with proper error handling and tree system integration
 * GET /api/gsd - Get GSD topology data with comprehensive error handling
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');
  const deviceId = searchParams.get('device');
  const wireNo = searchParams.get('wire');
  const search = searchParams.get('search');
  const action = searchParams.get('action') || 'topology';

  try {
    console.log(`🎯 GSD API Request: action=${action}, system=${systemCode}, device=${deviceId}, wire=${wireNo}`);

    switch (action) {
      case 'topology': {
        if (!systemCode && !deviceId && !wireNo) {
          // Get full system topology
          const topology = await getSystemTopology();
          
          if (!topology.nodes || topology.nodes.length === 0) {
            throw new Error('No topology data available - database may be empty or inaccessible');
          }

          return NextResponse.json({
            success: true,
            action: 'topology',
            data: topology,
            metadata: {
              nodeCount: topology.nodes.length,
              edgeCount: topology.edges.length,
              systemCount: topology.systems.length,
              executionTime: Date.now() - startTime,
              generatedAt: new Date().toISOString(),
            },
          });
        } else if (systemCode) {
          // Get system-specific topology
          const topology = await getSystemTopology(systemCode);
          
          if (!topology.nodes || topology.nodes.length === 0) {
            throw new Error(`No topology data found for system "${systemCode}" - system may not exist or have no associated equipment`);
          }

          return NextResponse.json({
            success: true,
            action: 'system_topology',
            system: systemCode,
            data: topology,
            metadata: {
              nodeCount: topology.nodes.length,
              edgeCount: topology.edges.length,
              executionTime: Date.now() - startTime,
              generatedAt: new Date().toISOString(),
            },
          });
        } else if (deviceId) {
          // Get device-specific connections
          const topology = await getDeviceConnections(deviceId);
          
          if (!topology.nodes || topology.nodes.length === 0) {
            throw new Error(`No connection data found for device "${deviceId}" - device may not exist or have no connections`);
          }

          return NextResponse.json({
            success: true,
            action: 'device_connections',
            deviceId,
            data: topology,
            metadata: {
              nodeCount: topology.nodes.length,
              edgeCount: topology.edges.length,
              executionTime: Date.now() - startTime,
              generatedAt: new Date().toISOString(),
            },
          });
        } else if (wireNo) {
          // Get wire path topology
          const topology = await getWirePath(wireNo);
          
          if (!topology.nodes || topology.nodes.length === 0) {
            throw new Error(`No path data found for wire "${wireNo}" - wire may not exist or have no endpoints`);
          }

          return NextResponse.json({
            success: true,
            action: 'wire_path',
            wireNo,
            data: topology,
            metadata: {
              nodeCount: topology.nodes.length,
              edgeCount: topology.edges.length,
              executionTime: Date.now() - startTime,
              generatedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }

      case 'search': {
        if (!search) {
          throw new Error('Search query is required for search action');
        }

        const nodes = await searchTopologyNodes(search, systemCode || undefined);
        
        if (nodes.length === 0) {
          return NextResponse.json({
            success: true,
            action: 'search',
            query: search,
            data: {
              nodes: [],
              searchQuery: search,
              resultCount: 0,
            },
            message: `No topology nodes found matching "${search}"`,
            metadata: {
              resultCount: 0,
              executionTime: Date.now() - startTime,
              generatedAt: new Date().toISOString(),
            },
          });
        }

        return NextResponse.json({
          success: true,
          action: 'search',
          query: search,
          data: {
            nodes,
            searchQuery: search,
            resultCount: nodes.length,
          },
          metadata: {
            resultCount: nodes.length,
            executionTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      case 'tree': {
        // Get hierarchical tree structure
        const tree = await getSystemTree(systemCode || undefined);
        
        if (tree.length === 0) {
          throw new Error(systemCode 
            ? `No tree data found for system "${systemCode}"`
            : 'No system tree data available - database may be empty'
          );
        }

        return NextResponse.json({
          success: true,
          action: 'tree',
          system: systemCode,
          data: tree,
          metadata: {
            systemCount: tree.length,
            totalEquipment: tree.reduce((sum, sys) => sum + sys.statistics.totalEquipment, 0),
            totalWires: tree.reduce((sum, sys) => sum + sys.statistics.totalWires, 0),
            executionTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      case 'health': {
        // Get system health and statistics
        const statistics = await getTreeStatistics();
        
        return NextResponse.json({
          success: true,
          action: 'health',
          data: {
            statistics,
            health: {
              status: statistics.hierarchyHealth >= 90 ? 'healthy' : 
                     statistics.hierarchyHealth >= 70 ? 'warning' : 'critical',
              score: statistics.hierarchyHealth,
              issues: {
                orphanedDevices: statistics.orphanedDevices,
                incompleteWires: statistics.incompleteWires,
                emptyConnectors: statistics.emptyConnectors,
              },
            },
          },
          metadata: {
            executionTime: Date.now() - startTime,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      default: {
        throw new Error(`Unknown action "${action}". Valid actions: topology, search, tree, health`);
      }
    }

    // Fallback - should not reach here
    throw new Error('No valid action processed');

  } catch (error) {
    console.error('❌ GSD API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isClientError = errorMessage.includes('not found') || 
                         errorMessage.includes('required') || 
                         errorMessage.includes('Unknown action');
    
    return NextResponse.json({
      success: false,
      action: action || 'unknown',
      error: 'GSD operation failed',
      message: errorMessage,
      details: {
        systemCode,
        deviceId,
        wireNo,
        search,
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
      },
      suggestions: generateErrorSuggestions(action, errorMessage),
    }, { 
      status: isClientError ? 400 : 500 
    });
  }
}

/**
 * POST /api/gsd - Trigger GSD data refresh or updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, systemCode, force } = body;

    switch (action) {
      case 'refresh': {
        // Force refresh of topology data
        const topology = await getSystemTopology(systemCode);
        
        return NextResponse.json({
          success: true,
          action: 'refresh',
          message: 'GSD topology data refreshed successfully',
          data: topology,
          metadata: {
            systemCode,
            nodeCount: topology.nodes.length,
            edgeCount: topology.edges.length,
            timestamp: new Date().toISOString(),
          },
        });
      }

      case 'validate': {
        // Validate GSD data integrity
        const statistics = await getTreeStatistics();
        const issues = [];

        if (statistics.orphanedDevices > 0) {
          issues.push(`${statistics.orphanedDevices} orphaned devices found`);
        }
        if (statistics.incompleteWires > 0) {
          issues.push(`${statistics.incompleteWires} incomplete wires found`);
        }
        if (statistics.emptyConnectors > 0) {
          issues.push(`${statistics.emptyConnectors} empty connectors found`);
        }

        return NextResponse.json({
          success: true,
          action: 'validate',
          data: {
            validation: {
              status: issues.length === 0 ? 'passed' : 'failed',
              healthScore: statistics.hierarchyHealth,
              issues,
              statistics,
            },
          },
          metadata: {
            timestamp: new Date().toISOString(),
          },
        });
      }

      default: {
        return NextResponse.json({
          success: false,
          error: `Unknown POST action "${action}". Valid actions: refresh, validate`,
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('GSD POST API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'GSD POST operation failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Generate helpful error suggestions based on the error type
 */
function generateErrorSuggestions(action: string, errorMessage: string): string[] {
  const suggestions: string[] = [];

  if (errorMessage.includes('database may be empty')) {
    suggestions.push('Run database synchronization: POST /api/tree/sync');
    suggestions.push('Check database connection and ensure data is properly imported');
  }

  if (errorMessage.includes('system may not exist')) {
    suggestions.push('Verify system code is correct (TRL, BRAKE, CAB, TRAC, etc.)');
    suggestions.push('Get available systems: GET /api/systems');
  }

  if (errorMessage.includes('device may not exist')) {
    suggestions.push('Verify device ID is correct');
    suggestions.push('Search devices: GET /api/equipment');
  }

  if (errorMessage.includes('wire may not exist')) {
    suggestions.push('Verify wire number format (e.g., 3003, Y4181a)');
    suggestions.push('Search wires: GET /api/wires/search');
  }

  if (errorMessage.includes('Search query is required')) {
    suggestions.push('Add search parameter: ?search=your_query');
    suggestions.push('Example: GET /api/gsd?action=search&search=brake');
  }

  if (errorMessage.includes('Unknown action')) {
    suggestions.push('Valid actions: topology, search, tree, health');
    suggestions.push('Example: GET /api/gsd?action=topology&system=TRL');
  }

  if (suggestions.length === 0) {
    suggestions.push('Check API documentation for proper usage');
    suggestions.push('Verify request parameters are correct');
  }

  return suggestions;
}