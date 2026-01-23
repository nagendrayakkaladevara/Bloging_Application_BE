# Postman Collection Setup Guide

## 📥 Importing the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Blog_API.postman_collection.json`
5. Click **Import**

## 🔧 Setting Up Environment Variables

After importing, set up these variables in Postman:

### Collection Variables (Edit Collection → Variables)

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `http://localhost:3000/api/v1` | Update if needed |
| `admin_api_key` | `your-admin-api-key-here` | **Set your actual API key** |
| `session_id` | `` | Optional, for session tracking |

### How to Update Variables

1. Click on the collection name
2. Go to **Variables** tab
3. Update the **Current Value** column
4. Variables are automatically used in all requests

## 🚀 Using the Collection

### Main API Endpoints

The collection is organized into folders:
- **Blogs** - All blog CRUD operations
- **Voting** - Vote on blogs
- **Comments** - Comment management
- **Search** - Search functionality
- **Tags** - Tag operations
- **Calendar Events** - Event management

### Dummy Data Collection

**Location:** `Dummy Data - Create Blogs` folder

This folder contains **6 pre-configured blog posts** ready to create:

1. **Getting Started with React** - React tutorial
2. **TypeScript Best Practices** - TypeScript guide
3. **Building RESTful APIs with Node.js** - Backend tutorial
4. **CSS Grid vs Flexbox** - CSS layout comparison
5. **Introduction to GraphQL** - GraphQL overview
6. **Docker for Developers** - Docker guide

## 📝 Creating Dummy Data

### Quick Setup

1. **Set your API key:**
   - Edit collection variables
   - Set `admin_api_key` to your actual admin API key from `.env`

2. **Run the dummy data requests:**
   - Open `Dummy Data - Create Blogs` folder
   - Run requests 1-6 in sequence (or use Postman's "Run Collection" feature)

3. **Verify:**
   - Use `GET /blogs` to see all created blogs
   - Each blog has different content, tags, and block types

### Using Postman Runner

1. Click on `Dummy Data - Create Blogs` folder
2. Click **Run** button
3. Select all 6 requests
4. Click **Run Dummy Data - Create Blogs**
5. All blogs will be created automatically

## 🎯 Tips

- **Save Responses:** Right-click on request → Save Response → Save as Example
- **Test Scripts:** Add test scripts to verify responses
- **Environment Switching:** Create different environments for dev/staging/prod
- **Pre-request Scripts:** Automate token generation if needed

## 📋 Request Details

Each dummy blog includes:
- ✅ Complete metadata (title, description, author, cover image)
- ✅ Multiple content blocks (headings, paragraphs, code, callouts, etc.)
- ✅ Tags for categorization
- ✅ External links
- ✅ Different layout configurations
- ✅ Published status

## 🔍 Testing After Creation

After creating dummy data, test these endpoints:

1. `GET /blogs` - Should return 6 blogs
2. `GET /blogs/:slug` - Get individual blog details
3. `GET /tags` - See all created tags
4. `GET /search?q=react` - Test search functionality

## ⚠️ Important Notes

- Make sure your backend server is running
- Verify your `admin_api_key` is correct
- Each blog has a unique slug (auto-generated from title)
- All blogs are set to `published` status
- You can delete blogs using `DELETE /blogs/:slug` if needed

---

**Need Help?** Check the main [API Documentation](./API_DOCUMENTATION.md) for detailed endpoint information.
