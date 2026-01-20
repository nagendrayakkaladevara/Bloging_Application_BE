# Troubleshooting Vercel 500 Error

If you're still getting a 500 error after the fixes, follow these steps:

## Step 1: Check Vercel Logs (MOST IMPORTANT)

1. Go to your **Vercel Dashboard**
2. Select your project
3. Click on the **Logs** tab
4. Look for **red error messages** - these will tell you exactly what's wrong

Common errors you might see:
- `Module not found: Can't resolve '@prisma/client'` → Prisma client not generated
- `DATABASE_URL is required` → Environment variable missing
- `Process exited before completing request` → Uncaught exception
- `Connection timeout` → Database network access issue

## Step 2: Verify Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

**Required:**
- ✅ `DATABASE_URL` - Your PostgreSQL connection string
- ✅ `NODE_ENV` - Should be `production`

**Recommended:**
- `CORS_ORIGIN` - Your frontend URL
- `ADMIN_API_KEY` - For admin endpoints

**Important:** Make sure variable names match EXACTLY (case-sensitive)!

## Step 3: Check Database Connection

### For Neon Database:
1. Go to your Neon dashboard
2. Make sure your database is **not paused**
3. Use the **connection pooler** URL (recommended for serverless)
4. The URL should look like: `postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require`

### For Other PostgreSQL Databases:
- Make sure your database allows connections from anywhere (0.0.0.0/0)
- Check firewall settings
- Verify the connection string format

## Step 4: Verify Build Process

Check your **Vercel build logs** to ensure:
1. ✅ `npm install` completes successfully
2. ✅ `prisma generate` runs (check for "Generated Prisma Client" message)
3. ✅ TypeScript compilation succeeds
4. ✅ No missing dependencies

## Step 5: Test Locally with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Test locally
vercel dev
```

This will simulate the Vercel environment locally and show you the exact error.

## Step 6: Common Issues and Fixes

### Issue: Prisma Client Not Found
**Fix:** Make sure `postinstall` script is in package.json:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Issue: Database Connection Timeout
**Fix:** 
- Use connection pooler URL (for Neon)
- Add `?sslmode=require&connect_timeout=10` to your DATABASE_URL
- Check database is not paused

### Issue: Module Not Found
**Fix:**
- Run `npm install` locally and commit `package-lock.json`
- Check that all dependencies are in `dependencies`, not `devDependencies`

### Issue: Function Timeout
**Fix:** Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 60
    }
  }
}
```

## Step 7: Enable Debug Logging

Add this to the top of `api/index.ts` temporarily:

```typescript
console.log('[DEBUG] Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- VERCEL:', !!process.env.VERCEL);
```

Then check the logs to see what's being logged.

## Step 8: Test Health Endpoints

After deployment, test these URLs:
1. `https://your-app.vercel.app/health` - Should return `{"status":"ok"}`
2. `https://your-app.vercel.app/health/db` - Should return database status

If `/health` works but `/health/db` fails, it's a database connection issue.

## Still Not Working?

1. **Share the exact error from Vercel logs** (not just the 500 page)
2. **Check if it works locally** with `vercel dev`
3. **Verify all environment variables** are set correctly
4. **Check database is accessible** from outside your network
