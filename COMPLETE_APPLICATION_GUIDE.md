# Complete Application Guide - What Does What

## 🏗️ **Application Architecture Overview**

```
News Portal Application
├── Frontend (Next.js React)
├── Backend (API Routes)
├── Database (PostgreSQL/Prisma + Mock Fallback)
├── Authentication (JWT-based)
└── Admin Panel (Full CRUD)
```

---

## 📱 **Frontend Pages & Components**

### **🏠 Main Application Pages**

#### **`/` - Home Page**
- **File**: `src/app/page.tsx`
- **Purpose**: Landing page with news grid
- **Components Used**:
  - `NewsGrid` - Displays articles in grid format
  - `Header` - Navigation and user menu
  - `FooterWrapper` - Site footer
- **Functions Called**:
  - Fetches articles from `/api/articles`
  - Filters by category/subcategory
- **Related To**: Article display, navigation, user authentication status

#### **`/login` - User Login Page**
- **File**: `src/app/login/page.tsx`
- **Purpose**: User authentication interface
- **Components Used**:
  - `AuthForm` - Login/signup form component
- **Functions Called**:
  - `login()` from AuthContext
  - `/api/auth/mock-login` API call
- **Related To**: User authentication, profile access, admin access

#### **`/profile` - User Profile Page**
- **File**: `src/app/profile/page.tsx`
- **Purpose**: User profile management and editing
- **Components Used**:
  - Profile form with image upload
  - Edit/save functionality
- **Functions Called**:
  - `fetchProfile()` - Gets user data
  - `handleProfileUpdate()` - Updates user info
  - `handleImageUpload()` - Uploads profile image
- **API Endpoints Used**:
  - `GET /api/customer/mock-profile` - Fetch profile
  - `POST /api/customer/mock-profile` - Update profile
  - `POST /api/customer/change-image` - Upload image
- **Related To**: User authentication, file upload, form validation

---

### **🔐 Admin Panel Pages**

#### **`/admin` - Admin Login**
- **File**: `src/app/admin/page.tsx`
- **Purpose**: Admin authentication
- **Components Used**:
  - Admin login form
- **Functions Called**:
  - `handleSubmit()` - Processes admin login
  - `login()` from AuthContext with admin role
- **API Endpoints Used**:
  - `POST /api/auth/mock-login`
- **Related To**: Admin authentication, role-based access

#### **`/admin/dashboard` - Admin Dashboard**
- **File**: `src/app/admin/dashboard/page.tsx` → `admin-page.tsx`
- **Purpose**: Main admin control panel
- **Components Used**:
  - Statistics cards (users, articles, analytics, settings)
  - Quick actions buttons
  - Recent activity lists
- **Functions Called**:
  - `fetchDashboardData()` - Gets dashboard statistics
  - API calls to count users and articles
- **API Endpoints Used**:
  - `GET /api/admin/users` - Get user count
  - `GET /api/admin/articles` - Get article count
- **Related To**: Admin overview, navigation to CRUD operations

#### **`/admin/users` - User Management**
- **File**: `src/app/admin/users/page.tsx`
- **Purpose**: List and manage all users
- **Components Used**:
  - Users table with actions
  - Loading states
  - Error handling
- **Functions Called**:
  - `fetchUsers()` - Gets all users
  - `handleDelete()` - Deletes user with confirmation
- **API Endpoints Used**:
  - `GET /api/admin/users` - List users
  - `DELETE /api/admin/users/[id]` - Delete user
- **Related To**: User CRUD operations, admin permissions

#### **`/admin/users/add` - Add User**
- **File**: `src/app/admin/users/add/page.tsx`
- **Purpose**: Create new user
- **Components Used**:
  - User creation form
  - Role selector
  - Validation
- **Functions Called**:
  - `handleSubmit()` - Creates new user
- **API Endpoints Used**:
  - `POST /api/admin/users` - Create user
- **Related To**: User creation, form validation, admin permissions

#### **`/admin/users/[id]` - View User**
- **File**: `src/app/admin/users/[id]/page.tsx`
- **Purpose**: Display user details
- **Components Used**:
  - User detail view
  - Edit button
- **Functions Called**:
  - `fetchUser()` - Gets specific user data
- **API Endpoints Used**:
  - `GET /api/admin/users/[id]` - Get user details
- **Related To**: User viewing, navigation to edit

#### **`/admin/users/[id]/edit` - Edit User**
- **File**: `src/app/admin/users/[id]/edit/page.tsx`
- **Purpose**: Edit existing user
- **Components Used**:
  - Pre-filled user edit form
  - Role management
- **Functions Called**:
  - `fetchUser()` - Gets current user data
  - `handleSubmit()` - Updates user data
- **API Endpoints Used**:
  - `GET /api/admin/users/[id]` - Get user data
  - `PUT /api/admin/users/[id]` - Update user
- **Related To**: User modification, form validation

#### **`/admin/articles` - Article Management**
- **File**: `src/app/admin/articles/page.tsx`
- **Purpose**: List and manage all articles
- **Components Used**:
  - Articles table with metadata
  - Category badges
  - Action buttons
- **Functions Called**:
  - `fetchArticles()` - Gets all articles
  - `handleDelete()` - Deletes article with confirmation
- **API Endpoints Used**:
  - `GET /api/admin/articles` - List articles
  - `DELETE /api/admin/articles/[id]` - Delete article
- **Related To**: Article CRUD operations, content management

#### **`/admin/articles/add` - Add Article**
- **File**: `src/app/admin/articles/add/page.tsx`
- **Purpose**: Create new article
- **Components Used**:
  - Article creation form
  - Category selector
  - Content editor
  - Tags input
- **Functions Called**:
  - `handleSubmit()` - Creates new article
  - Tag processing (comma-separated to array)
- **API Endpoints Used**:
  - `POST /api/admin/articles` - Create article
- **Related To**: Content creation, form validation, tag management

#### **`/admin/articles/[id]` - View Article**
- **File**: `src/app/admin/articles/[id]/page.tsx`
- **Purpose**: Display article details
- **Components Used**:
  - Full article view
  - Metadata display
  - Tag display
  - Edit button
- **Functions Called**:
  - `fetchArticle()` - Gets specific article data
- **API Endpoints Used**:
  - `GET /api/admin/articles/[id]` - Get article details
- **Related To**: Article viewing, content preview

#### **`/admin/articles/[id]/edit` - Edit Article**
- **File**: `src/app/admin/articles/[id]/edit/page.tsx`
- **Purpose**: Edit existing article
- **Components Used**:
  - Pre-filled article edit form
  - Content editor
  - Tag management
- **Functions Called**:
  - `fetchArticle()` - Gets current article data
  - `handleSubmit()` - Updates article data
- **API Endpoints Used**:
  - `GET /api/admin/articles/[id]` - Get article data
  - `PUT /api/admin/articles/[id]` - Update article
- **Related To**: Content modification, tag processing

#### **`/admin/test` - System Testing**
- **File**: `src/app/admin/test/page.tsx`
- **Purpose**: Test all admin API endpoints
- **Components Used**:
  - Test runner interface
  - Status indicators
  - Progress tracking
- **Functions Called**:
  - `runTests()` - Executes all API tests
  - Individual test functions for each endpoint
- **API Endpoints Used**:
  - All admin and auth endpoints for testing
- **Related To**: System validation, debugging, API health checks

---

## 🔧 **Core Components**

### **🔐 Authentication System**

#### **AuthContext** (`src/app/components/ui/AuthContext.tsx`)
- **Purpose**: Global authentication state management
- **Functions Provided**:
  - `login(email, password, role)` - Authenticates user
  - `logout()` - Clears authentication
  - `forgotPassword()` - Password reset
  - `setAuthState()` - Updates auth state
- **State Managed**:
  - `isAuthenticated` - Login status
  - `username` - Current user name
  - `userRole` - User role (admin/user)
  - `token` - JWT token
- **Related To**: All authenticated pages, API calls, role-based access

#### **AuthForm** (`src/app/components/ui/AuthForm.tsx`)
- **Purpose**: Login/signup form component
- **Functions**:
  - `handleSubmit()` - Processes login/signup
  - `handleForgot()` - Handles password reset
  - `validate()` - Form validation
- **Features**:
  - Login/signup mode switching
  - Password visibility toggle
  - Form validation
- **Related To**: Authentication flow, user registration

### **🎨 UI Components**

#### **AdminSidebar** (`src/app/components/AdminSidebar.tsx`)
- **Purpose**: Admin navigation sidebar
- **Functions**:
  - `handleLogout()` - Admin logout
  - Navigation link handling
- **Features**:
  - Mobile responsive
  - User info display
  - Navigation menu
- **Related To**: Admin layout, navigation, logout

#### **Header** (`src/app/components/Header.tsx`)
- **Purpose**: Main site navigation
- **Functions**:
  - User menu handling
  - Navigation links
- **Related To**: Site navigation, user status display

#### **NewsGrid** (`src/app/components/NewsGrid.tsx`)
- **Purpose**: Display articles in grid format
- **Functions**:
  - Article fetching
  - Grid layout management
- **Related To**: Article display, homepage content

---

## 🔌 **Backend API Endpoints**

### **🔐 Authentication APIs**

#### **`POST /api/auth/mock-login`**
- **File**: `src/app/api/auth/mock-login/route.ts`
- **Purpose**: User/admin authentication
- **Function**: Validates credentials, generates JWT
- **Input**: `{ email, password }`
- **Output**: `{ user, token }`
- **Related To**: Login forms, authentication flow

#### **`POST /api/auth/register`**
- **File**: `src/app/api/auth/register/route.ts`
- **Purpose**: User registration
- **Function**: Creates new user account
- **Input**: `{ email, password, name }`
- **Output**: `{ user, token }`
- **Related To**: Signup process, user creation

#### **`POST /api/auth/verify`**
- **File**: `src/app/api/auth/verify/route.ts`
- **Purpose**: JWT token validation
- **Function**: Verifies token validity
- **Input**: `{ token }`
- **Output**: `{ user }`
- **Related To**: Protected routes, session validation

### **👥 User Management APIs**

#### **`GET /api/admin/users`**
- **File**: `src/app/api/admin/users/route.ts`
- **Purpose**: List all users
- **Function**: `GET()` - Returns paginated user list
- **Auth**: Admin required
- **Output**: `{ data: users[], pagination }`
- **Related To**: Admin user management, user table

#### **`POST /api/admin/users`**
- **File**: `src/app/api/admin/users/route.ts`
- **Purpose**: Create new user
- **Function**: `POST()` - Creates user in database
- **Auth**: Admin required
- **Input**: `{ name, email, role, contactNumber }`
- **Related To**: Admin user creation, add user form

#### **`GET /api/admin/users/[id]`**
- **File**: `src/app/api/admin/users/[id]/route.ts`
- **Purpose**: Get specific user
- **Function**: `GET()` - Returns user details
- **Auth**: Admin required
- **Output**: `{ data: user }`
- **Related To**: User detail view, edit form pre-fill

#### **`PUT /api/admin/users/[id]`**
- **File**: `src/app/api/admin/users/[id]/route.ts`
- **Purpose**: Update user
- **Function**: `PUT()` - Updates user in database
- **Auth**: Admin required
- **Input**: `{ name, email, role, contactNumber }`
- **Related To**: User editing, profile updates

#### **`DELETE /api/admin/users/[id]`**
- **File**: `src/app/api/admin/users/[id]/route.ts`
- **Purpose**: Delete user
- **Function**: `DELETE()` - Removes user from database
- **Auth**: Admin required
- **Related To**: User deletion, admin management

### **📰 Article Management APIs**

#### **`GET /api/admin/articles`**
- **File**: `src/app/api/admin/articles/route.ts`
- **Purpose**: List all articles
- **Function**: `GET()` - Returns paginated article list
- **Auth**: Admin required
- **Features**: Search, category filtering, pagination
- **Related To**: Admin article management, article table

#### **`POST /api/admin/articles`**
- **File**: `src/app/api/admin/articles/route.ts`
- **Purpose**: Create new article
- **Function**: `POST()` - Creates article in database
- **Auth**: Admin required
- **Input**: `{ title, category, author, content, tags, etc }`
- **Related To**: Article creation, add article form

#### **`GET /api/admin/articles/[id]`**
- **File**: `src/app/api/admin/articles/[id]/route.ts`
- **Purpose**: Get specific article
- **Function**: `GET()` - Returns article details
- **Auth**: Admin required
- **Output**: `{ data: article }`
- **Related To**: Article detail view, edit form pre-fill

#### **`PUT /api/admin/articles/[id]`**
- **File**: `src/app/api/admin/articles/[id]/route.ts`
- **Purpose**: Update article
- **Function**: `PUT()` - Updates article in database
- **Auth**: Admin required
- **Input**: `{ title, category, content, tags, etc }`
- **Related To**: Article editing, content updates

#### **`DELETE /api/admin/articles/[id]`**
- **File**: `src/app/api/admin/articles/[id]/route.ts`
- **Purpose**: Delete article
- **Function**: `DELETE()` - Removes article from database
- **Auth**: Admin required
- **Related To**: Article deletion, content management

### **👤 Customer Profile APIs**

#### **`GET /api/customer/mock-profile`**
- **File**: `src/app/api/customer/mock-profile/route.ts`
- **Purpose**: Get user profile
- **Function**: `GET()` - Returns user profile data
- **Auth**: User token required
- **Output**: `{ data: profile }`
- **Related To**: Profile page, user data display

#### **`POST /api/customer/mock-profile`**
- **File**: `src/app/api/customer/mock-profile/route.ts`
- **Purpose**: Update user profile
- **Function**: `POST()` - Updates user profile
- **Auth**: User token required
- **Input**: `{ name, contactNumber }`
- **Related To**: Profile editing, user updates

---

## 🗄️ **Database & Models**

### **Database Configuration**
- **Primary**: PostgreSQL with Prisma ORM
- **Fallback**: Mock data system
- **File**: `src/lib/models/prisma.ts`

### **Data Models**

#### **User Model** (`prisma/schema.prisma`)
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  role          String   @default("user")
  image         String?
  contactNumber String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```
- **Related To**: User management, authentication, profiles

#### **News Model** (`prisma/schema.prisma`)
```prisma
model News {
  id             Int      @id @default(autoincrement())
  title          String
  category       String
  subcategory    String?
  author         String
  published_date String
  image          String
  summary        String
  content        String   @db.Text
  tags          String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```
- **Related To**: Article management, content display, news grid

---

## 🔄 **Data Flow & Relationships**

### **Authentication Flow**
```
1. User visits /login
2. AuthForm component loads
3. User enters credentials
4. handleSubmit() calls login() from AuthContext
5. AuthContext calls /api/auth/mock-login
6. API validates credentials and returns JWT
7. AuthContext stores token and user data
8. User redirected to appropriate page
```

### **Admin User Management Flow**
```
1. Admin visits /admin/users
2. Page calls fetchUsers()
3. fetchUsers() calls GET /api/admin/users
4. API returns user list with pagination
5. Table displays users with action buttons
6. Admin clicks "Add" → /admin/users/add
7. Form submits to POST /api/admin/users
8. New user created and list refreshed
```

### **Article Management Flow**
```
1. Admin visits /admin/articles
2. Page calls fetchArticles()
3. fetchArticles() calls GET /api/admin/articles
4. API returns article list with metadata
5. Table displays articles with categories/tags
6. Admin clicks "Edit" → /admin/articles/[id]/edit
7. Edit page fetches current data
8. Form submits to PUT /api/admin/articles/[id]
9. Article updated and user redirected
```

### **Profile Management Flow**
```
1. User visits /profile (after login)
2. Page calls fetchProfile()
3. fetchProfile() calls GET /api/customer/mock-profile
4. API validates JWT and returns profile data
5. Profile displays with edit capabilities
6. User modifies data and submits
7. handleProfileUpdate() calls POST /api/customer/mock-profile
8. Profile updated and success message shown
```

---

## 🛡️ **Security & Authentication**

### **JWT Token Flow**
1. **Generation**: `signJWT()` in `src/lib/auth.ts`
2. **Storage**: localStorage in browser
3. **Validation**: `verifyJWT()` for all protected routes
4. **Usage**: Authorization header in API calls

### **Role-Based Access Control**
- **User Role**: Access to profile, regular features
- **Admin Role**: Access to admin panel + all CRUD operations
- **Editor Role**: Access to admin panel (same as admin currently)

### **Protected Routes**
- **Admin Pages**: Require admin/editor role
- **Profile Page**: Require any authenticated user
- **API Endpoints**: JWT validation on all admin endpoints

---

## 📱 **UI/UX Components & Features**

### **Loading States**
- **Components**: Loader2 from lucide-react
- **Usage**: All API calls show loading spinners
- **Files**: All page components with async operations

### **Error Handling**
- **Toast System**: `src/lib/toast.ts`
- **Error States**: Try-catch blocks in all API calls
- **User Feedback**: Success/error messages for all operations

### **Form Validation**
- **Client-side**: Input validation in forms
- **Server-side**: API endpoint validation
- **Features**: Required fields, email format, password length

### **Responsive Design**
- **Mobile**: Sidebar navigation, responsive tables
- **Desktop**: Full layout with sidebar
- **Breakpoints**: Tailwind CSS responsive classes

---

## 🔧 **Utility Functions & Helpers**

### **Authentication Helpers** (`src/lib/auth.ts`)
- `signJWT()` - Creates JWT tokens
- `verifyJWT()` - Validates JWT tokens
- `parseJWT()` - Parses JWT payload

### **Database Helpers** (`src/lib/models/`)
- `prisma.ts` - Prisma client instance
- `article.ts` - Article CRUD functions
- `db.ts` - Database connection utilities

### **Toast System** (`src/lib/toast.ts`)
- `toast.success()` - Success notifications
- `toast.error()` - Error notifications
- `toast.info()` - Info notifications

---

## 📋 **Complete Feature Matrix**

| Feature | Frontend Page | API Endpoint | Database Model | Related Components |
|---------|---------------|--------------|----------------|-------------------|
| **User Login** | `/login` | `POST /api/auth/mock-login` | User | AuthForm, AuthContext |
| **User Profile** | `/profile` | `GET/POST /api/customer/mock-profile` | User | Profile component |
| **Admin Login** | `/admin` | `POST /api/auth/mock-login` | User | Admin login form |
| **User Management** | `/admin/users/*` | `/api/admin/users/*` | User | Admin tables, forms |
| **Article Management** | `/admin/articles/*` | `/api/admin/articles/*` | News | Admin tables, forms |
| **Dashboard** | `/admin/dashboard` | Multiple APIs | User, News | Statistics, quick actions |
| **Article Display** | `/` | `GET /api/articles` | News | NewsGrid, Header |

This guide shows exactly what each component does, what functions it calls, what APIs it connects to, and how everything relates together in the complete application!