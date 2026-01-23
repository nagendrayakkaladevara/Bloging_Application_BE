import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
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

  // Swagger UI
  // Use CDN assets for Vercel serverless compatibility
  // In Vercel, static files from node_modules aren't served correctly,
  // so we use CDN-hosted assets instead
  const swaggerOptions: swaggerUi.SwaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Blog API Documentation',
  };

  // For Vercel, use CDN assets to avoid static file serving issues
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    // Serve the spec as JSON first (before HTML routes)
    app.get('/api-docs/swagger.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(swaggerSpec);
    });

    // Use custom HTML with CDN links
    const customHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Blog API Documentation</title>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
          <style>
            .swagger-ui .topbar { display: none; }
          </style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = function() {
              const ui = SwaggerUIBundle({
                url: './swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
              });
            };
          </script>
        </body>
      </html>
    `;

    // Serve the custom HTML
    app.get('/api-docs', (_req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(customHtml);
    });

    // Handle /api-docs/ route
    app.get('/api-docs/', (_req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.send(customHtml);
    });
  } else {
    // In development, use default asset serving
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
  }

  // Root endpoint
  /**
   * @swagger
   * /:
   *   get:
   *     summary: API root endpoint
   *     description: Returns API information and available endpoints
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: API information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Blog API Server
   *                 version:
   *                   type: string
   *                   example: 1.0.0
   *                 endpoints:
   *                   type: object
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
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
        calendar: '/api/v1/calendar',
        swagger: '/api-docs'
      },
      timestamp: new Date().toISOString()
    });
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     description: Check if the API server is running
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * @swagger
   * /health/db:
   *   get:
   *     summary: Database health check endpoint
   *     description: Check if the database connection is working
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Database is connected
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 database:
   *                   type: string
   *                   example: connected
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       503:
   *         description: Database connection failed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 database:
   *                   type: string
   *                   example: disconnected
   *                 error:
   *                   type: string
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
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
