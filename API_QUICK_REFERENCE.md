# API Quick Reference Guide

Quick reference for frontend developers.

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.yourdomain.com/api/v1
```

## Authentication
Admin endpoints require header:
```
X-API-Key: your-admin-api-key
```

---

## Endpoints Summary

### Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blogs` | No | Get all blogs (paginated) |
| GET | `/blogs/:slug` | No | Get blog by slug |
| POST | `/blogs` | Yes | Create blog |
| PUT | `/blogs/:slug` | Yes | Update blog |
| DELETE | `/blogs/:slug` | Yes | Delete blog |

### Voting
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/blogs/:slug/vote` | No | Vote on blog |
| DELETE | `/blogs/:slug/vote` | No | Remove vote |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blogs/:slug/comments` | No | Get comments |
| POST | `/blogs/:slug/comments` | No | Create comment |
| DELETE | `/blogs/:slug/comments/:commentId` | Yes | Delete comment |
| PUT | `/blogs/:slug/comments/:commentId/status` | Yes | Update comment status |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=query` | No | Search blogs |

### Tags
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tags` | No | Get all tags |
| GET | `/tags/:slug` | No | Get blogs by tag |

### Calendar
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/calendar/events` | No | Get events |
| POST | `/calendar/events` | Yes | Create event |
| PUT | `/calendar/events/:id` | Yes | Update event |
| DELETE | `/calendar/events/:id` | Yes | Delete event |

---

## Common Query Parameters

### Pagination
```
?page=1&limit=10
```

### Sorting
```
?sort=newest    // newest, oldest, popular
```

### Filtering
```
?tags=react,typescript
?author=John Doe
?search=query
```

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Server Error

---

## Rate Limits
- Public: 100 requests/minute
- Admin: 50 requests/minute
- Comments: 5/hour

---

## Block Types

### Heading
```json
{ "type": "heading", "content": { "level": 1, "text": "Text" } }
```

### Paragraph
```json
{ "type": "paragraph", "content": { "text": "Text" } }
```

### Code
```json
{ "type": "code", "content": { "code": "...", "language": "js", "filename": null } }
```

### Image
```json
{ "type": "image", "content": { "src": "url", "alt": "alt", "caption": null } }
```

### Callout
```json
{ "type": "callout", "content": { "variant": "info", "title": "Title", "content": "Text" } }
```

### List
```json
{ "type": "list", "content": { "style": "unordered", "items": ["item1", "item2"] } }
```

### Quote
```json
{ "type": "quote", "content": { "text": "Quote", "author": "Author" } }
```

### Divider
```json
{ "type": "divider", "content": {} }
```

---

## Date Formats
- Date: `"2024-01-15"`
- DateTime: `"2024-01-15T10:00:00.000Z"`
- Time: `"14:00"`

---

For detailed documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
