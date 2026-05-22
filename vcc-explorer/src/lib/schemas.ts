import { z } from 'zod';

export const drawingFiltersSchema = z.object({
  system_code: z.string().optional(),
  drawing_no: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const equipmentFiltersSchema = z.object({
  car: z.string().optional(),
  system: z.string().optional(),
  connectors: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const wireFiltersSchema = z.object({
  search: z.string().optional(),
  voltage: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
});

export const connectorFiltersSchema = z.object({
  equipment: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  type: z.string().optional(),
  car: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const createApiResponse = <T>(data: T, meta?: { total?: number; page?: number; limit?: number }) => ({
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createErrorResponse = (message: string, code: string = 'UNKNOWN_ERROR') => ({
  error: {
    code,
    message,
    timestamp: new Date().toISOString(),
  },
});