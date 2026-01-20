import { createApp } from '../src/app';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Debug: Log environment on first load
if (!process.env.VERCEL_DEBUG_LOGGED) {
  console.log('[Vercel] Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('- VERCEL:', !!process.env.VERCEL);
  console.log('- Node version:', process.version);
  process.env.VERCEL_DEBUG_LOGGED = 'true';
}

// Create the Express app instance (singleton pattern for serverless)
// This ensures the app is only created once per serverless function instance
let app: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!app) {
    try {
      console.log('[Vercel] Initializing Express app...');
      app = createApp();
      console.log('[Vercel] Express app initialized successfully');
    } catch (error) {
      console.error('[Vercel] Failed to create Express app:', error);
      if (error instanceof Error) {
        console.error('[Vercel] Error message:', error.message);
        console.error('[Vercel] Error stack:', error.stack);
      }
      throw error; // Re-throw to prevent app from being null
    }
  }
  return app;
}

// Export the handler for Vercel serverless functions
export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = getApp();
    // @vercel/node automatically converts Vercel req/res to Express format
    return expressApp(req as any, res as any);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (error instanceof Error) {
      console.error('[Vercel] Error message:', error.message);
      console.error('[Vercel] Error stack:', error.stack);
    }
    
    // Only send response if headers haven't been sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An internal server error occurred',
        },
      });
    }
  }
}
