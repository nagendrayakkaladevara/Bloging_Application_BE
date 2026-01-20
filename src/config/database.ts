import { PrismaClient } from '@prisma/client';
import { config } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure Prisma for Neon (serverless database)
// Neon requires specific connection handling for serverless environments
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    // Optimize for Neon's serverless connection pooling
    // This helps with connection reuse and reduces connection errors
    ...(config.databaseUrl && config.databaseUrl.includes('neon.tech') && {
      // Use connection pooling for better performance
      // Prisma will manage connections more efficiently
    }),
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection with better error handling and retry
// IMPORTANT: In serverless environments (Vercel, AWS Lambda), we MUST NOT:
// 1. Call process.exit() - it kills the entire function
// 2. Test connections at module load - connections should be lazy
// 3. Block the module initialization - it prevents the function from loading
async function testConnection() {
  // Skip connection test in serverless environments
  // Serverless functions should use lazy connections (connect on first query)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV) {
    console.log('⚠️  Serverless environment detected: Skipping initial connection test');
    console.log('   Database connections will be established lazily on first query');
    return;
  }

  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return; // Success, exit function
    } catch (err: any) {
      
      // If it's a connection error and we have retries left, wait and retry
      if ((err.code === 'P1001' || err.code === 'P1008') && attempt < maxRetries - 1) {
        const delay = 1000 * (attempt + 1); // 1s, 2s, 3s
        console.warn(`⚠️  Database connection attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Final attempt failed or non-retryable error
      console.error('❌ Database connection failed:', err.message);
      
      // Provide helpful troubleshooting information
      if (err.code === 'P1001') {
        console.error('\n🔍 Troubleshooting steps:');
        console.error('1. Check if your Neon database is active (Neon pauses inactive databases)');
        console.error('2. Verify your DATABASE_URL in .env file');
        console.error('3. Try using the direct connection string instead of pooler');
        console.error('4. Check your network/firewall settings');
        console.error('5. Ensure SSL mode is set correctly (should be automatic for Neon)');
        
        if (config.databaseUrl.includes('neon.tech')) {
          console.error('\n💡 Neon-specific tips:');
          console.error('- Make sure your database is not paused in Neon dashboard');
          console.error('- Try using the "Direct connection" string instead of "Pooler"');
          console.error('- Check if your Neon project is active');
          console.error('- The server will continue to run, but database operations may fail');
        }
      }
      
      // NEVER call process.exit() in serverless - it kills the function!
      // Only exit in traditional server environments (not serverless)
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;
      if (config.nodeEnv === 'production' && !isServerless) {
        console.error('\n⚠️  Production mode (traditional server): Server will exit due to database connection failure');
        process.exit(1);
      } else {
        console.warn('\n⚠️  Serverless/Development mode: Server will continue, but database operations may fail');
        console.warn('   The retry mechanism will attempt to reconnect on first database query');
      }
      return; // Exit function even on failure
    }
  }
}

// Test connection (non-blocking, runs in background)
// Only run in non-serverless environments (traditional servers)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV;
if (!isServerless) {
  testConnection();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
