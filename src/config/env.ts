import dotenv from 'dotenv';

dotenv.config();

function ensureSslMode(url: string): string {
  if (!url) {
    return url;
  }

  const lower = url.toLowerCase();
  
  // Remove channel_binding=require as it can cause connection issues with Neon
  url = url.replace(/[&?]channel_binding=require/gi, '');
  
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

const databaseUrl = ensureSslMode(process.env.DATABASE_URL || '');
process.env.DATABASE_URL = databaseUrl;

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
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
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (config.nodeEnv === 'production' && !config.adminApiKey) {
  throw new Error('ADMIN_API_KEY is required in production');
}
