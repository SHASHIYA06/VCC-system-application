/**
 * Ruflo Workflow API - Execute and Monitor Workflows
 * GET /api/ruflo/workflows - List all workflows and status
 * POST /api/ruflo/workflows - Execute a specific workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { rufloExecutor } from '@/lib/services/ruflo-executor';
import { getAllWorkflows, validateWorkflowConfig } from '@/config/ruflo.config';

export const maxDuration = 60;

export async function GET() {
  try {
    const workflows = getAllWorkflows();
    const validation = validateWorkflowConfig();

    return NextResponse.json({
      success: true,
      data: {
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          taskCount: w.tasks.length,
          tasks: w.tasks,
          parallel: w.parallel || false,
          status: rufloExecutor.getStatus(w.id),
        })),
        validation,
        engine: {
          status: 'active',
          maxConcurrent: 5,
          availableWorkflows: workflows.length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list workflows', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workflowId, context = {} } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 API: Executing workflow "${workflowId}"`);

    const result = await rufloExecutor.executeWorkflow(workflowId, context);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Ruflo workflow execution error:', error);
    return NextResponse.json(
      { error: 'Workflow execution failed', details: String(error) },
      { status: 500 }
    );
  }
}
