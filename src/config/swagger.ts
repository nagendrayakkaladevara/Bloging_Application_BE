import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API',
      version: '1.0.0',
      description: 'A comprehensive REST API for a blog platform with features including blog posts, comments, voting, tags, search, and calendar events.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Admin API Key for protected endpoints',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
          },
        },
        Blog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            slug: {
              type: 'string',
              example: 'my-blog-post',
            },
            meta: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: 'My Blog Post',
                },
                description: {
                  type: 'string',
                  example: 'A description of the blog post',
                },
                author: {
                  type: 'string',
                  example: 'John Doe',
                },
                publishedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2024-01-01T00:00:00Z',
                },
                readTime: {
                  type: 'integer',
                  example: 5,
                },
                coverImage: {
                  type: 'string',
                  format: 'uri',
                  nullable: true,
                },
              },
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['technology', 'programming'],
            },
            layout: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['single-column', 'two-column'],
                  example: 'single-column',
                },
                maxWidth: {
                  type: 'string',
                  example: '800px',
                },
                showTableOfContents: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
            settings: {
              type: 'object',
              properties: {
                enableVoting: {
                  type: 'boolean',
                  example: true,
                },
                enableSocialShare: {
                  type: 'boolean',
                  example: true,
                },
                enableComments: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
            commentsCount: {
              type: 'integer',
              example: 10,
            },
            voting: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                  example: true,
                },
                upvotes: {
                  type: 'integer',
                  example: 25,
                },
                downvotes: {
                  type: 'integer',
                  example: 2,
                },
                userVote: {
                  type: 'string',
                  enum: ['upvote', 'downvote', null],
                  nullable: true,
                },
              },
            },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                  },
                  url: {
                    type: 'string',
                  },
                  type: {
                    type: 'string',
                    enum: ['internal', 'external'],
                  },
                },
              },
            },
          },
        },
        BlogCreate: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 500,
              example: 'My New Blog Post',
            },
            description: {
              type: 'string',
              maxLength: 2000,
              example: 'A brief description of the blog post',
            },
            slug: {
              type: 'string',
              pattern: '^[a-z0-9-]+$',
              example: 'my-new-blog-post',
            },
            author: {
              type: 'string',
              maxLength: 255,
              example: 'John Doe',
            },
            coverImage: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/image.jpg',
            },
            layout: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['single-column', 'two-column'],
                  example: 'single-column',
                },
                maxWidth: {
                  type: 'string',
                  maxLength: 50,
                  example: '800px',
                },
                showTableOfContents: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
            settings: {
              type: 'object',
              properties: {
                enableVoting: {
                  type: 'boolean',
                  example: true,
                },
                enableSocialShare: {
                  type: 'boolean',
                  example: true,
                },
                enableComments: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
            status: {
              type: 'string',
              enum: ['published', 'archived'],
              example: 'published',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['technology', 'programming'],
            },
            blocks: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            comment: {
              type: 'string',
              example: 'Great article!',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CommentCreate: {
          type: 'object',
          required: ['name', 'comment'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              example: 'John Doe',
            },
            comment: {
              type: 'string',
              minLength: 1,
              maxLength: 5000,
              example: 'This is a great article!',
            },
          },
        },
        VoteRequest: {
          type: 'object',
          required: ['voteType'],
          properties: {
            voteType: {
              type: 'string',
              enum: ['upvote', 'downvote'],
              example: 'upvote',
            },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Technology',
            },
            slug: {
              type: 'string',
              example: 'technology',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            blogCount: {
              type: 'integer',
              example: 15,
            },
          },
        },
        CalendarEvent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              example: 'Conference 2024',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-06-15',
            },
            startTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              example: '09:00',
              nullable: true,
            },
            endTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              example: '17:00',
              nullable: true,
            },
            color: {
              type: 'string',
              enum: ['blue', 'green', 'purple', 'orange'],
              example: 'blue',
            },
            blogId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
          },
        },
        CalendarEventCreate: {
          type: 'object',
          required: ['title', 'date'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 255,
              example: 'Conference 2024',
            },
            description: {
              type: 'string',
              example: 'Annual technology conference',
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-06-15',
            },
            startTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              example: '09:00',
            },
            endTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              example: '17:00',
            },
            color: {
              type: 'string',
              enum: ['blue', 'green', 'purple', 'orange'],
              example: 'blue',
            },
            blogId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
        CommentStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['approved', 'pending', 'spam', 'deleted'],
              example: 'approved',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Blogs',
        description: 'Blog post management endpoints',
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints',
      },
      {
        name: 'Voting',
        description: 'Blog voting endpoints',
      },
      {
        name: 'Search',
        description: 'Search functionality endpoints',
      },
      {
        name: 'Tags',
        description: 'Tag management endpoints',
      },
      {
        name: 'Calendar',
        description: 'Calendar event management endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  // Support both .ts (development) and .js (production) files
  // When compiled, files are in dist/, so we check both source and dist locations
  // swagger-jsdoc will use whichever files exist
  apis: (() => {
    const routesPath = path.join(__dirname, '../routes');
    const appPath = path.join(__dirname, '../app');
    
    // Include both .ts and .js patterns
    // In development: .ts files in src/ will match
    // In production: .js files in dist/ will match
    // swagger-jsdoc will use whichever files exist
    return [
      path.join(routesPath, '*.ts'),
      path.join(routesPath, '*.js'),
      appPath + '.ts',
      appPath + '.js',
    ];
  })(),
};

export const swaggerSpec = swaggerJsdoc(options);
