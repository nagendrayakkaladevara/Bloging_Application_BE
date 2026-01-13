import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  adminApiKey: process.env.ADMIN_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  rateLimitAdminMaxRequests: parseInt(process.env.RATE_LIMIT_ADMIN_MAX_REQUESTS || '50', 10),
};

// Validate required environment variables
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (config.nodeEnv === 'production' && !config.adminApiKey) {
  throw new Error('ADMIN_API_KEY is required in production');
}
