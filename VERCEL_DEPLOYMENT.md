# Vercel Deployment Guide

This guide will help you deploy your blog backend to Vercel.

## Changes Made for Vercel

1. **Created serverless function handler** (`api/index.ts`)
   - Exports Express app as a Vercel serverless function
   - Uses singleton pattern to reuse app instance

2. **Created Vercel configuration** (`vercel.json`)
   - Routes all requests to the serverless function
   - Sets max duration to 30 seconds

3. **Updated environment variable handling** (`src/config/env.ts`)
   - More graceful error handling for missing env vars
   - Won't crash during module initialization

4. **Added build scripts** (`package.json`)
   - `postinstall` script ensures Prisma Client is generated
   - Build script includes Prisma generation

## Deployment Steps

### 1. Install Dependencies

Make sure you have the latest dependencies:

```bash
npm install
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string (Neon recommended)
- `NODE_ENV` - Set to `production`

**Optional but Recommended:**
- `ADMIN_API_KEY` - API key for admin endpoints
- `CORS_ORIGIN` - Your frontend URL (e.g., `https://your-frontend.vercel.app`)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in ms (default: 60000)

### 3. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option B: Using Git Integration**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel dashboard
3. Vercel will automatically detect the configuration

### 4. Run Database Migrations

After deployment, run migrations:

```bash
vercel env pull .env.local
npm run prisma:migrate:deploy
```

Or use Vercel CLI to run migrations:
```bash
vercel --prod -- npm run prisma:migrate:deploy
```

## Important Notes

1. **Database Connection**: Make sure your `DATABASE_URL` uses a connection pooler (like Neon's pooler) for better serverless performance.

2. **CORS**: Update `CORS_ORIGIN` to match your frontend URL. You can use wildcards like `https://*.vercel.app` for preview deployments.

3. **Cold Starts**: The first request after inactivity may be slower due to cold starts. This is normal for serverless functions.

4. **Function Timeout**: The function is configured with a 30-second timeout. Adjust in `vercel.json` if needed.

5. **Prisma Client**: The `postinstall` script ensures Prisma Client is generated during build.

## Troubleshooting

### 500 Internal Server Error

1. **Check Environment Variables**: Ensure `DATABASE_URL` is set correctly in Vercel dashboard
2. **Check Logs**: Go to Vercel dashboard → Your project → Functions → View logs
3. **Database Connection**: Verify your database is accessible and not paused (for Neon)
4. **Prisma Client**: Ensure Prisma Client is generated (check build logs)

### Database Connection Issues

- Use Neon's connection pooler URL (ends with `?sslmode=require`)
- Ensure your database is not paused
- Check firewall/network settings

### CORS Errors

- Update `CORS_ORIGIN` environment variable to match your frontend URL
- For multiple origins, you may need to update the CORS configuration in `src/app.ts`

## Testing the Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/health`
2. **Database Health**: `https://your-app.vercel.app/health/db`
3. **API Endpoint**: `https://your-app.vercel.app/api/v1/blogs`

## Local Development

For local development, continue using:

```bash
npm run dev
```

This uses the traditional Express server setup, not the serverless function.
