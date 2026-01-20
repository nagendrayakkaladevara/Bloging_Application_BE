import { createApp } from '../src/app';

// Create the Express app instance (singleton pattern for serverless)
// This ensures the app is only created once per serverless function instance
let app: ReturnType<typeof createApp> | null = null;
let initError: Error | null = null;

function getApp() {
  if (!app && !initError) {
    try {
      app = createApp();
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error));
      console.error('[Vercel] Failed to initialize app:', initError);
      throw initError;
    }
  }
  if (initError) {
    throw initError;
  }
  return app!;
}

// Export the handler for Vercel serverless functions
// Vercel will automatically pass the request and response objects
export default function handler(req: any, res: any) {
  try {
    const expressApp = getApp();
    return expressApp(req, res);
  } catch (error) {
    console.error('[Vercel] Handler error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INITIALIZATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to initialize application',
        },
      });
    }
  }
}
