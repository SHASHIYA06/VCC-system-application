import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

export interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  executionTime?: number;
}

/**
 * Log audit events for compliance and debugging
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: input.changes,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        status: input.status || 'SUCCESS',
        errorMessage: input.errorMessage,
        executionTime: input.executionTime,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log query performance metrics
 */
export async function logQueryPerformance(
  queryType: string,
  executionTime: number,
  rowsAffected?: number,
  cacheHit: boolean = false
): Promise<void> {
  try {
    const queryHash = generateQueryHash(queryType);
    await prisma.queryPerformance.create({
      data: {
        queryType,
        executionTime,
        rowsAffected,
        cacheHit,
        queryHash,
      },
    });
  } catch (error) {
    console.error('Failed to log query performance:', error);
  }
}

/**
 * Generate a hash of the query type for tracking
 */
function generateQueryHash(queryType: string): string {
  return Buffer.from(queryType).toString('base64');
}

/**
 * Get recent audit logs
 */
export async function getAuditLogs(
  limit: number = 100,
  entityType?: string,
  userId?: string
) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType && { entityType }),
      ...(userId && { userId }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Extract client info from request headers
 */
export function getClientInfo(request: Request) {
  const headers = request.headers;
  return {
    ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    userAgent: headers.get('user-agent') || 'unknown',
  };
}
