# News Portal API Routes - Swagger Documentation

## Complete API Routes List with Swagger Documentation

This document provides Swagger/OpenAPI documentation for all API routes in the News Portal project.

---

## PUBLIC ROUTES

### 1. News Endpoints

#### GET /api/news
```swagger
/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news articles with pagination and filtering
 *     tags:
 *       - News
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (Technology, Business, etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and summary
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (createdAt, title, etc.)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       category:
 *                         type: string
 *                       content:
 *                         type: string
 *                       image:
 *                         type: string
 *                       comments:
 *                         type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Failed to fetch news
 */
```

#### POST /api/news (Protected - Admin/Editor only)
```swagger
/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a new news article
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *               - summary
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               summary:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: News article created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Failed to create article
 */
```

#### GET /api/news/[id]
```swagger
/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get a specific news article by ID
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article details
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to fetch article
 */
```

#### PUT /api/news/[id] (Protected - Admin/Editor only)
```swagger
/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update a news article
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Article not found
 */
```

#### DELETE /api/news/[id] (Protected - Admin only)
```swagger
/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete a news article
 *     tags:
 *       - News
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Article not found
 */
```

---

### 2. Comments Endpoints

#### GET /api/comments
```swagger
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Get comments for a news article or current user
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: query
 *         name: newsId
 *         schema:
 *           type: integer
 *         description: News article ID (required if mode is not 'user')
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [user]
 *         description: If 'user', returns comments by authenticated user (requires auth)
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comments:
 *                       type: array
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized for user mode
 *       500:
 *         description: Failed to fetch comments
 */
```

#### POST /api/comments (Protected - User only)
```swagger
/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment on a news article
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newsId
 *               - content
 *             properties:
 *               newsId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only regular users can post comments
 *       500:
 *         description: Failed to create comment
 */
```

#### GET /api/comments/[id]
```swagger
/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Get a specific comment by ID
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Comment not found
 */
```

#### DELETE /api/comments/[id] (Protected - Admin or comment author)
```swagger
/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment not found
 */
```

---

### 3. Contact Endpoint

#### POST /api/contact
```swagger
/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form message
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       415:
 *         description: Invalid content type
 *       500:
 *         description: Failed to submit message
 */
```

---

## AUTHENTICATION ROUTES

#### POST /api/auth/register
```swagger
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Registration failed
 */
```

#### POST /api/auth/login
```swagger
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         name:
 *                           type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
```

#### GET /api/auth/check (Protected)
```swagger
/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Verify JWT token and get current user info
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid or missing token
 *       500:
 *         description: Verification failed
 */
```

#### POST /api/auth/logout (Protected)
```swagger
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (clear session/token)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Authentication required
 */
```

---

## ADMIN ROUTES (Protected - Admin only)

#### GET /api/admin/dashboard
```swagger
/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalArticles:
 *                       type: integer
 *                     totalComments:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
```

#### GET /api/admin/users
```swagger
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
```

#### POST /api/admin/users
```swagger
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, editor]
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
```

#### GET /api/admin/users/[id]
```swagger
/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a specific user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
```

#### PUT /api/admin/users/[id]
```swagger
/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update user details
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
```

#### DELETE /api/admin/users/[id]
```swagger
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
```

#### GET /api/admin/categories
```swagger
/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all news categories
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
```

#### POST /api/admin/categories
```swagger
/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Authentication required
 */
```

---

## CUSTOMER/PROFILE ROUTES (Protected - Authenticated users)

#### GET /api/customer/profile
```swagger
/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Authentication required
 */
```

#### POST /api/customer/profile
```swagger
/**
 * @swagger
 * /api/customer/profile:
 *   post:
 *     summary: Update current user profile
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required
 */
```

#### POST /api/customer/change-image
```swagger
/**
 * @swagger
 * /api/customer/change-image:
 *   post:
 *     summary: Upload/change user profile image
 *     tags:
 *       - Customer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       401:
 *         description: Authentication required
 *       415:
 *         description: Invalid file type
 */
```

---

## ADDITIONAL ROUTES

#### GET /api/pages/[slug]
```swagger
/**
 * @swagger
 * /api/pages/{slug}:
 *   get:
 *     summary: Get a specific page by slug (e.g., about, privacy)
 *     tags:
 *       - Pages
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page content
 *       404:
 *         description: Page not found
 */
```

#### GET /api/site-settings
```swagger
/**
 * @swagger
 * /api/site-settings:
 *   get:
 *     summary: Get site configuration settings
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: Site settings
 */
```

#### POST /api/site-settings (Protected - Admin only)
```swagger
/**
 * @swagger
 * /api/site-settings:
 *   post:
 *     summary: Update site settings
 *     tags:
 *       - Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               siteDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       401:
 *         description: Authentication required
 */
```

---

## SECURITY SCHEMES

```swagger
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         error:
 *           type: string
 *         details:
 *           type: string
 */
```

---

## Implementation Notes

### For Each Route File

Use this template structure in your route files:

```typescript
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/your-route:
 *   get:
 *     summary: Your endpoint summary
 *     tags:
 *       - Your Category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: paramName
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Your implementation
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Environment Variables Required

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### API Response Format

All endpoints follow this standard response format:

**Success (2xx):**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "pagination": { /* optional, for list endpoints */ }
}
```

**Error (4xx/5xx):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

---

## Testing Endpoints

### Using cURL

```bash
# Get all news
curl -X GET "http://localhost:3000/api/news?page=1&limit=10"

# Create news (with auth)
curl -X POST "http://localhost:3000/api/news" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Article","content":"...","category":"Technology"}'

# Login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Using Postman

1. Import the Swagger spec from `/api/docs`
2. Set authorization type to `Bearer Token`
3. Add your JWT token
4. Test endpoints

---

This documentation covers all public, protected, and admin routes in your News Portal API. Update route files with JSDoc comments as shown above to keep documentation in sync with code.
