/**
 * Ruflo Workflow Engine Configuration
 * Defines all workflow tasks and workflows for VCC system operations
 */

export interface RufloTask {
  id: string;
  name: string;
  description: string;
  retries: number;
  timeout: number;
  dependencies?: string[];
}

export interface RufloWorkflow {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  parallel?: boolean;
  notifyOnComplete?: boolean;
}

export interface RufloEngineConfig {
  engine: {
    enabled: boolean;
    maxConcurrent: number;
    timeout: number;
  };
  tasks: Record<string, RufloTask>;
  workflows: RufloWorkflow[];
  notifications: {
    enabled: boolean;
    onComplete: boolean;
    onError: boolean;
    channels: string[];
  };
}

export const rufloConfig: RufloEngineConfig = {
  engine: {
    enabled: true,
    maxConcurrent: 5,
    timeout: 300000  // 5 minutes max per workflow
  },

  tasks: {
    extractVCCDescription: {
      id: 'extract-vcc-description',
      name: 'Extract VCC Description',
      description: 'Extract system descriptions and technical specs from PDF documents',
      retries: 2,
      timeout: 45000  // 45 seconds
    },

    syncPDFMappings: {
      id: 'sync-pdf-mappings',
      name: 'Sync PDF Mappings',
      description: 'Synchronize drawing to PDF page mappings',
      retries: 3,
      timeout: 60000  // 60 seconds
    },

    verifyDrawingMappings: {
      id: 'verify-drawing-mappings',
      name: 'Verify Drawing Mappings',
      description: 'Verify accuracy of all drawing mappings',
      retries: 1,
      timeout: 30000  // 30 seconds
    },

    generateGSDTopology: {
      id: 'generate-gsd-topology',
      name: 'Generate GSD Topology',
      description: 'Generate enhanced GSD topology with metrics',
      retries: 2,
      timeout: 20000  // 20 seconds
    },

    indexDrawings: {
      id: 'index-drawings',
      name: 'Index Drawings',
      description: 'Create search indexes for all drawings',
      retries: 2,
      timeout: 45000
    },

    optimizeDatabase: {
      id: 'optimize-database',
      name: 'Optimize Database',
      description: 'Run database optimization and indexing',
      retries: 1,
      timeout: 90000  // 90 seconds
    },

    populateSampleData: {
      id: 'populate-sample-data',
      name: 'Populate Sample Data',
      description: 'Populate sample pin and wire data for testing',
      retries: 1,
      timeout: 30000
    }
  },

  workflows: [
    {
      id: 'complete-vcc-setup',
      name: 'Complete VCC Setup',
      description: 'Complete setup workflow for VCC system - runs all initialization tasks',
      tasks: [
        'optimize-database',
        'extract-vcc-description',
        'sync-pdf-mappings',
        'verify-drawing-mappings',
        'generate-gsd-topology',
        'index-drawings'
      ],
      parallel: false,
      notifyOnComplete: true
    },

    {
      id: 'daily-sync',
      name: 'Daily Sync',
      description: 'Daily synchronization workflow',
      tasks: [
        'sync-pdf-mappings',
        'verify-drawing-mappings',
        'generate-gsd-topology'
      ],
      parallel: false,
      notifyOnComplete: true
    },

    {
      id: 'quick-verify',
      name: 'Quick Verify',
      description: 'Quick verification of drawing mappings',
      tasks: [
        'verify-drawing-mappings'
      ],
      parallel: false,
      notifyOnComplete: false
    },

    {
      id: 'data-extraction',
      name: 'Data Extraction',
      description: 'Extract and index all data from PDFs',
      tasks: [
        'extract-vcc-description',
        'sync-pdf-mappings',
        'index-drawings'
      ],
      parallel: false,
      notifyOnComplete: true
    }
  ],

  notifications: {
    enabled: true,
    onComplete: true,
    onError: true,
    channels: ['console', 'email', 'webhook']
  }
};

export type RufloConfig = typeof rufloConfig;

/**
 * Get workflow configuration by ID
 */
export function getWorkflow(workflowId: string): RufloWorkflow | undefined {
  return rufloConfig.workflows.find(w => w.id === workflowId);
}

/**
 * Get task configuration by ID
 */
export function getTask(taskId: string): RufloTask | undefined {
  return Object.values(rufloConfig.tasks).find(t => t.id === taskId);
}

/**
 * Get all available workflows
 */
export function getAllWorkflows(): RufloWorkflow[] {
  return rufloConfig.workflows;
}

/**
 * Get all available tasks
 */
export function getAllTasks(): RufloTask[] {
  return Object.values(rufloConfig.tasks);
}

/**
 * Validate workflow configuration
 */
export function validateWorkflowConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const workflow of rufloConfig.workflows) {
    for (const taskId of workflow.tasks) {
      const task = Object.values(rufloConfig.tasks).find(t => t.id === taskId);
      if (!task) {
        errors.push(`Workflow "${workflow.id}" references unknown task "${taskId}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
