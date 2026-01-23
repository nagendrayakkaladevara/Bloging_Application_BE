# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `ADMIN_API_KEY` - A secret key for admin operations (generate a strong random string)

## 3. Set Up Database

1. Generate Prisma Client:
```bash
npm run prisma:generate
```

2. Run database migrations:
```bash
# Development (creates migration files)
npm run prisma:migrate

# Or for production (applies migrations)
npm run prisma:migrate:deploy
```

This will create all the necessary tables in your Neon database.

## 4. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` (or your configured port).

## 5. Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Get All Blogs
```bash
curl http://localhost:3000/api/v1/blogs
```

### Get a Blog by Slug
```bash
curl http://localhost:3000/api/v1/blogs/your-blog-slug
```

### Create a Blog (Admin)
```bash
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-admin-api-key" \
  -d '{
    "title": "My First Blog Post",
    "description": "This is a test blog post",
    "blocks": [
      {
        "type": "heading",
        "content": {
          "level": 1,
          "text": "Introduction"
        }
      },
      {
        "type": "paragraph",
        "content": {
          "text": "This is the content of my blog post."
        }
      }
    ],
    "tags": ["test", "getting-started"],
    "status": "published"
  }'
```

## API Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

## Next Steps

1. Review the [Documentation Index](../README.md) for full documentation
2. Check the [API Documentation](../api/README.md) for endpoint details
3. Customize the configuration in `.env`
4. Set up your frontend to connect to the API

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Neon database is accessible
- Ensure SSL is configured correctly (Neon requires SSL)

### Port Already in Use
- Change the `PORT` in `.env`
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  ```

### Migration Errors
- Make sure you're running the migration on a fresh database
- Check that the `uuid-ossp` extension is available
- Verify your database user has CREATE privileges
