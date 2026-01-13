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

1. Read [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for quick overview
2. Refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed implementation
3. Check TypeScript examples in the full documentation

## 🆘 Support

For questions or issues, contact the backend team.

---

**Last Updated:** 2024
