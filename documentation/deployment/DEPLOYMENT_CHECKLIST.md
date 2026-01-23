# 🚀 Vercel Deployment Checklist

Your application is **ready to deploy**! Follow these steps:

## ✅ Pre-Deployment Checklist

- [x] TypeScript configuration fixed
- [x] Serverless compatibility verified
- [x] Build scripts configured
- [x] Vercel configuration ready

## 📋 Step-by-Step Deployment Guide

### Step 1: Push Your Code to Git (if using Git integration)

If you're using Vercel's Git integration:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect the configuration

**Option B: Using Vercel CLI**
```bash
npm install -g vercel
vercel
```
Follow the prompts to deploy.

### Step 3: Add Environment Variables in Vercel

**IMPORTANT:** You must add these environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string (Neon recommended) |
| `NODE_ENV` | `production` | Set to production |

#### Recommended Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `ADMIN_API_KEY` | `your-secret-key-here` | Strong random string for admin API authentication |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Your frontend URL (or `*` for development) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window (optional, default: 100) |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in milliseconds (optional, default: 60000) |
| `RATE_LIMIT_ADMIN_MAX_REQUESTS` | `50` | Max requests for admin endpoints (optional, default: 50) |

**Note:** 
- Make sure to add these for **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable
- After adding variables, you may need to redeploy

### Step 4: Run Database Migrations

After your first deployment, you need to run database migrations:

**Using Vercel CLI:**
```bash
vercel --prod -- npm run prisma:migrate:deploy
```

**Or manually:**
1. Go to your project in Vercel dashboard
2. Click on a deployment
3. Open the "Functions" tab
4. You can run commands there, or use Vercel CLI

### Step 5: Verify Deployment

1. Check your deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the health endpoint:
   ```
   https://your-project.vercel.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. Test database health:
   ```
   https://your-project.vercel.app/health/db
   ```
   Should return: `{"status":"ok","database":"connected","timestamp":"..."}`

## 🔍 Troubleshooting

### If deployment fails:

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Check DATABASE_URL** format (should be a valid PostgreSQL connection string)
4. **Ensure NODE_ENV** is set to `production`

### If database connection fails:

1. **Verify DATABASE_URL** is correct
2. **Check if database is active** (Neon databases pause after inactivity)
3. **Use Neon's pooler connection string** for better serverless performance
4. **Check SSL settings** in connection string

### Common Issues:

- **Build timeout**: Increase build timeout in Vercel settings
- **Function timeout**: Already set to 30 seconds in `vercel.json`
- **Prisma errors**: Make sure `postinstall` script runs (it's in package.json)

## 📝 Environment Variables Reference

### Example `.env` file (for local reference):

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NODE_ENV=production

# Recommended
ADMIN_API_KEY=your-very-secret-api-key-here-min-32-chars
CORS_ORIGIN=https://your-frontend.vercel.app

# Optional (with defaults)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_ADMIN_MAX_REQUESTS=50
UPLOAD_MAX_SIZE=5242880
```

## ✅ Post-Deployment Checklist

- [ ] Environment variables added in Vercel
- [ ] Database migrations run successfully
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Database health check returns `{"status":"ok","database":"connected"}`
- [ ] API endpoints are accessible
- [ ] CORS is configured correctly (if using frontend)

## 🎉 You're Done!

Your application should now be live on Vercel. The API will be available at:
- `https://your-project.vercel.app/api/v1/...`

For example:
- `https://your-project.vercel.app/api/v1/blogs`
- `https://your-project.vercel.app/health`
