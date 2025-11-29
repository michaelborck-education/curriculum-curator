import { useState, useCallback } from 'react';

export interface UseAsyncActionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseAsyncActionReturn<T, A extends unknown[]>
  extends UseAsyncActionState {
  execute: (...args: A) => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for handling async actions (form submissions, deletions, etc.)
 * with loading, error, and success states.
 *
 * @param action - Async function to execute
 * @param options - Configuration options
 *
 * @example
 * const { execute, loading, error, success } = useAsyncAction(
 *   async (id: string) => {
 *     await api.delete(`/items/${id}`);
 *   },
 *   {
 *     onSuccess: () => toast.success('Deleted!'),
 *     onError: (error) => toast.error(error),
 *   }
 * );
 *
 * <Button onClick={() => execute(itemId)} loading={loading}>
 *   Delete
 * </Button>
 */
export function useAsyncAction<T, A extends unknown[] = []>(
  action: (...args: A) => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: string) => void;
    resetOnExecute?: boolean;
  } = {}
): UseAsyncActionReturn<T, A> {
  const { onSuccess, onError, resetOnExecute = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      if (resetOnExecute) {
        setError(null);
        setSuccess(false);
      }

      try {
        setLoading(true);
        const result = await action(...args);
        setSuccess(true);
        onSuccess?.(result);
        return result;
      } catch (e: unknown) {
        const errorMessage = extractErrorMessage(e);
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, onSuccess, onError, resetOnExecute]
  );

  return { execute, loading, error, success, reset };
}

/**
 * Hook for confirmation dialogs before async actions.
 * Wraps useAsyncAction with a confirmation step.
 *
 * @example
 * const { execute, confirm, cancel, isPending, loading, error } = useConfirmedAction(
 *   async (id: string) => api.delete(`/items/${id}`),
 *   { confirmMessage: 'Are you sure you want to delete this item?' }
 * );
 *
 * // Call confirm() to show dialog, then execute() to perform action
 */
export function useConfirmedAction<T, A extends unknown[] = []>(
  action: (...args: A) => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: string) => void;
  } = {}
): UseAsyncActionReturn<T, A> & {
  isPending: boolean;
  pendingArgs: A | null;
  confirm: (...args: A) => void;
  cancel: () => void;
} {
  const [isPending, setIsPending] = useState(false);
  const [pendingArgs, setPendingArgs] = useState<A | null>(null);

  const asyncAction = useAsyncAction(action, options);

  const confirm = useCallback((...args: A) => {
    setPendingArgs(args);
    setIsPending(true);
  }, []);

  const cancel = useCallback(() => {
    setPendingArgs(null);
    setIsPending(false);
  }, []);

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      const result = await asyncAction.execute(...args);
      setIsPending(false);
      setPendingArgs(null);
      return result;
    },
    [asyncAction]
  );

  return {
    ...asyncAction,
    execute,
    isPending,
    pendingArgs,
    confirm,
    cancel,
  };
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

export default useAsyncAction;
