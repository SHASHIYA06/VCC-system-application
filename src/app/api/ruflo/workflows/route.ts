/**
 * Ruflo Workflow API
 * GET /api/ruflo/workflows - List all workflows
 * POST /api/ruflo/workflows - Execute a workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { rufloExecutor } from '@/lib/services/ruflo-executor';
import { getAllWorkflows, validateWorkflowConfig } from '@/config/ruflo.config';

/**
 * GET /api/ruflo/workflows
 * List all available workflows
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    let result;

    switch (action) {
      case 'list':
        console.log('📋 Listing all workflows...');
        result = rufloExecutor.listWorkflows();
        break;

      case 'validate':
        console.log('✔️ Validating workflow configuration...');
        result = validateWorkflowConfig();
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Workflow list error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/ruflo/workflows
 * Execute a workflow
 */
export async function POST(request: NextRequest) {
  const workflowStartTime = Date.now();

  try {
    const body = await request.json();
    const { workflowId, context } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      );
    }

    // Validate workflow exists
    const workflows = getAllWorkflows();
    const workflow = workflows.find(w => w.id === workflowId);

    if (!workflow) {
      return NextResponse.json(
        { error: `Workflow "${workflowId}" not found` },
        { status: 404 }
      );
    }

    console.log(`🚀 Initiating workflow execution: ${workflow.name}`);

    // Execute workflow
    const result = await rufloExecutor.executeWorkflow(
      workflowId,
      context || {}
    );

    const totalTime = Date.now() - workflowStartTime;

    return NextResponse.json({
      success: result.status !== 'failed',
      workflow: {
        id: result.workflowId,
        name: result.workflowName,
        status: result.status
      },
      summary: result.summary,
      tasks: result.tasks.map(t => ({
        id: t.taskId,
        name: t.taskName,
        status: t.status,
        duration: t.duration,
        retries: t.retryAttempt,
        error: t.error
      })),
      executionTime: totalTime,
      timestamp: result.timestamp
    });

  } catch (error) {
    const totalTime = Date.now() - workflowStartTime;

    console.error('❌ Workflow execution error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: totalTime,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
