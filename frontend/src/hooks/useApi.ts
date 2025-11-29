import { useState, useEffect, useCallback } from 'react';
import { AxiosResponse } from 'axios';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom hook for data fetching with loading and error states.
 * Automatically fetches on mount and provides refetch capability.
 *
 * @param fetcher - Async function that returns the data
 * @param deps - Dependencies array (like useEffect deps)
 * @param options - Configuration options
 *
 * @example
 * const { data: units, loading, error, refetch } = useApi(
 *   () => api.get('/units'),
 *   []
 * );
 */
export function useApi<T>(
  fetcher: () => Promise<AxiosResponse<T>>,
  deps: React.DependencyList = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): UseApiReturn<T> {
  const { immediate = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
      onSuccess?.(response.data);
    } catch (e: unknown) {
      const errorMessage = extractErrorMessage(e);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...deps]);

  return { data, loading, error, refetch, setData };
}

/**
 * Hook for lazy data fetching - doesn't fetch on mount.
 * Call execute() to trigger the fetch.
 */
export function useLazyApi<T>(
  fetcher: () => Promise<AxiosResponse<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): Omit<UseApiReturn<T>, 'refetch'> & {
  execute: () => Promise<T | null>;
  refetch: () => Promise<T | null>;
} {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
      onSuccess?.(response.data);
      return response.data;
    } catch (e: unknown) {
      const errorMessage = extractErrorMessage(e);
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetcher, onSuccess, onError]);

  const refetch = execute;

  return { data, loading, error, refetch, setData, execute };
}

/**
 * Extract error message from various error types
 */
function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as {
      response?: { data?: { detail?: string | Array<{ msg: string }> } };
      message?: string;
    };

    if (err.response?.data?.detail) {
      const detail = err.response.data.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail.map(d => d.msg).join(', ');
      }
    }

    if (err.message) {
      return err.message;
    }
  }

  return 'An unexpected error occurred';
}

export default useApi;
