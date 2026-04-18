# Error Handling Guide - News Portal

This document outlines all error handling patterns, strategies, and implementations used in the News Portal project.

---

## Table of Contents

1. [Error Handling Patterns](#error-handling-patterns)
2. [Try-Catch-Finally Pattern](#try-catch-finally-pattern)
3. [Promise-Based Error Handling](#promise-based-error-handling)
4. [Custom Error Classes](#custom-error-classes)
5. [API Error Responses](#api-error-responses)
6. [Error Pages & Components](#error-pages--components)
7. [Error Logging & Monitoring](#error-logging--monitoring)
8. [Best Practices](#best-practices)

---

## Error Handling Patterns

### 1. Synchronous Error Handling (Try-Catch)

#### Basic Try-Catch Pattern
```typescript
// Basic error handling
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Failed to perform operation');
}
```

#### With Type Checking
```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Type error:', error.message);
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
  throw error;
}
```

#### Nested Try-Catch
```typescript
try {
  try {
    const user = await fetchUser(id);
  } catch (userError) {
    console.error('Failed to fetch user:', userError);
    throw new Error('User fetch failed');
  }
  
  try {
    const posts = await fetchUserPosts(id);
  } catch (postsError) {
    console.error('Failed to fetch posts:', postsError);
    throw new Error('Posts fetch failed');
  }
} catch (error) {
  handleFatalError(error);
}
```

### 2. Try-Catch-Finally Pattern

#### Complete Error Handling with Cleanup
```typescript
// Common in your project
export async function GET(request: NextRequest) {
  let connection;
  try {
    // Try block: Attempt operation
    connection = await openDatabase();
    const data = await connection.query('SELECT * FROM articles');
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    // Catch block: Handle error
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    
  } finally {
    // Finally block: Always execute (cleanup)
    if (connection) {
      await connection.close();
      console.log('Database connection closed');
    }
  }
}
```

#### Resource Cleanup Example
```typescript
export async function uploadFile(file: File) {
  let tempFile;
  try {
    // Create temporary file
    tempFile = await createTempFile(file);
    
    // Process file
    const result = await processFile(tempFile);
    
    // Save to storage
    await saveFile(result);
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Upload failed:', error);
    return {
      success: false,
      error: 'Failed to upload file'
    };
    
  } finally {
    // Always cleanup temporary files
    if (tempFile) {
      await deleteTempFile(tempFile);
    }
  }
}
```

#### Database Transaction Example
```typescript
export async function createArticleWithComments(
  articleData: ArticleInput,
  comments: CommentInput[]
) {
  const client = await prisma.$connect();
  try {
    // Transaction: Create article
    const article = await prisma.news.create({
      data: articleData
    });

    // Create associated comments
    await Promise.all(
      comments.map(comment =>
        prisma.comment.create({
          data: {
            ...comment,
            newsId: article.id
          }
        })
      )
    );

    return {
      success: true,
      data: article
    };

  } catch (error) {
    // Rollback implicit with Prisma
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: 'Failed to create article with comments'
    };

  } finally {
    // Always close connection
    await prisma.$disconnect();
  }
}
```

---

## Promise-Based Error Handling

### 1. .then().catch() Pattern

#### Basic Promise Chain
```typescript
// Used in some parts of project
function fetchNews() {
  return fetch('/api/news')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('News fetched:', data);
      return data;
    })
    .catch(error => {
      console.error('Failed to fetch news:', error);
      throw error;
    });
}
```

#### With Error Differentiation
```typescript
function handleNewsRequest() {
  return fetchNews()
    .catch(networkError => {
      if (networkError instanceof TypeError) {
        throw new Error('Network error - check your connection');
      }
      throw networkError;
    })
    .catch(error => {
      console.error('Final error:', error);
      notifyUser('Failed to load news');
    });
}
```

### 2. Promise.all() Error Handling

#### Parallel Operations
```typescript
// Recommended for multiple async operations
export async function loadDashboard() {
  try {
    const [users, articles, comments] = await Promise.all([
      prisma.user.count(),
      prisma.news.count(),
      prisma.comment.count()
    ]);

    return {
      success: true,
      data: { users, articles, comments }
    };

  } catch (error) {
    console.error('Dashboard data fetch failed:', error);
    return {
      success: false,
      error: 'Failed to load dashboard'
    };
  }
}
```

#### With Partial Failure Handling
```typescript
export async function fetchMultipleUsers(userIds: string[]) {
  const results = await Promise.allSettled(
    userIds.map(id => prisma.user.findUnique({ where: { id } }))
  );

  const users = results
    .filter(result => result.status === 'fulfilled')
    .map(result => (result as PromiseFulfilledResult<any>).value);

  const errors = results
    .filter(result => result.status === 'rejected')
    .map(result => (result as PromiseRejectedResult).reason);

  return {
    success: errors.length === 0,
    data: users,
    errors: errors.length > 0 ? errors : undefined
  };
}
```

### 3. Promise.race() Error Handling

#### Timeout Pattern
```typescript
function fetchWithTimeout(url: string, timeout: number = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return Promise.race([
    fetch(url, { signal: controller.signal }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ])
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    });
}
```

---

## Custom Error Classes

### 1. Base Error Class

```typescript
// src/lib/errors/BaseError.ts
export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
```

### 2. Specific Error Classes

```typescript
// src/lib/errors/index.ts

/**
 * Validation Error (400)
 * Used when input validation fails
 */
export class ValidationError extends BaseError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message, 400, true);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error (401)
 * Used when authentication fails
 */
export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error (403)
 * Used when user lacks permissions
 */
export class AuthorizationError extends BaseError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error (404)
 * Used when resource doesn't exist
 */
export class NotFoundError extends BaseError {
  constructor(resource: string, id?: string | number) {
    const message = `${resource}${id ? ` with ID ${id}` : ''} not found`;
    super(message, 404, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Database Error (500)
 * Used for database operation failures
 */
export class DatabaseError extends BaseError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Server Error (500)
 * Generic server error
 */
export class ServerError extends BaseError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
```

### 3. Using Custom Errors in API Routes

```typescript
// Example: src/app/api/admin/users/[id]/route.ts
import { NotFoundError, AuthorizationError, DatabaseError } from '@/lib/errors';

export async function DELETE(request: NextRequest, { params }) {
  try {
    // Check authentication
    const token = request.headers.get('authorization');
    if (!token) {
      throw new AuthenticationError('Token required');
    }

    // Verify user is admin
    const user = verifyJWT(token);
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!userToDelete) {
      throw new NotFoundError('User', params.id);
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    // Handle custom errors
    if (error instanceof BaseError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}
```

---

## API Error Responses

### 1. Standard Error Response Format

```typescript
// Successful response
{
  success: true,
  data: { /* payload */ },
  pagination?: { /* optional */ }
}

// Error response
{
  success: false,
  error: "User-friendly error message",
  details?: "Technical details for debugging",
  statusCode?: 400,
  fields?: { /* validation errors */ }
}
```

### 2. Validation Error Response

```typescript
// POST /api/contact
{
  success: false,
  error: "Validation failed",
  statusCode: 400,
  fields: {
    email: "Invalid email format",
    message: "Message must be at least 10 characters"
  }
}
```

### 3. Authentication Error Response

```typescript
// GET /api/admin/users without token
{
  success: false,
  error: "Authentication required",
  details: "Missing or invalid JWT token",
  statusCode: 401
}
```

### 4. Authorization Error Response

```typescript
// DELETE /api/admin/users/123 as regular user
{
  success: false,
  error: "Forbidden",
  details: "Admin access required",
  statusCode: 403
}
```

### 5. Database Error Response

```typescript
// Internal server error
{
  success: false,
  error: "Failed to fetch articles",
  details: "Database connection timeout",
  statusCode: 500
}
```

---

## Error Pages & Components

### 1. Error Page Component (Server)

Create these error pages in your app:

```typescript
// src/app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-8">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

### 2. Global Error Page

```typescript
// src/app/global-error.tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to external service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">500</h1>
            <p className="text-2xl mb-8">Internal Server Error</p>
            <p className="text-gray-400 mb-8">
              {error.message || 'Something went wrong. Please try again later.'}
            </p>
            <button
              onClick={() => reset()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 3. 404 Not Found Page

```typescript
// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">
          Page not found
        </p>
        <p className="text-gray-500 mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="inline-block px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 4. Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Something went wrong</p>
            <p className="text-sm">{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 5. API Error Handler

```typescript
// src/lib/error-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { BaseError } from '@/lib/errors';

export function handleApiError(error: unknown) {
  // Custom errors
  if (error instanceof BaseError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Error) {
    if (error.message.includes('Unique constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resource already exists',
          statusCode: 400
        },
        { status: 400 }
      );
    }

    if (error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resource not found',
          statusCode: 404
        },
        { status: 404 }
      );
    }
  }

  // Generic server error
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      statusCode: 500
    },
    { status: 500 }
  );
}
```

---

## Error Logging & Monitoring

### 1. Structured Logging

```typescript
// src/lib/secure-logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    };
    console.log(JSON.stringify(entry));
  },

  error: (message: string, error?: Error, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    };
    console.error(JSON.stringify(entry));
    // Send to external logging service (Sentry, LogRocket, etc.)
  },

  warn: (message: string, context?: Record<string, any>) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context
    };
    console.warn(JSON.stringify(entry));
  }
};
```

### 2. Using Logger in Routes

```typescript
import { logger } from '@/lib/secure-logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching articles', { userId: 'user123' });
    const articles = await prisma.news.findMany();
    return NextResponse.json({ success: true, data: articles });

  } catch (error) {
    logger.error(
      'Failed to fetch articles',
      error instanceof Error ? error : new Error(String(error)),
      { endpoint: '/api/articles' }
    );
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
```

---

## Best Practices

### ✅ DO

1. **Always use try-catch in async functions**
   ```typescript
   export async function handler() {
     try {
       // code
     } catch (error) {
       // handle
     }
   }
   ```

2. **Use custom error classes for clarity**
   ```typescript
   throw new ValidationError('Invalid email format');
   ```

3. **Include finally for cleanup**
   ```typescript
   try {
     // code
   } finally {
     cleanup();
   }
   ```

4. **Log all errors**
   ```typescript
   logger.error('Operation failed', error);
   ```

5. **Return consistent error format**
   ```typescript
   { success: false, error: "message", statusCode: 400 }
   ```

### ❌ DON'T

1. **Don't swallow errors silently**
   ```typescript
   // BAD
   try { riskyOp(); } catch (e) {}
   
   // GOOD
   try { riskyOp(); } catch (e) { logger.error('Failed', e); throw; }
   ```

2. **Don't return generic "something went wrong"**
   ```typescript
   // BAD
   catch (error) { return { error: 'Something went wrong' }; }
   
   // GOOD
   catch (error) { return { error: 'Failed to save user', details: error.message }; }
   ```

3. **Don't expose internal stack traces to clients**
   ```typescript
   // BAD
   return { error: error.stack };
   
   // GOOD
   return { error: 'Internal server error' };
   console.error(error.stack); // Log internally
   ```

4. **Don't mix error handling patterns inconsistently**
   ```typescript
   // Stick to try-catch in async functions, not .catch() chains
   ```

5. **Don't forget to handle rejected promises**
   ```typescript
   // BAD
   Promise.all([op1(), op2()]);
   
   // GOOD
   try {
     await Promise.all([op1(), op2()]);
   } catch (error) {
     // handle
   }
   ```

---

## Implementation Checklist

- [ ] Create custom error classes in `src/lib/errors/`
- [ ] Implement logger in `src/lib/secure-logger.ts`
- [ ] Add error pages (`error.tsx`, `global-error.tsx`, `not-found.tsx`)
- [ ] Create error boundary component
- [ ] Update all API routes with try-catch
- [ ] Use custom errors instead of generic Error
- [ ] Log all errors with context
- [ ] Test error scenarios
- [ ] Document error codes for API consumers
- [ ] Set up error monitoring service

---

This guide provides comprehensive error handling strategies for your News Portal project!
