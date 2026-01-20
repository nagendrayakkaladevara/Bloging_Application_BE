import dotenv from 'dotenv';

dotenv.config();

function ensureSslMode(url: string): string {
  if (!url) {
    return url;
  }

  const lower = url.toLowerCase();
  
  // Remove channel_binding=require as it can cause connection issues with Neon
  // Handle both ?channel_binding=require and &channel_binding=require cases
  // First remove &channel_binding=require (when it's not the first parameter)
  url = url.replace(/&channel_binding=require/gi, '');
  // Then handle ?channel_binding=require (when it's the first parameter)
  // If followed by other params, replace with ?; if it's the only param, remove entirely
  url = url.replace(/\?channel_binding=require(&|$)/gi, (_match, trailing) => trailing ? '?' : '');
  // Clean up any malformed query strings (e.g., ?& becomes ?)
  url = url.replace(/\?&+/g, '?');
  
  // For Neon, optimize connection string for serverless
  if (lower.includes('neon.tech')) {
    const hasQuery = url.includes('?');
    const separator = hasQuery ? '&' : '?';
    const params: string[] = [];
    
    // Ensure SSL mode is set
    if (!lower.includes('sslmode=')) {
      params.push('sslmode=require');
    }
    
    // Add connection timeout to prevent hanging (10 seconds)
    if (!lower.includes('connect_timeout=')) {
      params.push('connect_timeout=10');
    }
    
    // For pooler connections, add PgBouncer compatibility
    if (url.includes('pooler') && !lower.includes('pgbouncer=')) {
      // Note: pgbouncer=true is handled automatically by Neon pooler
      // But we can add connection pooling hints
    }
    
    if (params.length > 0) {
      url = `${url}${separator}${params.join('&')}`;
    }
    
    return url;
  }
  
  // For non-Neon databases, just ensure sslmode if not set
  if (!lower.includes('sslmode=')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}sslmode=prefer`;
  }

  return url;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const rawDatabaseUrl = process.env.DATABASE_URL || '';

// Only process database URL if it exists
const databaseUrl = rawDatabaseUrl ? ensureSslMode(rawDatabaseUrl) : '';
if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  databaseUrl,
  adminApiKey: process.env.ADMIN_API_KEY || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
  uploadDest: process.env.UPLOAD_DEST || './uploads',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  rateLimitAdminMaxRequests: parseInt(process.env.RATE_LIMIT_ADMIN_MAX_REQUESTS || '50', 10),
};

// Validate required environment variables
// Log warnings but don't throw during module initialization
// Let the application handle errors at runtime
if (!config.databaseUrl) {
  const errorMsg = 'DATABASE_URL is required. Please set it in your environment variables.';
  if (config.nodeEnv === 'production') {
    console.error('❌ Fatal error:', errorMsg);
    console.error('   The application will fail at runtime without DATABASE_URL');
  } else {
    console.warn('⚠️  Warning:', errorMsg);
    console.warn('   The application may not work correctly without DATABASE_URL');
  }
}

if (config.nodeEnv === 'production' && !config.adminApiKey) {
  console.warn('⚠️  Warning: ADMIN_API_KEY is not set in production. Admin endpoints may not be secure.');
}
