import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import blogRoutes from './routes/blogRoutes';
import searchRoutes from './routes/searchRoutes';
import tagRoutes from './routes/tagRoutes';
import calendarRoutes from './routes/calendarRoutes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS - Allow all origins
  app.use(
    cors({
      origin: true, // Allow all origins
      credentials: false,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Blog API Server',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        database: '/health/db',
        blogs: '/api/v1/blogs',
        search: '/api/v1/search',
        tags: '/api/v1/tags',
        calendar: '/api/v1/calendar'
      },
      timestamp: new Date().toISOString()
    });
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database health check
  app.get('/health/db', async (_req, res) => {
    try {
      const { prisma } = await import('./config/database');
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(503).json({ 
        status: 'error', 
        database: 'disconnected', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() 
      });
    }
  });

  // API routes
  app.use('/api/v1/blogs', blogRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/tags', tagRoutes);
  app.use('/api/v1/calendar', calendarRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
