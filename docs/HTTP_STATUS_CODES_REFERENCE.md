# HTTP Status Codes Reference - News Portal API

This document outlines all HTTP status codes used in the News Portal API and their meanings for developer documentation.

---

## Summary Table

| Status Code | Category | Usage in Project | Total Occurrences |
|-------------|----------|------------------|------------------|
| 200 | Success | GET requests, successful responses | ~40+ |
| 201 | Created | POST requests that create resources | ~10+ |
| 400 | Bad Request | Invalid input, missing fields, validation errors | ~25+ |
| 401 | Unauthorized | Missing or invalid authentication token | ~25+ |
| 403 | Forbidden | User lacks required permissions/role | ~15+ |
| 404 | Not Found | Resource doesn't exist | ~20+ |
| 415 | Unsupported Media Type | Invalid content-type header | 1 |
| 500 | Internal Server Error | Server-side errors, exceptions | ~35+ |

---

## Detailed HTTP Status Codes Used

### ✅ 2XX SUCCESS RESPONSES

#### 200 OK
**Meaning:** Request succeeded and server returned the expected data.

**Used in these routes:**
- `GET /api/news` - Fetch all news articles
- `GET /api/news/[id]` - Fetch specific news article
- `GET /api/comments` - Fetch comments
- `GET /api/comments/[id]` - Fetch specific comment
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get specific user
- `GET /api/admin/categories` - List categories
- `GET /api/customer/profile` - Get user profile
- `GET /api/pages/[slug]` - Get page content
- `GET /api/site-settings` - Get site settings
- `PUT /api/news/[id]` - Update news article
- `PUT /api/admin/users/[id]` - Update user
- `POST /api/profile` - Update user profile
- `POST /api/site-settings` - Update site settings

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Article Title",
    "content": "Article content..."
  }
}
```

---

#### 201 CREATED
**Meaning:** Resource was successfully created. Should only be used for POST requests that create new resources.

**Used in these routes:**
- `POST /api/news` - Create new news article
- `POST /api/comments` - Post new comment
- `POST /api/contact` - Submit contact form
- `POST /api/admin/users` - Create new user
- `POST /api/admin/categories` - Create new category
- `POST /api/editor/articles` - Create article from editor

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Created successfully"
  }
}
```

---

### ❌ 4XX CLIENT ERROR RESPONSES

#### 400 BAD REQUEST
**Meaning:** Client sent invalid data or malformed request. Server cannot process it due to client error (not server error).

**Common reasons:**
- Missing required fields
- Invalid data format
- Invalid parameter values
- Validation failed

**Used in these routes:**
- `POST /api/news` - Missing required fields (title, content, etc.)
- `POST /api/comments` - Missing newsId or content
- `POST /api/contact` - Missing name, email, or message
- `GET /api/pages/[slug]` - Invalid slug parameter
- `GET /api/comments` - Missing newsId parameter
- `PUT /api/news/[id]` - Invalid data in request body
- `PUT /api/admin/users/[id]` - Invalid user data
- `POST /api/customer/profile` - Invalid profile data
- `POST /api/articles` - Missing required article fields

**Example Error Response:**
```json
{
  "success": false,
  "error": "All fields are required",
  "details": "Missing fields: name, email, message"
}
```

**When to use 400:**
- Empty required fields
- Wrong data type (e.g., string when number expected)
- Invalid format (e.g., invalid email)
- Out of range values
- Missing pagination parameters

---

#### 401 UNAUTHORIZED
**Meaning:** Authentication required but not provided, or authentication failed. Token is missing, expired, or invalid.

**Common reasons:**
- No JWT token provided
- JWT token is expired
- JWT token is invalid/tampered
- User not found in database

**Used in these routes:**
- `POST /api/news` - Not authenticated
- `DELETE /api/news/[id]` - Missing authentication
- `POST /api/comments` - Not authenticated
- `DELETE /api/comments/[id]` - Not authenticated
- `GET /api/admin/dashboard` - Missing auth token
- `GET /api/admin/users` - Not authenticated
- `POST /api/admin/users` - Not authenticated
- `PUT /api/admin/users/[id]` - Not authenticated
- `DELETE /api/admin/users/[id]` - Not authenticated
- `PUT /api/news/[id]` - Not authenticated
- `DELETE /api/comments/[id]` - Not authenticated
- `POST /api/customer/profile` - Not authenticated
- `POST /api/customer/change-image` - Not authenticated
- `GET /api/admin/categories` - Not authenticated
- `POST /api/admin/categories` - Not authenticated

**Example Error Response:**
```json
{
  "success": false,
  "error": "Authentication required",
  "details": "Missing or invalid JWT token"
}
```

**Common Authentication Errors:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "details": "Invalid token"
}
```

**When to use 401:**
- No `Authorization` header provided
- Invalid JWT format
- Token signature mismatch
- Token expired
- Invalid credentials in login attempt

---

#### 403 FORBIDDEN
**Meaning:** Request is authenticated but user lacks required permissions. Authorization failed.

**Common reasons:**
- User role doesn't have permission (e.g., user trying to access admin-only endpoint)
- User trying to delete another user's content
- Insufficient privileges for operation

**Used in these routes:**
- `POST /api/news` - Editor/user trying to create without permission
- `PUT /api/news/[id]` - User trying to edit article they don't own
- `DELETE /api/news/[id]` - User trying to delete article they don't own
- `POST /api/comments` - Only users can post comments, admin/editor cannot
- `DELETE /api/comments/[id]` - User trying to delete comment they didn't write
- `DELETE /api/admin/users/[id]` - User trying to delete admin account
- `GET /api/admin/dashboard` - User trying to access admin dashboard
- `GET /api/admin/users` - Non-admin trying to access user list
- `POST /api/admin/users` - Non-admin trying to create user
- `PUT /api/admin/users/[id]` - Non-admin trying to update user
- `DELETE /api/admin/users/[id]` - Non-admin trying to delete user
- `GET /api/admin/categories` - Non-admin trying to list categories
- `POST /api/admin/categories` - Non-admin trying to create category

**Example Error Response:**
```json
{
  "success": false,
  "error": "Forbidden",
  "details": "Only regular users can post comments"
}
```

**Role-based 403 Examples:**
```json
{
  "success": false,
  "error": "Admin access required",
  "details": "You do not have permission to perform this action"
}
```

```json
{
  "success": false,
  "error": "Insufficient permissions",
  "details": "Editor or Admin access required"
}
```

**When to use 403:**
- User role is not authorized (user trying to access admin endpoint)
- User trying to modify/delete someone else's content
- Subscription/tier limitations
- Account status issues (suspended, etc.)
- Missing required role permissions

---

#### 404 NOT FOUND
**Meaning:** Resource requested doesn't exist or cannot be found in the database.

**Common reasons:**
- Article ID doesn't exist
- User ID doesn't exist
- Comment ID doesn't exist
- Page slug doesn't exist

**Used in these routes:**
- `GET /api/news/[id]` - News article with ID not found
- `PUT /api/news/[id]` - Article to update not found
- `DELETE /api/news/[id]` - Article to delete not found
- `GET /api/comments/[id]` - Comment not found
- `DELETE /api/comments/[id]` - Comment to delete not found
- `GET /api/admin/users/[id]` - User not found
- `PUT /api/admin/users/[id]` - User to update not found
- `DELETE /api/admin/users/[id]` - User to delete not found
- `GET /api/pages/[slug]` - Page with slug not found
- `GET /api/profile` - User profile not found
- `GET /api/news/[id]/comments` - News article not found

**Example Error Response:**
```json
{
  "success": false,
  "error": "Not found",
  "details": "Article with ID 999 does not exist"
}
```

**When to use 404:**
- Resource ID/slug doesn't exist in database
- User has been deleted
- Resource was removed
- Invalid resource identifier

---

#### 415 UNSUPPORTED MEDIA TYPE
**Meaning:** Server rejects request because content-type is invalid or not supported.

**Used in these routes:**
- `POST /api/contact` - Content-Type is not `application/json`
- `POST /api/customer/change-image` - Invalid file type for image upload

**Example Error Response:**
```json
{
  "error": "Invalid content type",
  "details": "Expected application/json but received text/plain"
}
```

**When to use 415:**
- Content-Type header is missing
- Content-Type is not `application/json` when JSON expected
- Trying to upload image with wrong MIME type

---

### 🔴 5XX SERVER ERROR RESPONSES

#### 500 INTERNAL SERVER ERROR
**Meaning:** Server encountered an unexpected condition. Generic error response for server-side errors.

**Common reasons:**
- Database connection failed
- Unhandled exception
- File system error
- JWT verification failed
- Prisma operations failed

**Used in these routes (most endpoints):**
- `GET /api/news` - Database query failed
- `POST /api/news` - Failed to save article
- `DELETE /api/news/[id]` - Failed to delete article
- `GET /api/comments` - Failed to fetch comments
- `POST /api/comments` - Failed to save comment
- `POST /api/contact` - Failed to save contact message
- `GET /api/admin/dashboard` - Failed to fetch statistics
- `GET /api/admin/users` - Database query failed
- `POST /api/admin/users` - Failed to create user
- `PUT /api/admin/users/[id]` - Failed to update user
- `DELETE /api/admin/users/[id]` - Failed to delete user
- `GET /api/customer/profile` - Database query failed
- `POST /api/customer/profile` - Failed to update profile
- `GET /api/pages/[slug]` - Database query failed
- `GET /api/site-settings` - Database connection failed
- `POST /api/site-settings` - Failed to update settings

**Example Error Response:**
```json
{
  "success": false,
  "error": "Failed to fetch news",
  "details": "Database connection timeout"
}
```

**Database Error Example:**
```json
{
  "success": false,
  "error": "Failed to submit message",
  "details": "ENOENT: no such file or directory"
}
```

**JWT Verification Error Example:**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "JWT verification failed"
}
```

**When to use 500:**
- Try-catch block catches unexpected error
- Database connection lost
- File I/O error
- Invalid server configuration
- Out of memory
- Service dependencies unavailable

---

## Status Code Decision Tree

Use this flowchart to select the correct status code:

```
Is the request successful?
├─ YES
│  ├─ Was something CREATED? → 201 CREATED
│  └─ Just returning data? → 200 OK
│
└─ NO (Error occurred)
   ├─ Is it a CLIENT error?
   │  ├─ Missing/invalid data? → 400 BAD REQUEST
   │  ├─ Wrong content-type? → 415 UNSUPPORTED MEDIA TYPE
   │  ├─ Authentication missing/invalid? → 401 UNAUTHORIZED
   │  ├─ User lacks permissions? → 403 FORBIDDEN
   │  └─ Resource doesn't exist? → 404 NOT FOUND
   │
   └─ Is it a SERVER error?
      └─ → 500 INTERNAL SERVER ERROR
```

---

## Standard API Response Format

All endpoints should follow this structure:

### Success Response (2XX)
```typescript
{
  success: true,
  data: { /* endpoint-specific data */ },
  pagination?: { /* optional for list endpoints */ }
}
```

### Error Response (4XX/5XX)
```typescript
{
  success: false,
  error: "Error message", // User-friendly message
  details?: "Optional error details" // For debugging
}
```

---

## Implementation Guidelines

### In TypeScript/Next.js

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Success - 200
export async function GET(req: NextRequest) {
  const data = await fetchData();
  return NextResponse.json({
    success: true,
    data
  });
}

// Created - 201
export async function POST(req: NextRequest) {
  const newData = await createData(req.body);
  return NextResponse.json(
    {
      success: true,
      data: newData,
      message: "Created successfully"
    },
    { status: 201 }
  );
}

// Bad Request - 400
export async function POST(req: NextRequest) {
  const { field } = await req.json();
  if (!field) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: "Field is required"
      },
      { status: 400 }
    );
  }
}

// Unauthorized - 401
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required"
      },
      { status: 401 }
    );
  }
}

// Forbidden - 403
export async function DELETE(req: NextRequest) {
  if (userRole !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        details: "Admin access required"
      },
      { status: 403 }
    );
  }
}

// Not Found - 404
export async function GET(req: NextRequest, { params }) {
  const item = await findById(params.id);
  if (!item) {
    return NextResponse.json(
      {
        success: false,
        error: "Not found",
        details: `Item with ID ${params.id} not found`
      },
      { status: 404 }
    );
  }
}

// Internal Server Error - 500
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: await fetchData()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

---

## Common HTTP Status Codes NOT Used in Project

| Code | Reason for Not Using |
|------|---------------------|
| 204 No Content | Project always returns data in responses |
| 301/302 Redirect | API endpoints don't redirect |
| 429 Too Many Requests | Rate limiting not implemented |
| 503 Service Unavailable | No graceful degradation implemented |

---

## Testing Status Codes with cURL

```bash
# Test 200 OK
curl -X GET "http://localhost:3000/api/news"

# Test 201 CREATED
curl -X POST "http://localhost:3000/api/news" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"..."}'

# Test 400 BAD REQUEST
curl -X POST "http://localhost:3000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{}' # Missing required fields

# Test 401 UNAUTHORIZED
curl -X POST "http://localhost:3000/api/comments" \
  -H "Content-Type: application/json" \
  -d '{"newsId":1,"content":"test"}' # No token

# Test 404 NOT FOUND
curl -X GET "http://localhost:3000/api/news/99999"

# Test 500 INTERNAL SERVER ERROR
# (Intentionally cause a server error by invalid data)
```

---

## Testing in Postman

1. Create a new request
2. Select HTTP method
3. Enter endpoint URL
4. Check `Status` column in response for status code
5. View response body for error message

---

## Checklist for Developers

When creating new endpoints:

- [ ] Use 200 for successful GET/PUT requests
- [ ] Use 201 for successful POST requests that create resources
- [ ] Use 400 for validation errors
- [ ] Use 401 for missing/invalid authentication
- [ ] Use 403 for permission/authorization issues
- [ ] Use 404 for missing resources
- [ ] Use 500 for server errors (wrapped in try-catch)
- [ ] Always wrap responses in `{ success, data/error }`
- [ ] Include descriptive error messages
- [ ] Test all status codes before deployment

---

This reference should be included in your developer documentation and API guide.
