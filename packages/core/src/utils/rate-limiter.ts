/**
 * Rate limiter for API calls
 */

export class RateLimiter {
  private queue: Array<() => void> = [];
  private activeCount = 0;
  private lastRequestTime = 0;

  constructor(
    private readonly requestsPerMinute: number,
    private readonly maxConcurrent: number = 3
  ) {}

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    this.activeCount++;

    try {
      return await fn();
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }

  /**
   * Wait for an available slot
   */
  private async waitForSlot(): Promise<void> {
    if (this.activeCount >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    // Enforce requests per minute limit
    const minInterval = 60000 / this.requestsPerMinute;
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const resolve = this.queue.shift();
      resolve?.();
    }
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
