import { useState, useCallback } from 'react';
import { useFetch, useDebounce } from './useApi';
import api from '@/lib/api-client';

export interface Drawing {
  id: string;
  drawingNo: string;
  title: string;
  revision: string;
  totalSheets: number;
  system?: { code: string; name: string };
  remarks?: string;
  connectorCount?: number;
  trainlineCount?: number;
}

interface DrawingsResponse {
  data: Drawing[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

interface UseDrawingsOptions {
  systemCode?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseDrawingsResult {
  drawings: Drawing[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
}

export function useDrawings(options: UseDrawingsOptions = {}): UseDrawingsResult {
  const [page, setPage] = useState(options.page || 1);
  const [search, setSearchState] = useState(options.search || '');
  const searchDebounced = useDebounce(search, 300);

  const fetchFn = useCallback(async () => {
    const result = await api.drawings.list({
      system_code: options.systemCode,
      drawing_no: searchDebounced || undefined,
      page,
      limit: options.limit || 20,
    });
    return result as unknown as DrawingsResponse;
  }, [options.systemCode, searchDebounced, page, options.limit]);

  const { data, loading, error, refetch } = useFetch<DrawingsResponse>(fetchFn);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  return {
    drawings: data?.data || [],
    total: data?.meta?.total || 0,
    page: data?.meta?.page || 1,
    totalPages: Math.ceil((data?.meta?.total || 0) / (options.limit || 20)),
    loading,
    error,
    refetch,
    setPage,
    setSearch,
  };
}

export function useDrawing(drawingId: string) {
  const fetchFn = useCallback(async () => {
    return api.drawings.get(drawingId);
  }, [drawingId]);

  const { data, loading, error, refetch } = useFetch(fetchFn);

  return { drawing: data, loading, error, refetch };
}