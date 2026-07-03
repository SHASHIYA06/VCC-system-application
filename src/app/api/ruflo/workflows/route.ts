import { NextRequest, NextResponse } from 'next/server';
import { rufloExecutor, TaskResult, WorkflowResult } from '@/lib/services/ruflo-executor';
import { getAllWorkflows, getWorkflow, validateWorkflowConfig } from '@/config/ruflo.config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workflows = getAllWorkflows();
    const validation = validateWorkflowConfig();

    return NextResponse.json({
      success: true,
      workflows,
      validation,
      status: rufloExecutor.listWorkflows()
    });
  } catch (error) {
    console.error('Ruflo API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, context = {} } = body;

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const workflow = getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        { success: false, error: `Workflow "${workflowId}" not found` },
        { status: 404 }
      );
    }

    const result: WorkflowResult = await rufloExecutor.executeWorkflow(workflowId, context);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Ruflo execute error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
