# 📊 Prisma ORM Complete Guide

## What is Prisma?

**Prisma** is an **Object-Relational Mapping (ORM)** tool that makes it easy to work with databases in Node.js and TypeScript applications.

### Simple Explanation
Think of Prisma as a **translator between your code and the database**:
- Instead of writing raw SQL queries, you write simple JavaScript code
- Prisma automatically converts your code into SQL and sends it to the database
- Prisma returns the results as JavaScript objects you can use directly

### Real-World Analogy
If the database is a library:
- **SQL** = Learning the library's cataloging system and requesting books directly
- **Prisma** = Having a librarian who understands your requests and finds the books for you

---

## 🏗️ Prisma Architecture in This Project

### File Structure
```
project/
├── prisma/
│   ├── schema.prisma          ← Database structure (MAIN FILE)
│   └── migrations/            ← Database version history
│       ├── 20250907072504_add_image_url/
│       ├── 20251011112259_add_category_model/
│       └── 20251011112506_news10_11/
│
├── src/
│   └── lib/
│       ├── db.ts              ← Prisma client setup (creates connection)
│       ├── models/
│       │   ├── prisma.ts      ← Alternative client setup
│       │   ├── article.ts     ← Article operations
│       │   └── ... (other models)
│       └── ... (other utilities)
│
└── docs/
    └── PRISMA_GUIDE.md        ← This file
```

---

## 📝 Prisma Schema: The Blueprint

**Location:** `prisma/schema.prisma`

The schema file defines:
1. **Database connection** (where is the data stored?)
2. **Data models** (what data do we store?)
3. **Relationships** (how are models connected?)

### Schema Configuration Section

```prisma
generator client {
  provider      = "prisma-client-js"  // Use JavaScript client
  binaryTargets = ["native"]          // Use native binaries
}

datasource db {
  provider = "postgresql"             // Database type (PostgreSQL)
  url      = env("DATABASE_URL")      // Connection string from .env
}
```

**What this means:**
- **generator client:** Creates JavaScript/TypeScript code to interact with database
- **datasource db:** Defines which database to connect to
- **DATABASE_URL:** Environment variable containing: `postgresql://user:password@host:port/database`

---

## 🗂️ Database Models (Tables)

Each model in schema represents a database table. Here are all models in this project:

### 1. **User Model** - Stores user accounts

```prisma
model User {
  id              String        @id @default(cuid())
  email           String        @unique
  name            String?
  password        String?
  role            Role          @default(USER)          // ADMIN, EDITOR, USER, GUEST
  image           String?
  contactNumber   String?
  reputation      Int           @default(0)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relations to other models
  commentEdits    CommentEdit[]
  comments        Comment[]
  reportsReceived UserReport[]  @relation("reportsReceived")
  reportsMade     UserReport[]  @relation("reportsMade")

  @@map("users")  // Database table name
}
```

**What's stored:**
- User login credentials (email, password)
- User profile info (name, image, contact number)
- User role (permission level)
- Timestamps (created, updated)

**Simple example:**
```
┌─────────────────────────────────────┐
│ users (table)                       │
├──────┬───────┬──────┬──────┬────────┤
│ id   │ email │ name │ role │ ...    │
├──────┼───────┼──────┼──────┼────────┤
│ u1   │ a@... │ Ali  │USER  │        │
│ u2   │ b@... │ Bob  │ADMIN │        │
└──────┴───────┴──────┴──────┴────────┘
```

---

### 2. **News Model** - Stores articles

```prisma
model News {
  id             Int       @id @default(autoincrement())
  title          String
  categoryId     String    // Points to Category
  author         String
  published_date String?
  image          String?
  imageUrl       String?
  summary        String?
  content        String
  tags           String[]
  status         String    @default("published")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  comments       Comment[]
  category       Category  @relation("NewsCategory", fields: [categoryId], references: [id])

  @@map("news")
}
```

**What's stored:**
- Article title, content, summary
- Article image and tags
- Category the article belongs to
- Publication date and status

---

### 3. **Category Model** - Stores article categories

```prisma
model Category {
  id            String     @id @default(cuid())
  name          String     // "Technology", "Sports", etc.
  slug          String     @unique
  description   String?
  parentId      String?    // For subcategories
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  parent        Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  subcategories Category[] @relation("CategoryHierarchy")
  articles      News[]     @relation("NewsCategory")

  @@map("categories")
}
```

**What's stored:**
- Category name ("Technology", "Sports", etc.)
- Parent/child relationships (subcategories)
- Description and slug

**Hierarchy example:**
```
News (parent)
├── Technology (child)
├── Sports (child)
└── Health (child)
```

---

### 4. **Comment Model** - Stores user comments

```prisma
model Comment {
  id          Int           @id @default(autoincrement())
  userId      String
  newsId      Int
  content     String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  editHistory CommentEdit[]
  news        News          @relation(fields: [newsId], references: [id])
  user        User          @relation(fields: [userId], references: [id])
  reports     UserReport[]

  @@map("comments")
}
```

**What's stored:**
- Comment text
- Which user made the comment
- Which article the comment is on
- Edit history

---

### 5. **CommentEdit Model** - Stores comment edit history

```prisma
model CommentEdit {
  id         String   @id @default(cuid())
  commentId  Int
  oldContent String   // Original text
  newContent String   // New text
  reason     String?  // Why it was edited
  createdAt  DateTime @default(now())
  userId     String
  
  comment    Comment  @relation(fields: [commentId], references: [id])
  user       User     @relation(fields: [userId], references: [id])

  @@map("comment_edits")
}
```

---

### 6. **UserReport Model** - Reports inappropriate users/comments

```prisma
model UserReport {
  id             String   @id @default(cuid())
  reporterId     String   // Who reported
  reportedUserId String   // Who was reported
  commentId      Int?     // Optional: if reporting a comment
  reason         String   // Why they were reported
  status         String   @default("pending")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  comment        Comment? @relation(fields: [commentId], references: [id])
  reportedUser   User     @relation("reportsReceived", fields: [reportedUserId], references: [id])
  reporter       User     @relation("reportsMade", fields: [reporterId], references: [id])

  @@index([reportedUserId, reporterId, status])
  @@map("user_reports")
}
```

---

### 7. **SiteSettings Model** - Stores website configuration

```prisma
model SiteSettings {
  id                String   @id @default(cuid())
  siteName          String
  siteDescription   String
  siteLogo          String?
  siteUrl           String
  metaTitle         String
  metaDescription   String
  metaKeywords      String
  
  // Social media links
  facebookUrl       String?
  twitterUrl        String?
  instagramUrl      String?
  
  // Analytics
  googleAnalyticsId String?
  facebookPixelId   String?
  
  contactEmail      String?
  contactPhone      String?
  contactAddress    String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("site_settings")
}
```

**What's stored:**
- Website name, logo, description
- SEO meta tags
- Social media links
- Analytics IDs
- Contact information

---

### 8. **PageContent Model** - Stores static page content

```prisma
model PageContent {
  id              String   @id @default(cuid())
  pageSlug        String   @unique  // "about", "contact", etc.
  pageTitle       String
  pageContent     String   // HTML content
  metaTitle       String?
  metaDescription String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("page_content")
}
```

---

### 9. **MediaFile Model** - Tracks uploaded files

```prisma
model MediaFile {
  id           String   @id @default(cuid())
  fileName     String
  originalName String
  filePath     String
  fileSize     Int
  mimeType     String   // "image/png", "video/mp4", etc.
  uploadedBy   String
  createdAt    DateTime @default(now())

  @@map("media_files")
}
```

---

### 10. **AnalyticsEvent Model** - Tracks user activity

```prisma
model AnalyticsEvent {
  id        String   @id @default(cuid())
  type      String   // "page_view", "button_click", etc.
  sessionId String
  userId    String?
  path      String   // "/articles", "/login", etc.
  userAgent String?
  referrer  String?
  timestamp DateTime @default(now())
  metadata  Json?    // Custom data

  @@index([type, timestamp])
  @@map("analytics_events")
}
```

---

### 11. **ContactMessage Model** - Stores contact form submissions

```prisma
model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  resolved  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("contact_messages")
}
```

---

### 12. **JobApplication Model** - Stores job applications

```prisma
model JobApplication {
  id        String   @id @default(cuid())
  // ... (rest of fields)
}
```

---

## 🔗 Understanding Relationships

### What are Relationships?

Relationships connect different models together. They're like **foreign keys** that link tables.

### Types of Relationships in This Project

#### 1. **One-to-Many: User → Comments**

```prisma
// User can have many comments
model User {
  id       String
  comments Comment[]  // Array of comments
}

// Comment belongs to one user
model Comment {
  id     Int
  userId String
  user   User @relation(fields: [userId], references: [id])
}
```

**Real example:**
```
┌──────────────┐         ┌──────────────┐
│ users        │         │ comments     │
├──────────────┤         ├──────────────┤
│ id: u1       │────┐    │ id: c1       │
│ email: a@... │    └────│ userId: u1   │
└──────────────┘         │ content: ... │
                         ├──────────────┤
┌──────────────┐         │ id: c2       │
│ users        │         │ userId: u1   │
├──────────────┤         │ content: ... │
│ id: u2       │────┐    └──────────────┘
│ email: b@... │    └────┐ (more comments)
└──────────────┘         └──────────────┘

User u1 has 2 comments
User u2 has 0 comments
```

#### 2. **One-to-Many: Category → News (Articles)**

```prisma
model Category {
  id       String
  articles News[] @relation("NewsCategory")
}

model News {
  categoryId String
  category   Category @relation("NewsCategory", fields: [categoryId], references: [id])
}
```

---

#### 3. **Self-Relation: Category → Parent Category (Subcategories)**

```prisma
model Category {
  id            String
  parentId      String?
  
  parent        Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  subcategories Category[] @relation("CategoryHierarchy")
}
```

**Hierarchy:**
```
Technology (parentId: null)
├── Programming (parentId: Technology)
└── AI (parentId: Technology)

Sports (parentId: null)
└── Football (parentId: Sports)
```

---

#### 4. **Many-to-Many through Junction: User ↔ Reports**

```prisma
model User {
  reportsReceived UserReport[] @relation("reportsReceived")
  reportsMade     UserReport[] @relation("reportsMade")
}

model UserReport {
  reporterId     String
  reportedUserId String
  
  reporter      User @relation("reportsMade", fields: [reporterId], references: [id])
  reportedUser  User @relation("reportsReceived", fields: [reportedUserId], references: [id])
}
```

---

## 🗄️ Prisma Client Setup

### Location: `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client'

// Create global type for Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or get existing client
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Only store in global during development (avoid connection pooling issues)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma;
```

**What this does:**

1. **Imports PrismaClient:** The main tool to query database
2. **Creates global connection:** One connection shared across app
3. **Prevents duplicate connections:** In development, reuses existing connection
4. **Exports for use:** Other files import this client

**Why global?**
- Creating a new Prisma client each time = multiple database connections
- Multiple connections = slow and wastes resources
- Global client = one connection reused everywhere

---

### Alternative Setup: `src/lib/models/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Note:** This project uses TWO Prisma setups!
- `src/lib/db.ts` - Used in some routes
- `src/lib/models/prisma.ts` - Used in other routes

**Best practice:** Use only ONE setup!

---

## 🔍 Prisma Query Examples

### 1. **CREATE - Add data to database**

```typescript
// Simple create
const newUser = await prisma.user.create({
  data: {
    email: "john@example.com",
    name: "John Doe",
    role: "USER"
  }
});

// Output:
// {
//   id: "user_123",
//   email: "john@example.com",
//   name: "John Doe",
//   role: "USER",
//   createdAt: 2024-11-30T...
// }
```

**Real use in project:** `src/app/api/auth/register/route.ts`
```typescript
const user = await prisma.user.create({
  data: {
    email: email.toLowerCase(),
    name: extractNameFromEmail(email),
    password: await bcrypt.hash(password, 10),
    role: 'USER'
  }
});
```

---

### 2. **READ - Get data from database**

#### Get one record

```typescript
// Find by ID
const user = await prisma.user.findUnique({
  where: { id: "user_123" }
});

// Find by email
const user = await prisma.user.findUnique({
  where: { email: "john@example.com" }
});
```

**Real use in project:** `src/app/api/auth/login/route.ts`
```typescript
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
});
```

---

#### Get multiple records

```typescript
// Get all users
const users = await prisma.user.findMany();

// Get with filtering
const activeUsers = await prisma.user.findMany({
  where: { role: "ADMIN" }
});

// Get with sorting and limit
const topUsers = await prisma.user.findMany({
  where: { role: { in: ["ADMIN", "EDITOR"] } },
  orderBy: { reputation: "desc" },
  take: 10  // Limit to 10 results
});

// Get with pagination
const users = await prisma.user.findMany({
  skip: 20,  // Skip first 20
  take: 10   // Get next 10
});
```

**Real use in project:** `src/app/api/admin/users/route.ts`
```typescript
const users = await prisma.user.findMany({
  where: where,
  skip: (page - 1) * limit,
  take: limit,
  select: {
    id: true,
    email: true,
    name: true,
    role: true
  }
});
```

---

#### Get with relationships (include)

```typescript
// Get user WITH their comments
const user = await prisma.user.findUnique({
  where: { id: "user_123" },
  include: {
    comments: true  // Include all comments
  }
});

// Result:
// {
//   id: "user_123",
//   email: "john@...",
//   comments: [
//     { id: 1, content: "Great article!" },
//     { id: 2, content: "I disagree..." }
//   ]
// }

// Get article WITH category AND comments
const article = await prisma.news.findUnique({
  where: { id: 1 },
  include: {
    category: true,
    comments: {
      include: {
        user: true  // Even get user data for each comment
      }
    }
  }
});
```

**Real use in project:** `src/lib/models/article.ts`
```typescript
export async function getNews() {
  return prisma.news.findMany({
    include: {
      category: true  // Include category data
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
```

---

### 3. **UPDATE - Modify existing data**

```typescript
// Update one field
const updated = await prisma.user.update({
  where: { id: "user_123" },
  data: { name: "John Smith" }
});

// Update multiple fields
const updated = await prisma.user.update({
  where: { email: "john@example.com" },
  data: {
    name: "John Smith",
    reputation: 50,
    image: "url_to_image"
  }
});

// Increment a field
const updated = await prisma.user.update({
  where: { id: "user_123" },
  data: { reputation: { increment: 10 } }
});
```

**Real use in project:** `src/app/api/profile/route.ts`
```typescript
const updated = await prisma.user.update({
  where: { id: userId },
  data: {
    name: body.name,
    image: body.image
  }
});
```

---

### 4. **DELETE - Remove data from database**

```typescript
// Delete one record
const deleted = await prisma.user.delete({
  where: { id: "user_123" }
});

// Delete many records
const result = await prisma.user.deleteMany({
  where: { role: "GUEST" }
});
// Returns: { count: 5 } (deleted 5 users)
```

---

### 5. **COUNT - Count records**

```typescript
// Count all users
const totalUsers = await prisma.user.count();
// Returns: 42

// Count with filter
const admins = await prisma.user.count({
  where: { role: "ADMIN" }
});
// Returns: 3

// Count grouped
const counts = await Promise.all([
  prisma.user.count(),
  prisma.news.count(),
  prisma.comment.count()
]);
```

**Real use in project:** `src/app/api/socket/route.ts`
```typescript
const [userCount, newsCount, commentCount] = await Promise.all([
  prisma.user.count(),
  prisma.news.count(),
  prisma.comment.count()
]);
```

---

### 6. **AGGREGATE - Perform calculations**

```typescript
// Get average, min, max
const stats = await prisma.user.aggregate({
  _count: true,       // Total count
  _avg: {
    reputation: true  // Average reputation
  },
  _max: {
    reputation: true  // Highest reputation
  }
});

// Result:
// {
//   _count: 100,
//   _avg: { reputation: 45.5 },
//   _max: { reputation: 999 }
// }
```

---

### 7. **RAW QUERIES - Direct SQL**

```typescript
// For complex queries that Prisma doesn't support
const result = await prisma.$queryRaw`
  SELECT u.id, u.name, COUNT(c.id) as comment_count
  FROM users u
  LEFT JOIN comments c ON u.id = c.userId
  GROUP BY u.id
`;
```

---

## 📍 Where Prisma is Used in This Project

### 1. **Authentication Routes** (`src/app/api/auth/`)

#### Login: `login/route.ts`
```typescript
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
});
// Finds user by email
```

#### Register: `register/route.ts`
```typescript
const user = await prisma.user.create({
  data: {
    email,
    name,
    password: hashedPassword,
    role: 'USER'
  }
});
// Creates new user account
```

---

### 2. **Admin Routes** (`src/app/api/admin/`)

#### Users Management: `users/route.ts`
```typescript
const users = await prisma.user.findMany({
  where: where,
  skip: (page - 1) * limit,
  take: limit
});
// Lists all users with pagination
```

---

### 3. **Article Routes** (`src/app/api/articles/`)

```typescript
// Get all articles with categories
const articles = await prisma.news.findMany({
  include: { category: true },
  orderBy: { createdAt: 'desc' }
});

// Create new article
const article = await prisma.news.create({
  data: {
    title,
    categoryId,
    author,
    content,
    tags: tagArray
  }
});
```

---

### 4. **Profile Routes** (`src/app/api/profile/`)

```typescript
// Get user profile
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Update profile
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name, image }
});
```

---

### 5. **Site Settings** (`src/app/api/site-settings/`)

```typescript
// Get site settings
let settings = await prisma.siteSettings.findFirst();

// Create if doesn't exist
if (!settings) {
  settings = await prisma.siteSettings.create({
    data: defaultSettings
  });
}

// Update settings
settings = await prisma.siteSettings.update({
  where: { id: settings.id },
  data: newSettings
});
```

---

### 6. **Category Routes** (`src/app/api/categories/`)

```typescript
// Get all categories with subcategories
const categories = await prisma.category.findMany({
  include: {
    subcategories: true,
    articles: true
  }
});

// Create category
const category = await prisma.category.create({
  data: {
    name,
    slug,
    description,
    parentId  // For subcategories
  }
});
```

---

### 7. **Comment Routes** (`src/app/api/comments/`)

```typescript
// Get comments for an article
const comments = await prisma.comment.findMany({
  where: { newsId },
  include: { user: true }  // Get comment author info
});

// Create comment
const comment = await prisma.comment.create({
  data: {
    userId,
    newsId,
    content
  }
});

// Edit comment (track in CommentEdit)
await prisma.commentEdit.create({
  data: {
    commentId,
    oldContent,
    newContent,
    reason,
    userId
  }
});
```

---

### 8. **Helper Functions** (`src/lib/models/`)

#### `article.ts` - Article operations
```typescript
export async function getNews() {
  return prisma.news.findMany({ include: { category: true } });
}

export async function getNewsById(id: number) {
  return prisma.news.findUnique({
    where: { id },
    include: { category: true }
  });
}

export async function getNewsByCategory(categoryId: string) {
  return prisma.news.findMany({
    where: { categoryId },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

### 9. **Server Components** (`src/components/`)

#### `ProtectedEditorWrapper.tsx`
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
});

if (user?.role !== 'EDITOR' && user?.role !== 'ADMIN') {
  return <AccessDenied />;
}
```

---

### 10. **Sitemap** (`src/app/sitemap.ts`)

```typescript
const articles = await prisma.news.findMany();

const articleUrls = articles.map(article => ({
  url: `${siteUrl}/article/${article.id}`,
  lastModified: article.updatedAt
}));
```

---

### 11. **SEO** (`src/lib/seo.ts`)

```typescript
const settings = await prisma.siteSettings.findFirst();

export const generateMetadata: Metadata = {
  title: settings?.metaTitle,
  description: settings?.metaDescription
};
```

---

### 12. **Analytics** (`src/app/api/socket/route.ts`)

```typescript
// Track user activity
const [userCount, newsCount, commentCount] = await Promise.all([
  prisma.user.count(),
  prisma.news.count(),
  prisma.comment.count()
]);

// Get popular articles
const popularArticles = await prisma.news.findMany({
  take: 5,
  orderBy: { comments: { _count: 'desc' } }
});
```

---

## 🛠️ Prisma Operations Reference

### Quick Syntax Guide

| Operation | Syntax | Example |
|-----------|--------|---------|
| **Create** | `.create({ data: {} })` | `prisma.user.create({ data: { email: "..." } })` |
| **Read One** | `.findUnique({ where: {} })` | `prisma.user.findUnique({ where: { id: "1" } })` |
| **Read One** | `.findFirst({ where: {} })` | `prisma.user.findFirst({ where: { role: "ADMIN" } })` |
| **Read Many** | `.findMany({ where: {} })` | `prisma.user.findMany({ where: { role: "USER" } })` |
| **Update** | `.update({ where: {}, data: {} })` | `prisma.user.update({ where: { id }, data: { name: "..." } })` |
| **Delete** | `.delete({ where: {} })` | `prisma.user.delete({ where: { id } })` |
| **Count** | `.count({ where: {} })` | `prisma.user.count({ where: { role: "ADMIN" } })` |
| **Aggregate** | `.aggregate({ _count: true })` | `prisma.user.aggregate({ _count: true })` |
| **Include** | `include: { relationName: true }` | `include: { comments: true }` |
| **Where filter** | `where: { field: value }` | `where: { role: "ADMIN", verified: true }` |
| **Order** | `orderBy: { field: "asc"/"desc" }` | `orderBy: { createdAt: "desc" }` |
| **Pagination** | `skip: n, take: n` | `skip: 10, take: 20` |

---

## 🚀 Common Patterns in This Project

### Pattern 1: Find and Update

```typescript
// Step 1: Find the record
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Step 2: Check if exists
if (!user) {
  throw new Error('User not found');
}

// Step 3: Update
const updated = await prisma.user.update({
  where: { id: userId },
  data: { name: newName }
});
```

---

### Pattern 2: Create with Relations

```typescript
// Create article linked to category
const article = await prisma.news.create({
  data: {
    title: "Breaking News",
    content: "...",
    author: "John",
    categoryId: "tech_123",  // Links to Category
    tags: ["news", "tech"]
  }
});
```

---

### Pattern 3: Get with Nested Relations

```typescript
// Get article with:
// - Category info
// - Comments (with user info for each)
const article = await prisma.news.findUnique({
  where: { id: articleId },
  include: {
    category: true,
    comments: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    }
  }
});
```

---

### Pattern 4: Pagination

```typescript
const page = 1;
const limit = 10;

const [items, total] = await Promise.all([
  prisma.model.findMany({
    skip: (page - 1) * limit,
    take: limit
  }),
  prisma.model.count()
]);

const totalPages = Math.ceil(total / limit);
```

---

### Pattern 5: Transaction (Multiple operations together)

```typescript
// All operations succeed or all fail
const result = await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: { email, password }
  });

  // Create notification
  await tx.notification.create({
    data: {
      userId: user.id,
      message: "Welcome!"
    }
  });

  return user;
});
```

---

## 🔐 Security Best Practices with Prisma

### 1. **Always Validate Input**

```typescript
// ❌ BAD - Direct user input
const user = await prisma.user.findUnique({
  where: { email: req.body.email }  // Not validated!
});

// ✅ GOOD - Validate first
const schema = z.object({ email: z.string().email() });
const { email } = schema.parse(req.body);
const user = await prisma.user.findUnique({
  where: { email }
});
```

---

### 2. **Use Where Clauses for Security**

```typescript
// ❌ BAD - No verification
const comments = await prisma.comment.findMany();

// ✅ GOOD - Only get user's comments
const comments = await prisma.comment.findMany({
  where: { userId: currentUserId }
});
```

---

### 3. **Never Expose Sensitive Data**

```typescript
// ❌ BAD - Returns password
const user = await prisma.user.findUnique({
  where: { id: userId }
});
res.json(user);  // Password exposed!

// ✅ GOOD - Use select to exclude
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    name: true,
    // password: NOT included
  }
});
res.json(user);
```

---

### 4. **Verify Permissions Before Deleting**

```typescript
// ❌ BAD - Anyone can delete anything
await prisma.article.delete({
  where: { id: articleId }
});

// ✅ GOOD - Verify ownership
const article = await prisma.news.findUnique({
  where: { id: articleId }
});

if (article.author !== currentUser) {
  throw new AuthorizationError('Cannot delete this article');
}

await prisma.news.delete({
  where: { id: articleId }
});
```

---

## 🔄 Database Migrations

### What are Migrations?

Migrations are version control for your database. They track changes to the schema over time.

**In this project:**

```
migrations/
├── 20250907072504_add_image_url/
│   └── migration.sql
├── 20251011112259_add_category_model/
│   └── migration.sql
└── 20251011112506_news10_11/
    └── migration.sql
```

### How it works:

1. **Modify `prisma/schema.prisma`**
```prisma
model User {
  newField String?  // Added new field
}
```

2. **Run migration command**
```bash
npx prisma migrate dev --name add_new_field
```

3. **Migration is created and applied**
- Database updated
- `migrations/` folder updated
- Can be committed to git

4. **Other developers run**
```bash
npx prisma migrate deploy
```

---

## 📊 Environment Configuration

### `.env` file requirements

```
DATABASE_URL="postgresql://user:password@localhost:5432/news_db"
```

**Format breakdown:**
- `postgresql://` - Database type
- `user:password` - Database credentials
- `localhost:5432` - Database host and port
- `news_db` - Database name

---

## ✅ Prisma Workflow Summary

```
┌─────────────────────────────────────────┐
│ 1. Define Models in schema.prisma       │
│    (User, News, Comment, etc.)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 2. Run: npx prisma migrate dev          │
│    (Creates database tables)            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 3. Create Prisma Client (db.ts)         │
│    (One connection for whole app)       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 4. Import client in your routes         │
│    (import { prisma } from '@/lib/db')  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 5. Use Prisma methods                   │
│    (create, findMany, update, delete)   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 6. Prisma converts to SQL               │
│    (Automatically!)                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│ 7. Execute on PostgreSQL                │
│    (Data returned to JavaScript)        │
└─────────────────────────────────────────┘
```

---

## 🎓 Real-World Example: Complete Login Flow

```typescript
// 1. IMPORT Prisma client
import { prisma } from '@/lib/db';

// 2. RECEIVE login request
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  try {
    // 3. FIND user in database
    // Prisma converts this to SQL:
    // SELECT * FROM users WHERE email = 'john@example.com'
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // 4. CHECK password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 5. CREATE JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 6. RETURN success with token
    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Summary

| Topic | Key Point |
|-------|-----------|
| **What is Prisma?** | ORM that translates JavaScript to SQL |
| **Where is it defined?** | `prisma/schema.prisma` |
| **How to use it?** | `import { prisma } from '@/lib/db'` |
| **Main models** | User, News, Comment, Category, etc. |
| **Main operations** | Create, Read, Update, Delete, Count |
| **Database type** | PostgreSQL |
| **Connection** | `DATABASE_URL` environment variable |
| **Relationships** | One-to-Many, Many-to-Many, Self-relations |
| **Security** | Always validate input, check permissions, don't expose passwords |

---

**Prisma makes database operations simple, type-safe, and secure! 🚀**
