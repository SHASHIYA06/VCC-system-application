/**
 * Ruflo Workflow Executor Service
 * Executes workflow tasks in sequence or parallel
 * Handles task scheduling, retry logic, and result aggregation
 */

import { rufloConfig, getWorkflow, getTask } from '@/config/ruflo.config';

export interface TaskResult {
  taskId: string;
  taskName: string;
  status: 'success' | 'failed' | 'skipped' | 'timeout';
  result?: any;
  error?: string;
  startTime: number;
  endTime: number;
  duration: number;
  retryAttempt: number;
}

export interface WorkflowResult {
  workflowId: string;
  workflowName: string;
  status: 'success' | 'partial' | 'failed';
  tasks: TaskResult[];
  summary: {
    totalTasks: number;
    successful: number;
    failed: number;
    skipped: number;
    totalDuration: number;
  };
  startTime: number;
  endTime: number;
  timestamp: string;
}

export interface TaskExecutionContext {
  workflowId: string;
  taskId: string;
  retryAttempt: number;
  previousResults: TaskResult[];
  context: Record<string, any>;
}

/**
 * Ruflo Workflow Executor
 * Manages workflow execution with retry logic and monitoring
 */
class RufloExecutorService {
  private readonly maxConcurrent: number;
  private activeExecutions: Map<string, boolean> = new Map();

  constructor(maxConcurrent?: number) {
    this.maxConcurrent = maxConcurrent || rufloConfig.engine.maxConcurrent;
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: Record<string, any> = {}
  ): Promise<WorkflowResult> {
    const workflowStartTime = Date.now();
    const workflow = getWorkflow(workflowId);

    if (!workflow) {
      throw new Error(`Workflow "${workflowId}" not found in configuration`);
    }

    console.log(`\n🚀 Executing workflow: ${workflow.name}`);
    console.log(`📋 Tasks: ${workflow.tasks.join(', ')}\n`);

    const taskResults: TaskResult[] = [];

    try {
      // Execute tasks
      if (workflow.parallel) {
        // Execute in parallel
        const promises = workflow.tasks.map(taskId =>
          this.executeTask(workflowId, taskId, context, taskResults)
        );
        await Promise.all(promises);
      } else {
        // Execute sequentially
        for (const taskId of workflow.tasks) {
          const result = await this.executeTask(workflowId, taskId, context, taskResults);
          taskResults.push(result);

          // Stop if critical failure
          if (result.status === 'failed' && result.retryAttempt > 0) {
            console.warn(`⚠️ Task "${result.taskId}" failed after retries, continuing...`);
          }
        }
      }

      // Generate summary
      const summary = {
        totalTasks: workflow.tasks.length,
        successful: taskResults.filter(t => t.status === 'success').length,
        failed: taskResults.filter(t => t.status === 'failed').length,
        skipped: taskResults.filter(t => t.status === 'skipped').length,
        totalDuration: Date.now() - workflowStartTime
      };

      const status =
        summary.failed === 0 ? 'success' :
        summary.successful > 0 ? 'partial' :
        'failed';

      const result: WorkflowResult = {
        workflowId,
        workflowName: workflow.name,
        status,
        tasks: taskResults,
        summary,
        startTime: workflowStartTime,
        endTime: Date.now(),
        timestamp: new Date().toISOString()
      };

      // Log completion
      console.log(`\n✅ Workflow "${workflow.name}" completed with status: ${status}`);
      console.log(`📊 Summary: ${summary.successful}/${summary.totalTasks} tasks successful`);
      console.log(`⏱️  Total duration: ${summary.totalDuration}ms\n`);

      return result;

    } catch (error) {
      console.error(`❌ Workflow "${workflow.name}" failed:`, error);

      return {
        workflowId,
        workflowName: workflow.name,
        status: 'failed',
        tasks: taskResults,
        summary: {
          totalTasks: workflow.tasks.length,
          successful: taskResults.filter(t => t.status === 'success').length,
          failed: taskResults.filter(t => t.status === 'failed').length,
          skipped: taskResults.filter(t => t.status === 'skipped').length,
          totalDuration: Date.now() - workflowStartTime
        },
        startTime: workflowStartTime,
        endTime: Date.now(),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute a single task with retry logic
   */
  private async executeTask(
    workflowId: string,
    taskId: string,
    context: Record<string, any>,
    previousResults: TaskResult[]
  ): Promise<TaskResult> {
    const task = getTask(taskId);

    if (!task) {
      console.warn(`⚠️ Task "${taskId}" not found in configuration`);
      return {
        taskId,
        taskName: taskId,
        status: 'skipped',
        error: 'Task not found',
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        retryAttempt: 0
      };
    }

    let lastError: any;
    let result: TaskResult | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= task.retries; attempt++) {
      const taskStartTime = Date.now();

      try {
        console.log(`⏳ Running task: ${task.name} (attempt ${attempt + 1}/${task.retries + 1})`);

        // Execute actual task
        const taskResult = await this.executeTaskImpl(
          workflowId,
          taskId,
          task.name,
          context,
          previousResults
        );

        result = {
          taskId,
          taskName: task.name,
          status: 'success',
          result: taskResult,
          startTime: taskStartTime,
          endTime: Date.now(),
          duration: Date.now() - taskStartTime,
          retryAttempt: attempt
        };

        console.log(`✅ Task completed: ${task.name} (${result.duration}ms)`);
        return result;

      } catch (error) {
        lastError = error;
        const taskDuration = Date.now() - taskStartTime;

        if (attempt < task.retries) {
          console.warn(
            `⚠️ Task "${task.name}" failed (attempt ${attempt + 1}), retrying... ` +
            `(${taskDuration}ms)`
          );
          // Exponential backoff
          await new Promise(resolve =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        } else {
          console.error(`❌ Task failed: ${task.name} after ${attempt + 1} attempts`);
          result = {
            taskId,
            taskName: task.name,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            startTime: taskStartTime,
            endTime: Date.now(),
            duration: Date.now() - taskStartTime,
            retryAttempt: attempt
          };
        }
      }
    }

    return result || {
      taskId,
      taskName: task.name,
      status: 'failed',
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      retryAttempt: task.retries
    };
  }

  /**
   * Actual task implementation
   * This is where specific task logic would be executed
   */
  private async executeTaskImpl(
    workflowId: string,
    taskId: string,
    taskName: string,
    context: Record<string, any>,
    previousResults: TaskResult[]
  ): Promise<any> {
    // Simulate task execution
    // In a real implementation, this would call actual services

    switch (taskId) {
      case 'extract-vcc-description':
        return await this.taskExtractVCCDescription(context);

      case 'sync-pdf-mappings':
        return await this.taskSyncPDFMappings(context);

      case 'verify-drawing-mappings':
        return await this.taskVerifyDrawingMappings(context);

      case 'generate-gsd-topology':
        return await this.taskGenerateGSDTopology(context);

      case 'index-drawings':
        return await this.taskIndexDrawings(context);

      case 'optimize-database':
        return await this.taskOptimizeDatabase(context);

      case 'populate-sample-data':
        return await this.taskPopulateSampleData(context);

      default:
        throw new Error(`Unknown task: ${taskId}`);
    }
  }

  /**
   * Task implementations
   */

  private async taskExtractVCCDescription(context: any) {
    // Simulate VCC description extraction
    return {
      status: 'completed',
      extracted: 10,
      message: 'VCC descriptions extracted successfully'
    };
  }

  private async taskSyncPDFMappings(context: any) {
    // Simulate PDF mapping sync
    return {
      status: 'completed',
      synced: 574,
      message: 'PDF mappings synchronized'
    };
  }

  private async taskVerifyDrawingMappings(context: any) {
    // Simulate drawing verification
    return {
      status: 'completed',
      verified: 23,
      total: 574,
      percentage: 4,
      message: 'Drawing mappings verified'
    };
  }

  private async taskGenerateGSDTopology(context: any) {
    // Simulate GSD topology generation
    return {
      status: 'completed',
      nodes: 10,
      edges: 9,
      message: 'GSD topology generated'
    };
  }

  private async taskIndexDrawings(context: any) {
    // Simulate drawing indexing
    return {
      status: 'completed',
      indexed: 574,
      message: 'All drawings indexed'
    };
  }

  private async taskOptimizeDatabase(context: any) {
    // Simulate database optimization
    return {
      status: 'completed',
      message: 'Database optimized'
    };
  }

  private async taskPopulateSampleData(context: any) {
    // Simulate sample data population
    return {
      status: 'completed',
      populated: 100,
      message: 'Sample data populated'
    };
  }

  /**
   * Get workflow status
   */
  getStatus(workflowId: string): string {
    return this.activeExecutions.get(workflowId) ? 'running' : 'idle';
  }

  /**
   * List all available workflows
   */
  listWorkflows() {
    return rufloConfig.workflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      taskCount: w.tasks.length
    }));
  }
}

// Export singleton instance
export const rufloExecutor = new RufloExecutorService();
