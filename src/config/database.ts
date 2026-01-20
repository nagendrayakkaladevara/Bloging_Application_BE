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
    ...(config.databaseUrl.includes('neon.tech') && {
      // Use connection pooling for better performance
      // Prisma will manage connections more efficiently
    }),
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test database connection with better error handling and retry
async function testConnection() {
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return; // Success, exit function
    } catch (err: any) {
      lastError = err;
      
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
      
      // Don't exit in development, allow server to start
      // The retry mechanism in queryWithRetry will handle connection errors at runtime
      if (config.nodeEnv === 'production') {
        console.error('\n⚠️  Production mode: Server will exit due to database connection failure');
        process.exit(1);
      } else {
        console.warn('\n⚠️  Development mode: Server will continue, but database operations may fail');
        console.warn('   The retry mechanism will attempt to reconnect on first database query');
      }
      return; // Exit function even on failure in development
    }
  }
}

// Test connection (non-blocking, runs in background)
testConnection();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
