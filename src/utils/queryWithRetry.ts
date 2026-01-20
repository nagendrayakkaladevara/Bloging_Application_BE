/**
 * Wrapper function to retry Prisma queries on connection errors
 * Handles Neon's connection termination gracefully
 */
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection error that we should retry
      const isConnectionError =
        error?.code === 'P1001' || // Can't reach database server
        error?.code === 'P1008' || // Operations timed out
        error?.code === 'P1017' || // Server has closed the connection
        error?.message?.includes('terminating connection') ||
        error?.message?.includes('connection closed') ||
        error?.message?.includes('Connection terminated') ||
        error?.message?.includes('Can\'t reach database server');

      if (isConnectionError && attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff with jitter)
        const baseDelay = 500; // Start with 500ms instead of 1000ms
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 3000); // Max 3s instead of 5s
        const jitter = Math.random() * 200; // Add random jitter to avoid thundering herd
        const totalDelay = delay + jitter;
        
        // Only log in development to reduce production noise
        if (isDevelopment) {
          console.warn(`Connection error, retrying in ${Math.round(totalDelay)}ms (attempt ${attempt + 1}/${maxRetries})...`);
        }
        
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
        
        // Try to reconnect before retrying
        try {
          await (globalThis as any).prisma?.$connect?.();
        } catch {
          // Ignore reconnection errors, let the query retry handle it
        }
        
        continue;
      }
      
      // Not a connection error or max retries reached
      throw error;
    }
  }
  
  throw lastError;
}
