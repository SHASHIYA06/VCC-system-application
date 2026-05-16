const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}

interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: ApiError;
}

class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string | number | undefined> }
): Promise<T> {
  const { params, ...fetchOptions } = options || {};
  
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...fetchOptions,
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || result.error) {
    throw new ApiClientError(
      result.error?.message || `Request failed with status ${response.status}`,
      result.error?.code || 'API_ERROR',
      response.status
    );
  }

  return result.data;
}

export const api = {
  drawings: {
    list: (params?: { system_code?: string; drawing_no?: string; page?: number; limit?: number }) =>
      fetchApi<ApiResponse<unknown>>('/api/drawings', { params }),
    get: (id: string) => fetchApi<unknown>(`/api/drawings/${id}`),
  },

  systems: {
    list: () => fetchApi<unknown>('/api/systems'),
    get: (code: string) => fetchApi<unknown>(`/api/systems/${code}`),
  },

  wires: {
    list: (params?: { search?: string; voltage?: string; limit?: number; page?: number }) =>
      fetchApi<unknown>('/api/wires', { params }),
    get: (wireNo: string) => fetchApi<unknown>(`/api/wires/${wireNo}`),
  },

  equipment: {
    list: (params?: { car?: string; system?: string; connectors?: boolean }) =>
      fetchApi<unknown>('/api/equipment', { params }),
    get: (code: string) => fetchApi<unknown>(`/api/equipment/${code}`),
  },

  connectors: {
    list: (params?: { equipment?: string }) =>
      fetchApi<unknown>('/api/connectors', { params }),
  },

  search: (query: string, type?: string, car?: string) =>
    fetchApi<unknown>('/api/search', { params: { q: query, type, car } }),

  stats: () => fetchApi<unknown>('/api/stats'),

  cars: () => fetchApi<unknown>('/api/cars'),
  
  trainlines: {
    list: () => fetchApi<unknown>('/api/trainlines'),
    get: (trainlineNo: number) => fetchApi<unknown>(`/api/trainlines/${trainlineNo}`),
  },

  tcms: () => fetchApi<unknown>('/api/tcms'),
};

export { ApiClientError };
export type { ApiResponse, ApiError };

export default api;