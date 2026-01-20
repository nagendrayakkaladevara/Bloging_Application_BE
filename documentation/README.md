# API Documentation

This folder contains all API documentation for the Blog Platform backend.

## 📚 Documentation Files

### [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
**Complete API Reference** - Comprehensive documentation with:
- All endpoints (request/response examples)
- Authentication & authorization
- Error handling
- Field validations
- TypeScript integration examples

### [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
**Quick Reference Guide** - Fast lookup for:
- Endpoint summary table
- Common query parameters
- Response formats
- Status codes
- Rate limits

### [Blog_API.postman_collection.json](./Blog_API.postman_collection.json)
**Postman Collection** - Ready-to-use API collection with:
- All endpoints pre-configured
- Environment variables setup
- **6 dummy blog posts** for testing
- Request examples with proper headers

### [Postman_Setup.md](./Postman_Setup.md)
**Postman Setup Guide** - Instructions for:
- Importing the collection
- Setting up variables
- Creating dummy data
- Testing endpoints

## 🚀 Quick Start

**Base URL:**
- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

**Authentication:**
Admin endpoints require `X-API-Key` header.

## 📋 Endpoints Overview

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Blogs** | 5 endpoints | Admin for write operations |
| **Voting** | 2 endpoints | None |
| **Comments** | 4 endpoints | Admin for moderation |
| **Search** | 1 endpoint | None |
| **Tags** | 2 endpoints | None |
| **Calendar** | 4 endpoints | Admin for write operations |

## 🔑 Key Features

- ✅ RESTful API design
- ✅ Pagination support
- ✅ Full-text search
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling with codes
- ✅ CORS enabled

## 📖 Getting Started

1. **Quick Start:** Read [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for overview
2. **Detailed Docs:** Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for implementation
3. **Postman Testing:** Import [Blog_API.postman_collection.json](./Blog_API.postman_collection.json) and follow [Postman_Setup.md](./Postman_Setup.md)
4. **Dummy Data:** Use the "Dummy Data - Create Blogs" folder in Postman to populate your database

## 🆘 Support

For questions or issues, contact the backend team.

---

**Last Updated:** 2024
