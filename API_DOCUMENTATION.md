# Blog Platform API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:3000/api/v1` (Development)  
**Production URL:** `https://api.yourdomain.com/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Response Format](#response-format)
3. [Error Handling](#error-handling)
4. [Blog Endpoints](#blog-endpoints)
5. [Voting Endpoints](#voting-endpoints)
6. [Comments Endpoints](#comments-endpoints)
7. [Search Endpoints](#search-endpoints)
8. [Tags Endpoints](#tags-endpoints)
9. [Calendar Events Endpoints](#calendar-events-endpoints)

---

## Authentication

### Admin Endpoints

Admin endpoints require an API key in the request header:

```
X-API-Key: your-admin-api-key
```

**Admin Endpoints:**
- `POST /api/v1/blogs` - Create blog
- `PUT /api/v1/blogs/:slug` - Update blog
- `DELETE /api/v1/blogs/:slug` - Delete blog
- `DELETE /api/v1/blogs/:slug/comments/:commentId` - Delete comment
- `PUT /api/v1/blogs/:slug/comments/:commentId/status` - Update comment status
- `POST /api/v1/calendar/events` - Create calendar event
- `PUT /api/v1/calendar/events/:id` - Update calendar event
- `DELETE /api/v1/calendar/events/:id` - Delete calendar event

### Public Endpoints

All other endpoints are public and do not require authentication.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (Invalid API key)
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity (Validation error)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## Error Handling

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Invalid or missing API key (admin endpoints only) |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (e.g., duplicate slug) |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "fields": {
        "title": ["Title is required"],
        "email": ["Invalid email format"]
      }
    }
  }
}
```

---

## Blog Endpoints

### Get All Blogs

Get a paginated list of published blogs.

**Endpoint:** `GET /api/v1/blogs`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 50) |
| `sort` | string | No | newest | Sort order: `newest`, `oldest`, `popular` |
| `tags` | string | No | - | Comma-separated tag slugs (e.g., `react,typescript`) |
| `author` | string | No | - | Filter by author name |
| `search` | string | No | - | Search query (searches title, description, tags) |

**Example Request:**
```bash
GET /api/v1/blogs?page=1&limit=10&sort=newest&tags=react,typescript&search=getting started
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "slug": "getting-started-with-react-and-typescript",
        "meta": {
          "title": "Getting Started with React and TypeScript",
          "description": "A comprehensive guide to building React apps with TypeScript",
          "author": "John Doe",
          "publishedAt": "2024-01-15T10:00:00.000Z",
          "readTime": 8,
          "coverImage": "https://images.unsplash.com/photo-..."
        },
        "tags": ["React", "TypeScript", "Frontend"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

### Get Blog by Slug

Get a single blog with full content including blocks, tags, links, voting stats, and comments count.

**Endpoint:** `GET /api/v1/blogs/:slug`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug (URL-friendly identifier) |

**Example Request:**
```bash
GET /api/v1/blogs/getting-started-with-react-and-typescript
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "blog": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "getting-started-with-react-and-typescript",
      "meta": {
        "title": "Getting Started with React and TypeScript",
        "description": "A comprehensive guide...",
        "author": "John Doe",
        "publishedAt": "2024-01-15T10:00:00.000Z",
        "readTime": 8,
        "coverImage": "https://images.unsplash.com/..."
      },
      "layout": {
        "type": "two-column",
        "maxWidth": "1200px",
        "showTableOfContents": true
      },
      "settings": {
        "enableVoting": true,
        "enableSocialShare": true,
        "enableComments": true
      },
      "commentsCount": 15,
      "tags": ["React", "TypeScript", "Frontend", "Tutorial"],
      "links": [
        {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "label": "Official React Docs",
          "url": "https://react.dev",
          "type": "external"
        }
      ],
      "blocks": [
        {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "type": "heading",
          "content": {
            "level": 2,
            "text": "Introduction"
          }
        },
        {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "type": "paragraph",
          "content": {
            "text": "React is a powerful JavaScript library..."
          }
        },
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "type": "code",
          "content": {
            "code": "npm create vite@latest my-app -- --template react-ts",
            "language": "bash",
            "filename": null
          }
        }
      ],
      "voting": {
        "enabled": true,
        "upvotes": 42,
        "downvotes": 2,
        "userVote": "upvote"
      },
      "socialShare": {
        "enabled": true,
        "platforms": ["twitter", "facebook", "linkedin", "copy"]
      }
    }
  }
}
```

**Note:** `userVote` is determined by the IP address and/or session ID. Can be `"upvote"`, `"downvote"`, or `null`.

---

### Create Blog (Admin Only)

Create a new blog post.

**Endpoint:** `POST /api/v1/blogs`

**Headers:**
```
X-API-Key: your-admin-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Blog Post",
  "description": "Blog description",
  "slug": "new-blog-post",
  "author": "John Doe",
  "coverImage": "https://images.unsplash.com/...",
  "layout": {
    "type": "single-column",
    "maxWidth": "800px",
    "showTableOfContents": false
  },
  "settings": {
    "enableVoting": true,
    "enableSocialShare": true,
    "enableComments": true
  },
  "tags": ["React", "TypeScript"],
  "links": [
    {
      "label": "External Link",
      "url": "https://example.com",
      "type": "external"
    }
  ],
  "blocks": [
    {
      "type": "heading",
      "content": {
        "level": 2,
        "text": "Introduction"
      }
    },
    {
      "type": "paragraph",
      "content": {
        "text": "Content here..."
      }
    }
  ],
  "status": "published"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Blog title (1-500 characters) |
| `description` | string | No | Blog description (max 2000 characters) |
| `slug` | string | No | URL-friendly identifier (auto-generated from title if not provided) |
| `author` | string | No | Author name (max 255 characters) |
| `coverImage` | string | No | Cover image URL |
| `layout.type` | string | No | Layout type: `single-column` or `two-column` (default: `single-column`) |
| `layout.maxWidth` | string | No | Maximum width (default: `800px`) |
| `layout.showTableOfContents` | boolean | No | Show table of contents (default: `false`) |
| `settings.enableVoting` | boolean | No | Enable voting (default: `true`) |
| `settings.enableSocialShare` | boolean | No | Enable social sharing (default: `true`) |
| `settings.enableComments` | boolean | No | Enable comments (default: `true`) |
| `tags` | array | No | Array of tag names (will be created if they don't exist) |
| `links` | array | No | Array of link objects |
| `blocks` | array | No | Array of content block objects |
| `status` | string | No | Status: `published` or `archived` (default: `published`) |

**Block Types:**

1. **Heading Block:**
```json
{
  "type": "heading",
  "content": {
    "level": 1,
    "text": "Heading Text"
  }
}
```

2. **Paragraph Block:**
```json
{
  "type": "paragraph",
  "content": {
    "text": "Paragraph text here..."
  }
}
```

3. **Code Block:**
```json
{
  "type": "code",
  "content": {
    "code": "const example = 'code here';",
    "language": "javascript",
    "filename": "example.js"
  }
}
```

4. **Image Block:**
```json
{
  "type": "image",
  "content": {
    "src": "https://images.unsplash.com/...",
    "alt": "Image description",
    "caption": "Optional caption"
  }
}
```

5. **Callout Block:**
```json
{
  "type": "callout",
  "content": {
    "variant": "info",
    "title": "Pro Tip",
    "content": "This is a callout message"
  }
}
```
Variants: `info`, `warning`, `error`, `success`

6. **List Block:**
```json
{
  "type": "list",
  "content": {
    "style": "unordered",
    "items": ["Item 1", "Item 2", "Item 3"]
  }
}
```
Styles: `ordered`, `unordered`

7. **Quote Block:**
```json
{
  "type": "quote",
  "content": {
    "text": "The quote text here",
    "author": "Author Name"
  }
}
```

8. **Divider Block:**
```json
{
  "type": "divider",
  "content": {}
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "blog": {
      // Full blog object (same as GET /blogs/:slug)
    }
  },
  "message": "Blog created successfully"
}
```

---

### Update Blog (Admin Only)

Update an existing blog.

**Endpoint:** `PUT /api/v1/blogs/:slug`

**Headers:**
```
X-API-Key: your-admin-api-key
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Request Body:** Same as POST, but all fields are optional.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "blog": {
      // Updated blog object
    }
  },
  "message": "Blog updated successfully"
}
```

---

### Delete Blog (Admin Only)

Delete a blog and all its related data (blocks, tags, links, votes, comments).

**Endpoint:** `DELETE /api/v1/blogs/:slug`

**Headers:**
```
X-API-Key: your-admin-api-key
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Response (200):**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

---

## Voting Endpoints

### Vote on Blog

Vote (upvote or downvote) on a blog. Anonymous voting based on IP address and/or session ID.

**Endpoint:** `POST /api/v1/blogs/:slug/vote`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Request Body:**
```json
{
  "voteType": "upvote"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `voteType` | string | Yes | Vote type: `upvote` or `downvote` |

**Optional Headers:**
```
X-Session-Id: your-session-id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "voting": {
      "enabled": true,
      "upvotes": 43,
      "downvotes": 2,
      "userVote": "upvote"
    }
  },
  "message": "Vote recorded successfully"
}
```

**Note:** Users can change their vote by submitting a new vote. The vote is tracked by IP address and/or session ID.

---

### Remove Vote

Remove your vote from a blog.

**Endpoint:** `DELETE /api/v1/blogs/:slug/vote`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Optional Headers:**
```
X-Session-Id: your-session-id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "voting": {
      "enabled": true,
      "upvotes": 42,
      "downvotes": 2,
      "userVote": null
    }
  },
  "message": "Vote removed successfully"
}
```

---

## Comments Endpoints

### Get Comments

Get comments for a blog (only approved comments are returned).

**Endpoint:** `GET /api/v1/blogs/:slug/comments`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `sort` | string | No | newest | Sort order: `newest` or `oldest` |

**Example Request:**
```bash
GET /api/v1/blogs/getting-started-with-react/comments?page=1&limit=20&sort=newest
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "comment": "Great article! Very helpful.",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### Create Comment

Add a comment to a blog. No authentication required.

**Endpoint:** `POST /api/v1/blogs/:slug/comments`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |

**Request Body:**
```json
{
  "name": "John Doe",
  "comment": "Great article! Very helpful."
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Commenter name (1-255 characters) |
| `comment` | string | Yes | Comment text (1-5000 characters) |

**Rate Limiting:** Maximum 5 comments per IP per hour.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "comment": "Great article! Very helpful.",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "message": "Comment posted successfully"
}
```

---

### Delete Comment (Admin Only)

Delete a comment.

**Endpoint:** `DELETE /api/v1/blogs/:slug/comments/:commentId`

**Headers:**
```
X-API-Key: your-admin-api-key
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |
| `commentId` | string | Yes | Comment ID (UUID) |

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

### Update Comment Status (Admin Only)

Update comment status for moderation.

**Endpoint:** `PUT /api/v1/blogs/:slug/comments/:commentId/status`

**Headers:**
```
X-API-Key: your-admin-api-key
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog slug |
| `commentId` | string | Yes | Comment ID (UUID) |

**Request Body:**
```json
{
  "status": "approved"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | Status: `approved`, `pending`, `spam`, or `deleted` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "comment": "Great article!",
      "status": "approved",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  },
  "message": "Comment status updated successfully"
}
```

---

## Search Endpoints

### Search Blogs

Search blogs by query string.

**Endpoint:** `GET /api/v1/search`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (1-200 characters) |
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 50) |
| `tags` | string | No | - | Comma-separated tag slugs to filter by |

**Example Request:**
```bash
GET /api/v1/search?q=react typescript&page=1&limit=10&tags=react
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "slug": "getting-started-with-react-and-typescript",
        "meta": {
          "title": "Getting Started with React and TypeScript",
          "description": "A comprehensive guide...",
          "author": "John Doe",
          "publishedAt": "2024-01-15T10:00:00.000Z",
          "readTime": 8,
          "coverImage": "https://images.unsplash.com/..."
        },
        "tags": ["React", "TypeScript"],
        "relevanceScore": 0.95
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "query": "react typescript",
    "totalResults": 25
  }
}
```

**Note:** Search is performed across blog titles, descriptions, and tags. Results are sorted by relevance score (0-1).

---

## Tags Endpoints

### Get All Tags

Get all tags with optional filtering.

**Endpoint:** `GET /api/v1/tags`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `popular` | boolean | No | false | Return only popular tags (tags with at least one published blog) |
| `limit` | number | No | - | Limit number of results |

**Example Request:**
```bash
GET /api/v1/tags?popular=true&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "name": "React",
        "slug": "react",
        "description": "React framework",
        "blogCount": 15
      }
    ]
  }
}
```

---

### Get Blogs by Tag

Get all blogs with a specific tag.

**Endpoint:** `GET /api/v1/tags/:slug`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Tag slug |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 50) |

**Example Request:**
```bash
GET /api/v1/tags/react?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tag": {
      "id": "bb0e8400-e29b-41d4-a716-446655440000",
      "name": "React",
      "slug": "react",
      "description": "React framework"
    },
    "blogs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "slug": "getting-started-with-react",
        "meta": {
          "title": "Getting Started with React",
          "description": "...",
          "author": "John Doe",
          "publishedAt": "2024-01-15T10:00:00.000Z",
          "readTime": 8,
          "coverImage": "https://images.unsplash.com/..."
        },
        "tags": ["React", "Frontend"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

## Calendar Events Endpoints

### Get Calendar Events

Get calendar events within a date range.

**Endpoint:** `GET /api/v1/calendar/events`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string | No | Current month start | Start date (ISO format: YYYY-MM-DD) |
| `endDate` | string | No | Current month end | End date (ISO format: YYYY-MM-DD) |
| `blogId` | string | No | - | Filter by blog ID (UUID) |

**Example Request:**
```bash
GET /api/v1/calendar/events?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "cc0e8400-e29b-41d4-a716-446655440000",
        "title": "Getting Started with React",
        "description": "New blog post published",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:00",
        "color": "blue",
        "blogId": "550e8400-e29b-41d4-a716-446655440000",
        "blog": {
          "slug": "getting-started-with-react",
          "title": "Getting Started with React"
        }
      }
    ]
  }
}
```

**Color Options:** `blue`, `green`, `purple`, `orange`

---

### Create Calendar Event (Admin Only)

Create a new calendar event.

**Endpoint:** `POST /api/v1/calendar/events`

**Headers:**
```
X-API-Key: your-admin-api-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Blog Review Meeting",
  "description": "Review upcoming blog posts",
  "date": "2024-01-18",
  "startTime": "14:00",
  "endTime": "15:30",
  "color": "green",
  "blogId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Event title (1-255 characters) |
| `description` | string | No | Event description |
| `date` | string | Yes | Event date (ISO format: YYYY-MM-DD) |
| `startTime` | string | No | Start time (HH:mm format) |
| `endTime` | string | No | End time (HH:mm format, must be after startTime) |
| `color` | string | No | Event color: `blue`, `green`, `purple`, `orange` (default: `blue`) |
| `blogId` | string | No | Associated blog ID (UUID) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "cc0e8400-e29b-41d4-a716-446655440000",
      "title": "Blog Review Meeting",
      "description": "Review upcoming blog posts",
      "date": "2024-01-18",
      "startTime": "14:00",
      "endTime": "15:30",
      "color": "green",
      "blogId": "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  "message": "Event created successfully"
}
```

---

### Update Calendar Event (Admin Only)

Update an existing calendar event.

**Endpoint:** `PUT /api/v1/calendar/events/:id`

**Headers:**
```
X-API-Key: your-admin-api-key
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event ID (UUID) |

**Request Body:** Same as POST, but all fields are optional.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      // Updated event object
    }
  },
  "message": "Event updated successfully"
}
```

---

### Delete Calendar Event (Admin Only)

Delete a calendar event.

**Endpoint:** `DELETE /api/v1/calendar/events/:id`

**Headers:**
```
X-API-Key: your-admin-api-key
```

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Event ID (UUID) |

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Rate Limiting

### Public Endpoints
- **Limit:** 100 requests per minute per IP
- **Headers:** 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1640000000`

### Admin Endpoints
- **Limit:** 50 requests per minute per API key
- **Headers:** Same as above

### Comments
- **Limit:** 5 comments per hour per IP
- **Headers:** Same as above

### Rate Limit Exceeded Response (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP, please try again later."
  }
}
```

---

## CORS

The API supports CORS for the configured frontend origin. Make sure to set the `CORS_ORIGIN` environment variable on the backend.

---

## Pagination

All list endpoints support pagination with the following structure:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Pagination Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Items per page (default: 10, max: 50-100 depending on endpoint)

---

## Date Formats

All dates are returned in ISO 8601 format:
- **Date:** `"2024-01-15"`
- **DateTime:** `"2024-01-15T10:00:00.000Z"`
- **Time:** `"14:00"` (HH:mm format)

---

## Example Frontend Integration

### TypeScript Example

```typescript
// API Client
const API_BASE_URL = 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Get all blogs
async function getBlogs(params?: {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular';
  tags?: string[];
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.tags) queryParams.append('tags', params.tags.join(','));
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/blogs?${queryParams}`);
  const data: ApiResponse<{
    blogs: Blog[];
    pagination: PaginationMeta;
  }> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to fetch blogs');
  }

  return data.data;
}

// Vote on blog
async function voteOnBlog(slug: string, voteType: 'upvote' | 'downvote', sessionId?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (sessionId) {
    headers['X-Session-Id'] = sessionId;
  }

  const response = await fetch(`${API_BASE_URL}/blogs/${slug}/vote`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ voteType }),
  });

  const data: ApiResponse<{ voting: VotingStats }> = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'Failed to vote');
  }

  return data.data;
}
```

---

## Support

For questions or issues, please contact the backend team.

**Last Updated:** 2024
