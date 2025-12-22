import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  retryCondition?: (error: Error) => boolean;
}

interface RetryState {
  attempts: number;
  isRetrying: boolean;
  lastError: Error | null;
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
    retryCondition = () => true,
  } = options;

  const [state, setState] = useState<RetryState>({
    attempts: 0,
    isRetrying: false,
    lastError: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    let currentAttempt = 0;
    let lastError: Error | null = null;

    abortControllerRef.current = new AbortController();

    while (currentAttempt < maxAttempts) {
      try {
        setState({
          attempts: currentAttempt + 1,
          isRetrying: currentAttempt > 0,
          lastError: null,
        });

        const result = await asyncFn();

        setState({
          attempts: currentAttempt + 1,
          isRetrying: false,
          lastError: null,
        });

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        currentAttempt++;

        setState({
          attempts: currentAttempt,
          isRetrying: currentAttempt < maxAttempts,
          lastError,
        });

        // Check if we should retry
        if (currentAttempt >= maxAttempts || !retryCondition(lastError)) {
          break;
        }

        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Retry aborted');
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, currentAttempt - 1),
          maxDelay
        );

        onRetry?.(currentAttempt, lastError);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Max retry attempts reached');
  }, [asyncFn, maxAttempts, initialDelay, maxDelay, backoffMultiplier, onRetry, retryCondition]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      isRetrying: false,
      lastError: null,
    });
  }, []);

  return {
    execute,
    cancel,
    reset,
    ...state,
  };
}

// Utility function for simple retry without hook
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
    retryCondition = () => true,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt >= maxAttempts || !retryCondition(lastError)) {
        break;
      }

      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );

      onRetry?.(attempt, lastError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retry attempts reached');
}

// Network-aware retry - only retry on network errors
export function isNetworkError(error: Error): boolean {
  return (
    error.name === 'TypeError' ||
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed')
  );
}

export default useRetry;
