================================================================================
                    FULL-STACK NEWS PORTAL DEVELOPMENT GUIDE
                           (Complete Beginner's Reference)
================================================================================

TABLE OF CONTENTS
====================
1. Project Overview & Architecture
2. Database Schema & Relationships  
3. Authentication System (JWT)
4. Frontend Pages & Components
5. API Endpoints & Data Flow
6. Real-Time Features (Socket.io)
7. Common Errors & Debugging
8. Development Workflow
9. Security & Best Practices

================================================================================
1. PROJECT OVERVIEW & ARCHITECTURE
================================================================================

TECHNOLOGY STACK:
- Frontend: Next.js 15 + React + TypeScript + Tailwind CSS
- Backend: Next.js API Routes + Prisma ORM
- Database: PostgreSQL
- Real-time: Socket.io
- Authentication: JWT tokens
- Styling: Tailwind CSS + Shadcn/ui

PROJECT STRUCTURE:
news_portal/
  src/
    app/                    # Next.js app directory
      api/               # Backend API routes
        auth/         # Authentication APIs
        admin/        # Admin management APIs
        comments/     # Comment system APIs
        socket/       # Real-time APIs
    admin/            # Admin dashboard pages
    article/          # Article display pages
    login/            # Authentication pages
    profile/          # User profile pages
    components/           # Reusable React components
    ui/              # UI components (buttons, forms, etc.)
    lib/                 # Utility functions
      auth.ts          # JWT authentication
      db.ts            # Database connection
      error-handler.ts # Error handling
  prisma/              # Database schema
  public/                  # Static files
  package.json            # Dependencies

================================================================================
2. DATABASE SCHEMA & RELATIONSHIPS
================================================================================

DATABASE MODELS (prisma/schema.prisma):

// Users table - stores all user information
model User {
  id            String    @id @default(cuid())
  email         String    @unique        // User's email (unique)
  name          String?                  // User's full name
  password      String?                  // Hashed password
  role          String    @default("user") // user/admin/editor
  image         String?                  // Profile image URL
  contactNumber String?                  // Phone number
  createdAt     DateTime  @default(now()) // Account creation date
  updatedAt     DateTime  @updatedAt      // Last update date
  comments      Comment[]                // User's comments (relationship)
}

// News table - stores all articles
model News {
  id             Int       @id @default(autoincrement())
  title          String                   // Article title
  category       String                   // Main category (Technology, Business, etc.)
  subcategory    String?                  // Optional subcategory
  author         String                   // Author name
  published_date String                   // Publication date
  image          String                   // Featured image URL
  summary        String                   // Article summary
  content        String                   // Full article content
  tags           String[]                 // Array of tags
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  comments       Comment[]                // Article's comments (relationship)
}

// Comments table - stores user comments on articles
model Comment {
  id        Int      @id @default(autoincrement())
  userId    String   // Reference to User
  newsId    Int      // Reference to News article
  content   String   // Comment text
  createdAt DateTime @default(now())
  news      News     @relation(fields: [newsId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}

RELATIONSHIPS:
- One User can have Many Comments (1:N)
- One News Article can have Many Comments (1:N)
- Comments belong to both User and News (N:1)

================================================================================
3. AUTHENTICATION SYSTEM (JWT)
================================================================================

HOW AUTHENTICATION WORKS:

1. USER REGISTRATION FLOW:
   User fills form -> API creates user -> Returns JWT token

   POST /api/auth/register
   Body: { email, name, password, contactNumber }
   Response: { success: true, data: { user, token } }

2. USER LOGIN FLOW:
   User enters credentials -> API verifies -> Returns JWT token

   POST /api/auth/login
   Body: { email, password }
   Response: { success: true, data: { user, token } }

3. TOKEN STORAGE:
   - Frontend: Stored in httpOnly cookies' (note: recommend update to HttpOnly cookies)
   - Backend: Sent in Authorization: Bearer <token> header

4. TOKEN VERIFICATION:
   Every protected API checks the token:
   const token = request.headers.get('authorization')?.replace('Bearer ', '');
   const payload = verifyJWT(token); // Decodes and validates token

USER ROLES:
- user: Can read articles, post comments, manage profile
- admin: Can manage everything (users, articles, categories)
- editor: Can manage articles and content

================================================================================
4. FRONTEND PAGES & COMPONENTS
================================================================================

PUBLIC PAGES (No Login Required):

1. HOME PAGE (/)
   File: src/app/page.tsx
   Purpose: Main landing page with latest news
   Features: Latest articles, breaking news, category navigation, search
   Components: BreakingBar, Header, SectionCards, FooterWrapper

2. ARTICLE PAGE (/article/[slug])
   File: src/app/article/[slug]/page.tsx
   Purpose: Display individual articles
   Features: Full article content, related articles, comment section
   Components: ArticleComments, RelatedArticles

3. LOGIN PAGE (/login)
   File: src/app/login/page.tsx
   Purpose: User authentication
   Features: Login form, registration form, password reset
   Components: AuthForm, AuthContext

4. REGISTER PAGE (/register)
   File: src/app/register/page.tsx
   Purpose: New user registration
   Features: Registration form, email validation, password requirements
   Components: AuthForm

PROTECTED PAGES (Login Required):

5. USER PROFILE (/profile)
   File: src/app/profile/page.tsx
   Purpose: User profile management
   Features: View/edit profile, change password, upload image, view comments
   API Calls: GET/POST /api/customer/profile, GET /api/comments?mode=user

ADMIN PAGES (Admin Role Required):

6. ADMIN DASHBOARD (/admin/dashboard)
   File: src/app/admin/dashboard/page.tsx
   Purpose: Main admin control panel
   Features: Overview statistics, quick actions, recent activity, system health
   Components: SectionCards, RecentActivity, SystemHealth

7. USER MANAGEMENT (/admin/users)
   File: src/app/admin/users/page.tsx
   Purpose: Manage all users
   Features: List users, add/edit/delete users, change roles
   API Calls: GET/POST/PUT/DELETE /api/admin/users

... (additional sections omitted for brevity)

================================================================================
5. API ENDPOINTS & DATA FLOW
================================================================================

AUTHENTICATION APIs and public/admin APIs are described in project documentation.

================================================================================
6. REAL-TIME FEATURES (Socket.io)
================================================================================

Socket server implemented at `src/app/api/socket/route.ts` with events for userRegistered, articlePublished, commentPosted, analyticsUpdate.

================================================================================
7. COMMON ERRORS & DEBUGGING
================================================================================

See the full document in project docs for common errors and debugging tips.

================================================================================
8. DEVELOPMENT WORKFLOW
================================================================================

1. Install dependencies: `npm install`
2. Setup `.env.local` with `DATABASE_URL` and `JWT_SECRET`
3. Initialize DB: `npx prisma db push` and `npx prisma generate`
4. Start dev: `npm run dev`

================================================================================
9. SECURITY & BEST PRACTICES
================================================================================

Key items: bcrypt password hashing, JWT expiration, input validation, role-based authorization, rate-limiting.

================================================================================

Happy Coding!
