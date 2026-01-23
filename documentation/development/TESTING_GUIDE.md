# Testing Guide - API Fix Verification

This guide will help you test the fixes made to resolve the continuous loading issue.

## 🚀 Step 1: Start the Server

### Development Mode (Recommended for Testing)
```bash
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
API Base URL: http://localhost:3000/api/v1
Database connected successfully
```

**If you see any errors, check:**
- Database connection (verify `DATABASE_URL` in `.env`)
- Port availability (default is 3000)

---

## ✅ Step 2: Test Health Endpoints (Quick Verification)

These endpoints should respond **immediately** without hanging.

### Test 1: Basic Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response (should return instantly):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### Test 2: Database Health Check
```bash
curl http://localhost:3000/health/db
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**If this fails**, check your database connection in `.env`.

---

## 📝 Step 3: Test API Endpoints

### Test 3: Get All Blogs (Public Endpoint)
```bash
curl http://localhost:3000/api/v1/blogs
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "blogs": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

**This should complete in < 1 second**, not hang indefinitely.

### Test 4: Get Blogs with Query Parameters
```bash
curl "http://localhost:3000/api/v1/blogs?page=1&limit=5&sort=newest"
```

**Expected:** Should return immediately with pagination data.

### Test 5: Get All Tags
```bash
curl http://localhost:3000/api/v1/tags
```

**Expected:** Should return tags array immediately.

### Test 6: Search (Requires Query Parameter)
```bash
curl "http://localhost:3000/api/v1/search?q=test"
```

**Expected:** Should return search results or empty array, **not hang**.

---

## 🔐 Step 4: Test Admin Endpoints (Requires API Key)

First, get your admin API key from `.env` file (the `ADMIN_API_KEY` value).

### Test 7: Create a Blog (Admin)
```bash
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_API_KEY_HERE" \
  -d '{
    "title": "Test Blog Post",
    "description": "Testing the API fixes",
    "blocks": [
      {
        "type": "heading",
        "content": {
          "level": 1,
          "text": "Test Heading"
        }
      },
      {
        "type": "paragraph",
        "content": {
          "text": "This is a test paragraph to verify the API is working correctly."
        }
      }
    ],
    "tags": ["test"],
    "status": "published"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "blog": {
      "id": "...",
      "slug": "test-blog-post",
      "title": "Test Blog Post",
      ...
    }
  },
  "message": "Blog created successfully"
}
```

**This should complete in 1-2 seconds**, not hang.

### Test 8: Get Blog by Slug
```bash
curl http://localhost:3000/api/v1/blogs/test-blog-post
```

**Expected:** Should return the blog details immediately.

---

## 🧪 Step 5: Test Error Handling

### Test 9: Invalid Endpoint (Should Return 404)
```bash
curl http://localhost:3000/api/v1/invalid-endpoint
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route GET /api/v1/invalid-endpoint not found"
  }
}
```

**Should return immediately**, not hang.

### Test 10: Validation Error (Should Return 422)
```bash
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_API_KEY_HERE" \
  -d '{
    "title": ""
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"]
      }
    }
  }
}
```

**Should return immediately**, not hang.

### Test 11: Missing API Key (Should Return 401)
```bash
curl -X POST http://localhost:3000/api/v1/blogs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key is required for this operation"
  }
}
```

**Should return immediately**, not hang.

---

## 📮 Step 6: Test with Postman

1. **Import the Postman Collection:**
   - Open Postman
   - Click **Import**
   - Select `documentation/api/Blog_API.postman_collection.json`

2. **Set Environment Variables:**
   - Edit the collection
   - Go to **Variables** tab
   - Set `admin_api_key` to your actual API key from `.env`
   - Set `base_url` to `http://localhost:3000/api/v1`

3. **Test Requests:**
   - Start with **Health Check** requests
   - Then test **GET /blogs**
   - Try creating a blog with **POST /blogs**
   - Test search, tags, etc.

4. **Watch for:**
   - ✅ Requests complete in < 2 seconds
   - ✅ No "pending" status that never resolves
   - ✅ Proper error responses (not hanging)

---

## 🔍 What to Look For (Success Indicators)

### ✅ **Good Signs:**
- Requests complete in 1-3 seconds
- You see responses in Postman/curl immediately
- Server logs show request completion
- No "ECONNRESET" or timeout errors
- Error responses are returned quickly (not hanging)

### ❌ **Bad Signs (If Still Happening):**
- Requests show "pending" or "loading" indefinitely
- curl hangs without response
- Postman shows "Sending..." forever
- Server logs show request received but no completion
- Browser shows "pending" in Network tab

---

## 🐛 Troubleshooting

### If Requests Still Hang:

1. **Check Server Logs:**
   - Look for error messages in the terminal
   - Check for database connection errors
   - Verify middleware is executing

2. **Test Database Connection:**
   ```bash
   curl http://localhost:3000/health/db
   ```
   - If this fails, check your `DATABASE_URL` in `.env`

3. **Check Port:**
   - Verify nothing else is using port 3000
   - Try changing `PORT` in `.env` to another port (e.g., 3001)

4. **Verify Environment Variables:**
   - Make sure `.env` file exists
   - Check that `DATABASE_URL` is set correctly
   - Verify `ADMIN_API_KEY` is set (for admin endpoints)

5. **Restart the Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

---

## 📊 Quick Test Checklist

Run through these quickly to verify everything works:

- [ ] Server starts without errors
- [ ] `/health` returns immediately
- [ ] `/health/db` returns immediately
- [ ] `GET /api/v1/blogs` returns immediately
- [ ] `GET /api/v1/tags` returns immediately
- [ ] `GET /api/v1/search?q=test` returns immediately
- [ ] Invalid endpoint returns 404 immediately
- [ ] Validation error returns 422 immediately
- [ ] Missing API key returns 401 immediately
- [ ] Admin endpoint with valid API key works

---

## 🎯 Expected Behavior After Fixes

All API calls should now:
1. ✅ **Respond within 1-3 seconds** (depending on database query complexity)
2. ✅ **Return proper JSON responses** (success or error)
3. ✅ **Not hang indefinitely**
4. ✅ **Show proper error messages** when validation fails
5. ✅ **Complete requests** even when errors occur

---

## 💡 Additional Testing Tips

### Test with Browser DevTools:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request to `http://localhost:3000/api/v1/blogs`
4. Check the request status - should show "200" or error code, not "pending"

### Test with Frontend:
If you have a frontend connected:
1. Make sure CORS is configured correctly (`CORS_ORIGIN` in `.env`)
2. Test API calls from your frontend
3. Check browser console for errors
4. Verify requests complete in Network tab

---

## 📞 Need Help?

If requests are still hanging after these fixes:
1. Check the server terminal for error messages
2. Verify database connection is working
3. Test with simple curl commands first
4. Check that all environment variables are set correctly

The main fixes applied were:
- ✅ Fixed missing `prisma` import in server.ts
- ✅ Fixed error handling in auth middleware (using `next()` instead of throwing)
- ✅ Fixed error handling in validation middleware (proper async error catching)
- ✅ Fixed validate middleware to work as standalone middleware

These changes ensure that errors are properly caught and passed to Express's error handler, preventing requests from hanging indefinitely.
