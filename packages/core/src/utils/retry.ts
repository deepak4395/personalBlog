/**
 * Retry utility for API calls with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxAttempts || !opts.shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
