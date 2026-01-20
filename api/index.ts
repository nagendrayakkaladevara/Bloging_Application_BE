import { createApp } from '../src/app';

// Create the Express app instance (singleton pattern for serverless)
// This ensures the app is only created once per serverless function instance
let app: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!app) {
    app = createApp();
  }
  return app;
}

// Export the handler for Vercel serverless functions
// Vercel will automatically pass the request and response objects
export default function handler(req: any, res: any) {
  const expressApp = getApp();
  return expressApp(req, res);
}
