# News Portal Project Documentation

## Project Overview
A comprehensive news portal built with Next.js 14, Prisma ORM, PostgreSQL, and TypeScript. Features include user authentication, role-based access control, content management, and admin/editor dashboards.

## Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **UI Components**: Custom components with shadcn/ui
- **Email**: Nodemailer (Gmail SMTP)

## Project Structure

### Root Directory Files
- `package.json` - Project dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `middleware.ts` - Authentication and route protection middleware
- `components.json` - shadcn/ui components configuration
- `postcss.config.mjs` - PostCSS configuration

### Database & Prisma
- `prisma/schema.prisma` - Database schema definition
- `prisma/migrations/` - Database migration files
- `scripts/` - Database seeding and utility scripts

### Source Code Structure (`src/`)

#### App Directory (`src/app/`)
The app directory follows Next.js 13+ App Router structure:

##### Public Pages
- `page.tsx` - Homepage with news grid
- `about/page.tsx` - About us page
- `contact/page.tsx` - Contact us page
- `privacy-policy/page.tsx` - Privacy policy
- `terms/page.tsx` - Terms of service
- `advertise/page.tsx` - Advertising information
- `careers/page.tsx` - Career opportunities

##### Category Pages
- `business/page.tsx` - Business news
- `economy/page.tsx` - Economy news
- `entertainment/page.tsx` - Entertainment news
- `health/page.tsx` - Health news
- `international/page.tsx` - International news
- `politics/page.tsx` - Politics news
- `sports/page.tsx` - Sports news
- `technology/page.tsx` - Technology news

##### User Pages
- `login/page.tsx` - User login page
- `profile/page.tsx` - User profile management
- `dashboard/page.tsx` - User dashboard

##### Article Pages
- `article/[slug]/page.tsx` - Individual article display

##### Admin Section (`src/app/admin/`)
- `layout.tsx` - Admin layout wrapper
- `page.tsx` - Admin dashboard home
- `dashboard/page.tsx` - Main admin dashboard
- `analytics/page.tsx` - Analytics dashboard
- `articles/page.tsx` - Article management
- `articles/[id]/page.tsx` - Edit specific article
- `articles/add/page.tsx` - Add new article
- `catageories/page.tsx` - Category management
- `comments/page.tsx` - Comment moderation
- `settings/page.tsx` - Site settings
- `users/page.tsx` - User management
- `users/[id]/page.tsx` - Edit specific user
- `users/add/page.tsx` - Add new user

##### Editor Section (`src/app/Editor/`)
- `layout.tsx` - Editor layout wrapper
- `login/page.tsx` - Editor login
- `dashboard/page.tsx` - Editor dashboard
- `create-article/page.tsx` - Create new article
- `edit-article/page.tsx` - Edit existing article
- `settings/page.tsx` - Editor settings

##### API Routes (`src/app/api/`)
- `route.ts` - Root API endpoint

##### Authentication APIs (`src/app/api/auth/`)
- `login/route.ts` - User login
- `register/route.ts` - User registration
- `admin/login/route.ts` - Admin login
- `editor/login/route.ts` - Editor login
- `logout/route.ts` - Logout
- `forgot-password/route.ts` - Password reset request
- `reset-password/route.ts` - Password reset confirmation

##### Admin APIs (`src/app/api/admin/`)
- `articles/route.ts` - Article CRUD operations
- `users/route.ts` - User management
- `users/[id]/route.ts` - Individual user operations
- `users/report-user/route.ts` - User reporting
- `comments/route.ts` - Comment management
- `reports/route.ts` - User report moderation
- `profile/route.ts` - Admin profile management
- `settings/route.ts` - Site settings management
- `analytics/route.ts` - Analytics data
- `pages/route.ts` - Static page management

##### Editor APIs (`src/app/api/editor/`)
- `articles/route.ts` - Editor article operations

##### Other APIs
- `articles/route.ts` - Public article fetching
- `articles/subcategories/route.ts` - Subcategory management
- `comments/route.ts` - Comment operations
- `comments/[id]/route.ts` - Individual comment operations
- `news/route.ts` - News operations
- `posts/route.ts` - Post operations
- `profile/route.ts` - User profile operations
- `customer/route.ts` - Customer operations
- `socket/route.ts` - WebSocket operations
- `test-db-connection/route.ts` - Database connection testing

##### Components (`src/app/components/`)
- `AdminNav.tsx` - Admin navigation
- `ArticleComments.tsx` - Article comment system
- `BreakingBar.tsx` - Breaking news bar
- `DatabaseChecker.tsx` - Database status checker
- `Footer.tsx` - Site footer
- `FooterWrapper.tsx` - Footer wrapper
- `Header.tsx` - Site header
- `HeroSection.tsx` - Homepage hero section
- `NewsCard.tsx` - News article card
- `NewsGrid.tsx` - News grid layout
- `Sidebar.tsx` - Site sidebar
- `ui/` - Reusable UI components

##### Editor Components (`src/app/components/editor/`)
- `EditorLayoutWrapper.tsx` - Editor layout wrapper
- `EditorSidebar.tsx` - Editor navigation sidebar
- `EditorHeader.tsx` - Editor header
- `EditorFooter.tsx` - Editor footer

##### Data
- `data/news.json` - Sample news data

### Components Directory (`src/components/`)
- `admin-dashboard-stats.tsx` - Admin dashboard statistics
- `app-sidebar.tsx` - Application sidebar
- `chart-area-interactive.tsx` - Interactive charts
- `data-table.tsx` - Data table component
- `nav-documents.tsx` - Navigation documents
- `nav-main.tsx` - Main navigation
- `nav-secondary.tsx` - Secondary navigation
- `nav-user.tsx` - User navigation
- `quick-actions.tsx` - Quick action buttons
- `recent-activity.tsx` - Recent activity feed
- `section-cards.tsx` - Section cards
- `site-header.tsx` - Site header component
- `system-health.tsx` - System health monitoring
- `ui/` - UI component library (shadcn/ui)

### Library (`src/lib/`)
- `auth.ts` - Authentication utilities
- `db.ts` - Database connection
- `error-handler.ts` - Error handling utilities
- `getSession.ts` - Session management
- `secure-logger.ts` - Secure logging
- `toast.ts` - Toast notifications
- `utils.ts` - General utilities
- `models/` - Data models
- `utils/upload.ts` - File upload utilities

### Hooks (`src/hooks/`)
- `use-mobile.ts` - Mobile detection hook
- `useFilteredArticles.ts` - Article filtering hook

### Utils (`src/utils/`)
- `database/` - Database utilities
- `seeds.ts` - Database seeding utilities
- `slugify.ts` - URL slug generation

### Tests (`tests/`)
- `app/api/comments/` - Comment API tests

### Scripts (`scripts/`)
- `add-editor.js` - Add editor user
- `check-comments-detail.js` - Check comment details
- `check-users.js` - Check user data
- `fix-example-user.js` - Fix example user
- `init-db.js` - Initialize database
- `migrate-news.js` - Migrate news data
- `reset-database.js` - Reset database
- `seed-database.js` - Seed database
- `seed-news-from-json.js` - Seed news from JSON
- `seed-news.js` - Seed news data
- `seed-users.ts` - Seed user data
- `setup-database.js` - Setup database
- `simple-seed.js` - Simple seeding
- `test-admin-dashboard.js` - Test admin dashboard
- `test-categories.js` - Test categories
- `test-comments.js` - Test comments
- `test-database.js` - Test database
- `test-login.js` - Test login
- `upsert-news.js` - Upsert news data

### Public Directory (`public/`)
- `uploads/profiles/` - User profile images
- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` - Icons

## Database Schema

### Models
- **User**: User accounts with roles (ADMIN, EDITOR, USER)
- **News**: News articles and content
- **Comment**: User comments on articles
- **CommentEdit**: Comment edit history
- **AnalyticsEvent**: Analytics tracking
- **UserReport**: User reporting system

### Roles
- **ADMIN**: Full system access
- **EDITOR**: Content management access
- **USER**: Basic user access

## Authentication System
- JWT-based authentication
- Role-based access control
- Secure password hashing with bcryptjs
- Session management with cookies
- Password reset functionality

## Key Features
1. **User Management**: Registration, login, profile management
2. **Content Management**: Article creation, editing, publishing
3. **Comment System**: User comments with moderation
4. **Admin Dashboard**: Comprehensive admin interface
5. **Editor Dashboard**: WordPress-style editor interface
6. **Analytics**: User behavior tracking
7. **Reporting System**: User reporting and moderation
8. **SEO Optimization**: Meta tags, descriptions, keywords
9. **Responsive Design**: Mobile-friendly interface
10. **Security**: Rate limiting, input validation, secure authentication

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `GMAIL_USER`: Gmail account for email sending
- `GMAIL_APP_PASSWORD`: Gmail app password
- `NEXT_PUBLIC_BASE_URL`: Base URL for the application

## Getting Started
1. Install dependencies: `npm install`
2. Setup environment variables in `.env.local`
3. Initialize database: `npx prisma db push`
4. Seed database: `node scripts/comprehensive-seed.js`
5. Start development server: `npm run dev`

## Default Login Credentials
- **Admin**: admin@newsportal.com / admin123
- **Editor**: editor@newsportal.com / editor123
- **User**: user@newsportal.com / user123

## File Naming Conventions
- Components: PascalCase (e.g., `NewsCard.tsx`)
- Pages: lowercase with hyphens (e.g., `about-us/page.tsx`)
- API routes: lowercase with hyphens (e.g., `forgot-password/route.ts`)
- Utilities: camelCase (e.g., `slugify.ts`)
- Scripts: kebab-case (e.g., `seed-database.js`)

## Development Guidelines
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Implement proper error handling
- Use Prisma for database operations
- Follow security best practices
- Write comprehensive tests
- Document all major functions
