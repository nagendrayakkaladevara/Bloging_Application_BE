# Blog Platform API Backend

Production-level Express.js + TypeScript backend for a blog platform with PostgreSQL (Neon) database.

## Features

- ✅ RESTful API with TypeScript
- ✅ PostgreSQL database with Neon
- ✅ Blog management (CRUD operations)
- ✅ Anonymous voting system (IP-based)
- ✅ Comments system with moderation
- ✅ Full-text search
- ✅ Tags management
- ✅ Calendar events
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Security headers (Helmet)
- ✅ Request logging

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **Validation:** express-validator
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Neon or local)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

3. Update `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
NODE_ENV=development
ADMIN_API_KEY=your-secret-admin-api-key-here
CORS_ORIGIN=http://localhost:3001
```

### Database Setup

1. Generate Prisma Client:

```bash
npm run prisma:generate
```

2. Run the database migrations:

```bash
# Development (creates migration files)
npm run prisma:migrate

# Production (applies migrations without creating files)
npm run prisma:migrate:deploy
```

This will create all the necessary tables in your database.

### Running the Application

**Development mode (with hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## 📚 Documentation

Complete documentation is available in the [`documentation/`](./documentation/) folder, organized by topic:

### Quick Links

- **[📖 Documentation Index](./documentation/README.md)** - Complete documentation overview
- **[🚀 Quick Start Guide](./documentation/deployment/QUICKSTART.md)** - Get started quickly
- **[📡 API Documentation](./documentation/api/README.md)** - Complete API reference
- **[🚢 Deployment Guide](./documentation/deployment/README.md)** - Production deployment
- **[🧪 Development Guide](./documentation/development/README.md)** - Development and testing
- **[🐛 Troubleshooting](./documentation/troubleshooting/README.md)** - Common issues and solutions

### Documentation Structure

```
documentation/
├── README.md                    # Documentation index
├── api/                         # API documentation
│   ├── API_DOCUMENTATION.md     # Complete API reference
│   ├── API_QUICK_REFERENCE.md   # Quick endpoint lookup
│   ├── Postman_Setup.md         # Postman collection setup
│   └── Blog_API.postman_collection.json
├── deployment/                  # Deployment guides
│   ├── QUICKSTART.md            # Quick start guide
│   ├── DEPLOYMENT_CHECKLIST.md  # Deployment checklist
│   ├── VERCEL_DEPLOYMENT.md     # Vercel deployment
│   └── VERCEL_DEPLOYMENT_TROUBLESHOOTING.md
├── development/                 # Development guides
│   └── TESTING_GUIDE.md         # Testing instructions
└── troubleshooting/             # Troubleshooting
    └── SERVERLESS_ERROR_EXPLANATION.md
```

### API Quick Reference

**Base URL:**
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

**Main Endpoints:**
- `GET /api/v1/blogs` - Get all blogs
- `GET /api/v1/blogs/:slug` - Get blog by slug
- `POST /api/v1/blogs` - Create blog (admin)
- `GET /api/v1/search?q=query` - Search blogs
- `GET /api/v1/tags` - Get all tags

**Admin Authentication:**
Admin endpoints require `X-API-Key` header. See [API Documentation](./documentation/api/README.md) for details.

For complete API documentation, see [documentation/api/](./documentation/api/README.md).

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # Database connection
│   └── env.ts       # Environment variables
├── controllers/     # Request handlers
├── middleware/      # Express middleware
│   ├── auth.ts      # API key authentication
│   ├── errorHandler.ts
│   ├── rateLimiter.ts
│   └── validation.ts
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `ADMIN_API_KEY` | API key for admin operations | Required in production |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3001 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 60000 |

## Rate Limiting

- **Public endpoints:** 100 requests per minute per IP
- **Admin endpoints:** 50 requests per minute per API key
- **Comments:** 5 comments per hour per IP

## Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Invalid or missing API key
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate slug)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Type check without building

### Database Migrations

We use Prisma Migrate for database schema management:

- **Development:** `npm run prisma:migrate` - Creates and applies migrations
- **Production:** `npm run prisma:migrate:deploy` - Applies existing migrations
- **Prisma Studio:** `npm run prisma:studio` - Visual database browser

All migrations are stored in `prisma/migrations/`.

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention (parameterized queries)
- API key authentication for admin endpoints

## Testing

See the [Testing Guide](./documentation/development/TESTING_GUIDE.md) for comprehensive testing instructions.

```bash
npm test
```

## Production Deployment

For detailed deployment instructions, see the [Deployment Documentation](./documentation/deployment/README.md).

**Quick Steps:**
1. Set `NODE_ENV=production`
2. Set a strong `ADMIN_API_KEY`
3. Configure `CORS_ORIGIN` to your frontend domain
4. Ensure database connection is secure (SSL)
5. Follow the [Deployment Checklist](./documentation/deployment/DEPLOYMENT_CHECKLIST.md)

For Vercel deployment, see [Vercel Deployment Guide](./documentation/deployment/VERCEL_DEPLOYMENT.md).

## License

MIT
