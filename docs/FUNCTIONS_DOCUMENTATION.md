# Functions Documentation

This guide provides comprehensive documentation for all critical functions in the News Portal application, including authentication, user management, and API controllers.

## Table of Contents

1. [Authentication Functions](#authentication-functions)
   - [Login Function](#login-function)
   - [Register Function](#register-function)
   - [Auth Utilities](#auth-utilities)
2. [Admin User Management](#admin-user-management)
3. [Middleware Functions](#middleware-functions)
4. [API Response Format](#api-response-format)
5. [Error Handling Integration](#error-handling-integration)

---

## Authentication Functions

### Login Function

**File:** `src/app/api/auth/login/route.ts`

**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticates a user and returns JWT tokens with httpOnly cookies

#### Function Signature

```typescript
export async function POST(request: NextRequest): Promise<NextResponse>
```

**What This Means (Simple Terms):**
- `async function POST` = When someone sends login data to this endpoint, this function runs
- `request: NextRequest` = The login information sent by the user (email, password)
- `Promise<NextResponse>` = This function returns an answer (success or error) to the user

#### Request Body

When a user wants to login, they send this data:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**What These Fields Mean:**
- `email` = The user's registered email address
- `password` = The user's password (plain text from form, will be checked against hashed version)

#### Input Validation

**Simple Explanation:** Before doing anything, check if the email and password are valid and properly formatted.

Uses Zod schema validation:

```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
```

**Validation Rules (In Simple Terms):**
- `email`: Must be a valid email format (has @, domain, etc.)
  - ✅ Valid: user@example.com
  - ❌ Invalid: useremail, @example.com
- `password`: Must have at least 1 character (can't be empty)
  - ✅ Valid: any password with characters
  - ❌ Invalid: (empty field)

#### Complete Workflow

Let me explain what happens step by step when someone tries to login:

```
STEP 1: Request Received
├─ User's browser sends email and password
├─ Server receives the request
└─ Function checks: "Is this data in the right format?"

STEP 2: Validation Check
├─ Is email a real email format? (has @, domain)
├─ Is password provided (not empty)?
└─ If NO → Send error message "Invalid input", stop here (HTTP 400)

STEP 3: Database Query (Looking for the user)
├─ Search database for user with this email
├─ Convert email to lowercase (user@example.com = USER@EXAMPLE.COM in comparison)
└─ If user not found → Send error "Invalid email or password", stop here (HTTP 401)

STEP 4: Password Check
├─ Get the password stored in database (hashed/encrypted)
├─ Compare user's password with stored password using bcryptjs
├─ Passwords match? → Continue
└─ Passwords don't match? → Send error "Invalid email or password", stop here (HTTP 401)

STEP 5: Create Tokens (Security Passes)
├─ Create Access Token (15 minute pass - for immediate access)
│  └─ Contains: user ID, email, name, role
├─ Create Refresh Token (7 day pass - to get new access token later)
│  └─ Contains: same user info as access token
└─ Both tokens are cryptographically signed (so they can't be forged)

STEP 6: Create Response & Set Cookies
├─ Prepare response JSON with user information
├─ Set "auth-token" cookie (15 min, httpOnly, secure)
│  └─ Browser stores this automatically
├─ Set "refresh-token" cookie (7 days, httpOnly, secure)
│  └─ Browser stores this automatically
└─ httpOnly means: JavaScript can't access it (only HTTP requests can)

STEP 7: Send Response Back
├─ Send success message to user
├─ Include user data (ID, email, name, role)
└─ Cookies are automatically sent with every future request
```

**In One Sentence:**
Login checks if email/password are correct, creates two security tokens, stores them in cookies, and tells the browser "this user is logged in".

#### Code Implementation

Here's the complete login code with detailed explanations:

```typescript
export async function POST(request: NextRequest) {
  try {
    // ===== STEP 1: GET DATA FROM USER =====
    // Extract the data sent by user (email, password)
    const body = await request.json();
    
    // ===== STEP 2: VALIDATE INPUT =====
    // Check if email is valid format and password is provided
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      // Data is invalid - tell user what's wrong
      return NextResponse.json(
        { 
          success: false,                           // Operation failed
          error: 'Invalid input data',              // Why it failed
          details: validationResult.error.issues    // What was wrong (each field)
        },
        { status: 400 }  // HTTP 400 = Bad Request
      );
    }

    // Data is valid - extract email and password
    const { email, password } = validationResult.data;

    // ===== STEP 3: FIND USER IN DATABASE =====
    // Search database for user with this email
    // .toLowerCase() = convert to lowercase (so "User@Example.com" = "user@example.com")
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // ===== STEP 4: CHECK IF USER EXISTS & PASSWORD IS CORRECT =====
    // Three conditions that would cause login to fail:
    // 1. User doesn't exist (!user)
    // 2. User has no password (!user.password) - shouldn't happen normally
    // 3. Password doesn't match the stored hashed password
    if (!user || !user.password || 
        !(await bcrypt.compare(password, user.password))) {
      
      // Don't tell which one is wrong (security best practice)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }  // HTTP 401 = Unauthorized
      );
    }

    // ===== STEP 5: CREATE JWT TOKENS =====
    // Prepare user information that will be inside the token
    const tokenPayload = {
      id: user.id,                    // User's unique ID
      email: user.email,              // User's email
      name: user.name ?? undefined,   // User's name (or undefined if no name)
      role: user.role,                // User's role (ADMIN, EDITOR, USER)
      image: user.image ?? undefined, // User's profile image (or undefined)
    };

    // Create two tokens:
    // 1. accessToken - expires in 15 minutes (for normal use)
    // 2. refreshToken - expires in 7 days (to get new access token when it expires)
    const accessToken = signJWT(tokenPayload, ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = signJWT(tokenPayload, REFRESH_TOKEN_EXPIRES_IN);

    // ===== STEP 6: CREATE RESPONSE =====
    // Prepare the data to send back to user
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });

    // ===== STEP 7: SET COOKIES =====
    // Store tokens in browser cookies (browser sends them automatically with every request)
    
    // Cookie 1: auth-token (access token)
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,                                      // JS can't access (security)
      secure: process.env.NODE_ENV === 'production',      // Only send over HTTPS
      sameSite: 'strict',                                 // Don't send on cross-site requests
      maxAge: 15 * 60,                                    // Expires in 15 minutes
      path: '/',                                          // Available on all paths
    });

    // Cookie 2: refresh-token (refresh token)
    response.cookies.set('refresh-token', refreshToken, {
      httpOnly: true,                                      // JS can't access (security)
      secure: process.env.NODE_ENV === 'production',      // Only send over HTTPS
      sameSite: 'strict',                                 // Don't send on cross-site requests
      maxAge: 7 * 24 * 60 * 60,                           // Expires in 7 days
      path: '/',                                          // Available on all paths
    });

    // ===== STEP 8: SEND RESPONSE =====
    return response;

  } catch (error) {
    // If anything goes wrong (database error, etc.)
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error,              // The actual error
        msg: 'Internal server error' // Friendly message
      },
      { status: 500 }  // HTTP 500 = Server Error
    );
  }
}
```

**Key Concepts Explained:**

**What is bcryptjs?**
- Password hashing library
- When user creates account, password is hashed (converted to unreadable format)
- When user logs in, we hash their password and compare with stored hash
- Why? Even if database is hacked, passwords are still safe (can't be reversed)

**What is a JWT Token?**
- "JSON Web Token" - a secure credential
- Format: `header.payload.signature`
- Payload contains user info (id, email, role)
- Signature proves token wasn't tampered with
- Can't be faked without the secret key (JWT_SECRET)

**What are httpOnly Cookies?**
- `httpOnly: true` = JavaScript can't read the cookie
- Protects against XSS attacks (if hacker injects code, they can't steal the token)
- Browser automatically includes cookie in every HTTP request
- Server can read the cookie to verify user is logged in

**What is sameSite='strict'?**
- Protects against CSRF attacks (Cross-Site Request Forgery)
- Cookie only sent when request comes from same website
- Prevents other websites from making requests using your cookie

#### Success Response (HTTP 200)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123abc",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Cookies Set:**
- `auth-token`: JWT access token (httpOnly, expires in 15 minutes)
- `refresh-token`: JWT refresh token (httpOnly, expires in 7 days)

#### Error Responses

**400 - Invalid Input:**
```json
{
  "success": false,
  "error": "Invalid input data",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "msg": "Internal server error"
}
```

#### HTTP Status Codes Used

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Login successful |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Invalid credentials |
| 500 | Server Error | Database/processing error |

#### Client-Side Usage

```typescript
// In React components using useAuth hook
const { login } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies
    });

    const data = await response.json();
    
    if (data.success) {
      // Cookies are automatically set by browser
      // User can now access protected routes
      router.push('/dashboard');
    } else {
      showError(data.error);
    }
  } catch (error) {
    showError('Login failed');
  }
};
```

#### Key Implementation Details

**Security Features:**
- ✅ Passwords hashed with bcryptjs before comparison
- ✅ httpOnly cookies prevent XSS attacks
- ✅ sameSite='strict' prevents CSRF attacks
- ✅ Tokens expire automatically
- ✅ Email validation with Zod
- ✅ Case-insensitive email lookup

**Important Fixes:**
- Cookie name changed from `authToken` to `auth-token` to match middleware expectations
- Token payload includes user ID, email, name, and role for authorization checks
- Refresh tokens issued with 7-day expiry for session extension

---

### Register Function

**File:** `src/app/api/auth/register/route.ts`

**Endpoint:** `POST /api/auth/register`

**Purpose:** Creates a new user account with hashed password

#### Function Signature

```typescript
export async function POST(request: NextRequest): Promise<NextResponse>
```

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "contactNumber": "+1234567890"
}
```

#### Input Validation

```typescript
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  contactNumber: z.string().optional(),
});
```

**Validation Rules:**
- `name`: 2-50 characters
- `email`: Valid email format, must be unique
- `password`: Minimum 8 characters
- `contactNumber`: Optional

#### Workflow

```
1. Input Validation
   └─ Validate using Zod schema
   
2. Duplicate Check
   ├─ Query database for existing email
   └─ Return 409 if exists
   
3. Password Hashing
   ├─ Hash password with bcryptjs (salt rounds: 10)
   └─ Never store plain text
   
4. User Creation
   ├─ Create user in database
   ├─ Set default role to 'USER'
   └─ Assign unique ID
   
5. Success Response
   └─ Return created user (password excluded)
```

#### Success Response (HTTP 200)

```json
{
  "success": true,
  "message": "Registration successful. Please login to continue.",
  "data": {
    "user": {
      "id": "user_456def",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

#### Error Responses

**409 - Email Already Exists:**
```json
{
  "success": false,
  "error": "A user with this email already exists."
}
```

**Important:** Registration does NOT issue tokens. User must login separately.

---

### Auth Utilities

**File:** `src/lib/auth.ts`

These functions handle JWT token operations and are used throughout the authentication system.

#### `getAuthToken(request: any): string | null`

**What This Function Does (Simple):**
Finds and returns the JWT token from the user's request. It looks in 3 places:
1. **Cookies** - First choice (safest)
2. **Authorization header** - Second choice (API apps use this)
3. **Manual cookie parsing** - Last resort fallback

**Why We Need It:**
Every time a user makes a request, we need to verify "who is this person?". To do that, we need to find their JWT token first.

**Step-by-Step Explanation:**

```typescript
export function getAuthToken(request: any): string | null {
  // ===== METHOD 1: FROM COOKIES =====
  // Check if request has cookies object (NextRequest API)
  // Look for 'auth-token' cookie (standard Next.js cookie access)
  if (request.cookies) {
    const token = request.cookies.get('auth-token')?.value;
    if (token) return token;  // Found token in cookie!
  }

  // ===== METHOD 2: FROM AUTHORIZATION HEADER =====
  // Some clients (mobile apps, API clients) send token in header like:
  // "Authorization: Bearer eyJhbGci..."
  const authHeader = request.headers?.get?.('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);  // Remove "Bearer " prefix, return just the token
  }

  // ===== METHOD 3: MANUAL COOKIE PARSING =====
  // Fallback: Parse cookies manually from Cookie header
  // Format: "auth-token=xyz; session=abc; other=def"
  const cookieHeader = request.headers?.get?.('Cookie');
  if (cookieHeader) {
    // Convert string "a=b; c=d" to object {a: b, c: d}
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );
    return cookies['auth-token'] || null;  // Get auth-token if exists
  }

  // No token found anywhere
  return null;
}
```

**Returns:**
- ✅ `"eyJhbGci..."` - Token string if found
- ❌ `null` - If no token anywhere

**Real-World Example:**

```typescript
// When API route receives request:
const token = getAuthToken(request);

if (!token) {
  // User didn't send their token - they're not logged in
  return NextResponse.json(
    { error: 'Please login first' },
    { status: 401 }
  );
}

// Now we can verify the token to see who this user is
const validation = verifyJWT(token);
```

**Why 3 Methods?**
- Method 1 = Normal web browsers (most common)
- Method 2 = Mobile apps, external APIs
- Method 3 = Compatibility/fallback for edge cases

---

#### `signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string): string`

**What This Function Does (Simple):**
Creates a new security token (JWT) with user information inside it. This token proves "this is who I am" without needing to ask the server every time.

**Why We Need It:**
Tokens are like ID cards. Once you have a valid ID card, you don't need to provide your birth certificate every single time you need to prove who you are.

**Parameters Explained:**

```typescript
// Parameter 1: payload = User information to put in the token
const payload = {
  id: user.id,          // Unique user ID (like "user_123")
  email: user.email,    // User's email
  name: user.name,      // User's name
  role: user.role,      // User's role (ADMIN, EDITOR, USER)
  image: user.image     // User's profile picture
};

// Parameter 2: expiresIn = How long token lasts
// Examples:
// '15m' = 15 minutes
// '7d' = 7 days
// '24h' = 24 hours
```

**How JWT Works (Simple Explanation):**

```
JWT = Header.Payload.Signature

Example: eyJhbGc.eyJpZCI6.kY0xT5A

1. Header (eyJhbGc)
   └─ Says "I'm a JWT, use HS256 algorithm"

2. Payload (eyJpZCI6)
   └─ Contains user info (id, email, role) - visible but not changeable

3. Signature (kY0xT5A)
   └─ Proves this token is real, created by this server
   └─ Created using secret key (JWT_SECRET) - only server knows it
   └─ If someone changes the payload, signature won't match anymore!
```

**Complete Code with Explanations:**

```typescript
export function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>, 
  expiresIn: string
): string {
  // ===== SECURITY CHECK =====
  // Make sure JWT_SECRET is set and long enough (minimum 64 characters)
  // Short secrets are easy to hack
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64) {
    throw new Error('Invalid JWT configuration');
  }

  // ===== CREATE AND SIGN TOKEN =====
  // jwt.sign() creates a new token with the given payload and signs it
  const token = jwt.sign(
    payload,                          // User info to put in token
    process.env.JWT_SECRET,           // Secret key used to sign (only server knows)
    {
      algorithm: 'HS256',             // How to sign: HS256 = HMAC with SHA-256
      expiresIn: expiresIn,           // Token lifetime ('15m', '7d', etc.)
      issuer: 'news-portal',          // Who created this token (for verification)
      audience: 'news-portal-users',  // Who should use this token (for verification)
    }
  );

  return token;  // Return the signed token
}
```

**Security Features Explained:**

| Feature | What It Does | Why It Matters |
|---------|-------------|-----------------|
| `HS256` | Algorithm to create signature | Standard, secure method |
| `JWT_SECRET` | Secret key to sign token | Only server knows it - prevents forgery |
| `expiresIn` | Token automatically expires | If token is stolen, it won't work forever |
| `issuer` | Server identification | Only accept tokens from trusted source |
| `audience` | Intended recipient | Token can't be used for wrong purpose |

**Returns:**
- ✅ `"eyJhbGciOiJIUzI1NiIs..."` - Signed JWT token string

**Real-World Example:**

```typescript
// When user logs in successfully:
const tokenPayload = {
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
};

// Create token that lasts 15 minutes
const accessToken = signJWT(tokenPayload, '15m');
// Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXJfMTIzIn0.kY0xT5A"

// Create token that lasts 7 days (for getting new access token)
const refreshToken = signJWT(tokenPayload, '7d');

// Store in cookies and send to user
response.cookies.set('auth-token', accessToken);
response.cookies.set('refresh-token', refreshToken);
```

**What Happens After Token Is Created:**
1. User's browser stores token in cookie
2. Browser sends token with every request automatically
3. Server verifies token is real (using verifyJWT)
4. If valid, server knows who the user is
5. If expired, ask user to login again or use refresh token

---

#### `verifyJWT(token: string): TokenValidationResult`

**What This Function Does (Simple):**
Checks if a token is real and hasn't expired. It's like checking if someone's ID card is genuine and still valid.

**Why We Need It:**
Before trusting user data from a token, we must verify:
- ✅ Token wasn't tampered with (signature is real)
- ✅ Token hasn't expired yet (still valid)
- ✅ Token came from the right source (issued by us)

**Return Type (What It Gives Back):**

```typescript
interface TokenValidationResult {
  isValid: boolean;        // true if token is good, false if bad
  payload?: JWTPayload;    // User info inside token (if valid)
  error?: string;          // Error message if invalid
  errorType?: 'expired' | 'invalid';  // What went wrong
}
```

**Complete Code with Explanations:**

```typescript
export function verifyJWT(token: string): TokenValidationResult {
  try {
    // ===== STEP 1: CHECK TOKEN FORMAT =====
    // First make sure token looks like a real JWT (has 3 parts separated by dots)
    if (!isValidTokenFormat(token)) {
      return { isValid: false, error: 'Invalid token format' };
    }

    // ===== STEP 2: VERIFY AND DECODE TOKEN =====
    // jwt.verify() does all the magic:
    // - Checks signature matches (using JWT_SECRET)
    // - Checks token hasn't expired
    // - Checks issuer is 'news-portal'
    // - Checks audience is 'news-portal-users'
    const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
      algorithms: ['HS256'],           // Only accept HS256 signed tokens
      issuer: 'news-portal',           // Token must be from this issuer
      audience: 'news-portal-users',   // Token must be for this audience
    }) as JWTPayload;

    // ===== STEP 3: TOKEN IS VALID =====
    return { 
      isValid: true, 
      payload: decoded  // Return the user info inside token
    };

  } catch (error) {
    // ===== ERROR HANDLING =====
    
    // Error Type 1: Token expired
    if (error instanceof jwt.TokenExpiredError) {
      return { 
        isValid: false, 
        error: 'Token expired',           // What happened
        errorType: 'expired'              // Error category
      };
    }
    
    // Error Type 2: Token invalid (tampered with, wrong signature, etc.)
    if (error instanceof jwt.JsonWebTokenError) {
      return { 
        isValid: false, 
        error: 'Invalid token',           // What happened
        errorType: 'invalid'              // Error category
      };
    }
    
    // Error Type 3: Something else went wrong
    return { 
      isValid: false, 
      error: 'Token verification failed',
      errorType: 'invalid' 
    };
  }
}
```

**What Happens During Verification:**

```
Input: "eyJhbGciOiJIUzI1NiIs...kY0xT5A"

Step 1: Split into 3 parts
├─ Header: eyJhbGciOiJIUzI1NiIs
├─ Payload: eyJpZCI6InVzZXJfMTIzIn0
└─ Signature: kY0xT5A

Step 2: Recreate signature
├─ Use JWT_SECRET (server secret) 
├─ Hash header + payload
└─ Compare with provided signature

Step 3: Check if signatures match
├─ ✅ Match? → Token is real, not tampered
└─ ❌ Don't match? → Someone changed the payload, REJECT

Step 4: Check expiration
├─ ✅ Expiration date in future? → Token still valid
└─ ❌ Expiration date in past? → Token expired, REJECT

Step 5: Return result
├─ All checks passed? → Return user info
└─ Any check failed? → Return error
```

**Returns:**

**Success Case:**
```typescript
{
  isValid: true,
  payload: {
    id: "user_123",
    email: "user@example.com",
    name: "John Doe",
    role: "ADMIN"
  }
}
```

**Expired Token Case:**
```typescript
{
  isValid: false,
  error: "Token expired",
  errorType: "expired"
}
```

**Invalid/Tampered Token Case:**
```typescript
{
  isValid: false,
  error: "Invalid token",
  errorType: "invalid"
}
```

**Real-World Example:**

```typescript
// When user makes request with token in cookie:
const token = getAuthToken(request);
const validation = verifyJWT(token);

if (!validation.isValid) {
  // Token is bad - send them back to login
  if (validation.errorType === 'expired') {
    // Try to refresh token
    return NextResponse.json({ error: 'Token expired' }, { status: 401 });
  } else {
    // Token is tampered or invalid
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// Token is valid! Use the user info
const user = validation.payload;
console.log(`Request from: ${user.email} (role: ${user.role})`);
```

**Why Token Can't Be Forged:**

```
Hacker tries to change payload:

Original:  { id: "user_123", role: "USER" }
Hacker:    { id: "user_123", role: "ADMIN" }

But hacker doesn't know JWT_SECRET!

Original Signature (server created):
  hash(header + payload + "secret123") = "abc123"

Hacker's Signature (they guessed):
  hash(header + newpayload + "wrong") = "xyz789"

When server verifies:
  hash(header + newpayload + "secret123") ≠ "xyz789"
  
REJECTED! Token was tampered with!
```

---

#### `parseJWT(token: string): JWTPayload | null`

**What This Function Does (Simple):**
Reads user info from a token WITHOUT checking if it's real or expired. Like reading someone's ID card without checking if it's fake.

**⚠️ IMPORTANT WARNING:**
This function does NOT verify the signature! Only use it when:
- You KNOW the token is untrustworthy
- You just need basic info (not for authorization)
- You're in non-critical code paths

**Common Use Cases:**
- Extracting user ID from an expired token to initiate refresh
- Reading user info for logging purposes
- Non-security-critical operations

**Never Use For:**
- ❌ Verifying user is who they claim
- ❌ Checking permissions
- ❌ Authorizing requests
- ❌ Security-critical decisions

**How It Works:**

```typescript
export function parseJWT(token: string): JWTPayload | null {
  try {
    // ===== STEP 1: SPLIT TOKEN INTO PARTS =====
    // JWT format: header.payload.signature
    const parts = token.split('.');
    
    // ===== STEP 2: CHECK TOKEN HAS 3 PARTS =====
    // If it doesn't, it's not a valid JWT format
    if (parts.length !== 3) return null;

    // ===== STEP 3: EXTRACT PAYLOAD PART =====
    // Get the middle part (index 1)
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    // buffer.from = convert base64 to readable text
    // base64url = special encoding used by JWT
    // .toString('utf8') = convert bytes to text
    
    // ===== STEP 4: CONVERT TO JAVASCRIPT OBJECT =====
    // Payload is JSON text like: '{"id":"user_123","email":"user@example.com"}'
    // Parse it into a JavaScript object
    const parsed = JSON.parse(payload);

    // ===== STEP 5: VALIDATE REQUIRED FIELDS =====
    // Check that essential user fields exist
    if (!parsed.id || !parsed.email || !parsed.role) return null;

    // ===== STEP 6: RETURN USER INFO =====
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,        // Might not exist
      role: parsed.role,
    };
    
  } catch (error) {
    // If anything goes wrong (bad format, invalid JSON, etc.)
    return null;
  }
}
```

**Returns:**
- ✅ `{ id: "user_123", email: "...", role: "USER", name: "..." }` - User info if successful
- ❌ `null` - If token format is invalid

**Real-World Example:**

```typescript
// Token just expired - need to refresh it
const expiredToken = getAuthToken(request);

// verifyJWT() would reject it
const verification = verifyJWT(expiredToken);
if (verification.errorType === 'expired') {
  // But we can still read who it's for to refresh
  const userInfo = parseJWT(expiredToken);
  if (userInfo) {
    // Get new token for this user
    const newToken = signJWT(userInfo, '15m');
    // Issue new token...
  }
}
```

---

#### `isValidTokenFormat(token: unknown): token is string`

**What This Function Does (Simple):**
Checks if something looks like a JWT token before we try to use it. It's a safety check.

**Why We Need It:**
Prevents errors when code tries to process random data as a JWT. It checks:
1. Is it a text string?
2. Does it have exactly 3 parts separated by dots?
3. Is each part non-empty?

**Code:**

```typescript
export function isValidTokenFormat(token: unknown): token is string {
  // ===== CHECK 1: IS IT A STRING? =====
  // token must be text, not a number, object, null, etc.
  
  // ===== CHECK 2: DOES IT HAVE 3 PARTS? =====
  // token.split('.') splits "header.payload.signature" into array [header, payload, signature]
  // Should have exactly 3 parts
  
  // ===== CHECK 3: ARE ALL PARTS NON-EMPTY? =====
  // every(part => part.length > 0) checks each part has characters
  // Empty parts like "header..signature" are invalid
  
  return (
    typeof token === 'string' &&                           // Is string?
    token.split('.').length === 3 &&                       // Has 3 parts?
    token.split('.').every(part => part.length > 0)        // All non-empty?
  );
}
```

**Returns:**
- ✅ `true` - Input looks like a valid JWT format
- ❌ `false` - Input is not a valid JWT format

**Examples:**

```typescript
isValidTokenFormat('eyJhbGc.eyJpZCI.kY0xT5A')      // ✅ true - Valid format
isValidTokenFormat('eyJhbGc.eyJpZCI')              // ❌ false - Only 2 parts
isValidTokenFormat('eyJhbGc..kY0xT5A')             // ❌ false - Empty middle part
isValidTokenFormat('not-a-token')                  // ❌ false - No dots
isValidTokenFormat(12345)                          // ❌ false - Not a string
isValidTokenFormat(null)                           // ❌ false - Not a string
```

---

#### `extractNameFromEmail(email: string): string`

**What This Function Does (Simple):**
Converts an email address into a display name. Useful when user hasn't set their name yet.

**Process:**
1. Take the part before @ in email
2. Replace special characters with spaces
3. Make first letter uppercase, rest lowercase
4. Return "Guest" if anything goes wrong

**Code:**

```typescript
export function extractNameFromEmail(email: string): string {
  // ===== SAFETY CHECK =====
  // Make sure email exists and is text
  if (!email || typeof email !== 'string') return "Guest";
  
  try {
    // ===== EXTRACT USERNAME PART =====
    // "john.doe@example.com" → ["john.doe", "example.com"]
    // Get first part (before @)
    const [username] = email.split("@");
    if (!username) return "Guest";

    // ===== CLEAN UP USERNAME =====
    // Replace dots, underscores, hyphens with spaces
    // "john.doe" → "john doe"
    // "user_123" → "user 123"
    const sanitized = username.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    
    // ===== CAPITALIZE FIRST LETTER =====
    // "john doe" → "John doe"
    return sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();
    
  } catch {
    // If anything breaks, return safe default
    return "Guest";
  }
}
```

**Returns:**
- Display name string (or "Guest" if error)

**Examples:**

```typescript
extractNameFromEmail('john.doe@example.com')    // "John doe"
extractNameFromEmail('user+tag@domain.com')     // "User tag"
extractNameFromEmail('firstname_last@mail.com') // "Firstname last"
extractNameFromEmail('invalid')                 // "Guest" (no @)
extractNameFromEmail(null)                      // "Guest" (not string)
extractNameFromEmail('')                        // "Guest" (empty)
```

**Real-World Use Case:**

```typescript
// When user registers without entering name:
const newUser = await prisma.user.create({
  data: {
    email: 'john.doe@example.com',
    name: extractNameFromEmail('john.doe@example.com'),  // "John doe"
    password: hashedPassword,
    role: 'USER',
  }
});

// Now user has a display name automatically!
```

---

## Admin User Management

### Admin Access Verification

**File:** `src/app/api/admin/users/route.ts`

**Helper Function:** `verifyAdminAccess(request: Request)`

**What This Function Does (Simple):**
Verifies that the person making a request is really an admin (not a normal user pretending to be admin).

**Why We Need It:**
If we don't check, anyone could:
- Delete user accounts
- Change someone's role to admin
- Access secret admin data
- Break the whole site

**Two Verification Methods:**

**Method 1 - Via Middleware Headers (Fastest):**
- Middleware already checked and added headers: `x-user-id`, `x-user-role`, etc.
- We can trust these headers (middleware verified JWT already)
- This is the quickest check

**Method 2 - Via JWT Token (Backup):**
- If headers aren't present, verify JWT directly
- Extract token from cookies or Authorization header
- Verify token signature (using verifyJWT)
- Check that role is 'ADMIN'
- Verify user still exists in database

**Complete Code with Explanations:**

```typescript
async function verifyAdminAccess(
  request: Request
): Promise<{ user?: JWTPayload; error?: string; status?: number }> {
  
  // ===== METHOD 1: CHECK MIDDLEWARE HEADERS =====
  // Middleware already verified the JWT and added these headers
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  if (userId && userRole) {
    // Headers are present - middleware already checked
    if (userRole !== 'ADMIN') {
      // User exists but is not admin
      return { 
        error: "Admin access required",  // Tell them "no"
        status: 403                      // HTTP 403 = Forbidden
      };
    }
    
    // User is admin! Extract their info from headers
    const user: JWTPayload = {
      id: userId,
      email: request.headers.get("x-user-email") || '',
      name: request.headers.get("x-user-name") || undefined,
      role: 'ADMIN',
    };
    
    return { user };  // Success!
  }

  // ===== METHOD 2: FALLBACK - VERIFY JWT DIRECTLY =====
  // Headers not found, try to verify token directly
  
  const token = getAuthToken(request);
  if (!token) {
    // No token anywhere - user not logged in
    return { 
      error: "No authentication token found",
      status: 401  // HTTP 401 = Unauthorized
    };
  }

  // Verify the token is real and not expired
  const validation = verifyJWT(token);
  if (!validation.isValid || !validation.payload) {
    // Token is invalid or expired
    return { 
      error: validation.error || "Invalid or expired token",
      status: 401
    };
  }

  // Check if token says user is admin
  if (validation.payload.role !== 'ADMIN') {
    return { 
      error: "Admin access required",
      status: 403 
    };
  }

  // ===== METHOD 2b: VERIFY IN DATABASE =====
  // Double-check: User still exists and still has admin role
  // (Handles case where admin was demoted but their old token still exists)
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: validation.payload.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      // User doesn't exist or is no longer admin
      return { 
        error: "Admin access required",
        status: 403 
      };
    }

    return { user: validation.payload };

  } catch (error) {
    console.error('Error verifying user:', error);
    return { 
      error: "Failed to verify user",
      status: 500  // HTTP 500 = Server Error
    };
  }
}
```

**Returns:**

**Success - Admin Verified:**
```typescript
{
  user: {
    id: "admin_123",
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN"
  }
}
```

**Error - Not Authenticated:**
```typescript
{
  error: "No authentication token found",
  status: 401  // HTTP 401 = Not logged in
}
```

**Error - Not Admin:**
```typescript
{
  error: "Admin access required",
  status: 403  // HTTP 403 = Logged in but not admin
}
```

**Real-World Example:**

```typescript
// When admin tries to get list of users:
const authCheck = await verifyAdminAccess(request);

if (authCheck.error) {
  // Verification failed - tell them why
  return NextResponse.json(
    { success: false, error: authCheck.error },
    { status: authCheck.status }
  );
}

// Verification passed - authCheck.user contains admin info
const adminUser = authCheck.user;
console.log(`Request from admin: ${adminUser.email}`);

// Now safe to fetch all users
const users = await prisma.user.findMany();
```

**Why 3-Step Verification?**

| Step | What It Checks | Why It's Important |
|------|----------------|-------------------|
| JWT Signature | Token wasn't faked | Prevents forgery |
| Role Check | Person is actually admin | Prevents unauthorized access |
| Database Check | User still has admin status | Handles role changes in real-time |

---

### GET /api/admin/users - List Users

**What This Does (Simple):**
Admin requests a list of all users, with options to:
- Show specific page (pagination)
- Show how many per page
- Search by name or email

**When It's Used:**
Admin opens user management page → API fetches and shows all users

**Required Permission:** Admin role

#### Query Parameters (URL Options)

When admin calls `/api/admin/users?page=2&limit=20&search=john`:

```
page=2        → Show page 2 (second set of results)
limit=20      → Show 20 users per page
search=john   → Only show users with name or email containing "john"
```

**Default Values:**
- If no page specified → page 1
- If no limit specified → 10 users per page
- If no search specified → show all users

#### Step-by-Step Explanation

```
STEP 1: Check Admin Permission
├─ Call verifyAdminAccess()
├─ If not admin → Return error 403
└─ If admin → Continue

STEP 2: Get Query Parameters
├─ Extract page number (default: 1)
├─ Extract limit (default: 10)
├─ Extract search text (optional)
└─ Example: page=2, limit=20, search="john"

STEP 3: Build Search Filter (if needed)
├─ If user searched for something:
│  └─ Find users where name OR email contains search text
├─ If no search:
│  └─ No filter - get all users

STEP 4: Query Database
├─ Get users with filters
├─ Skip first (page-1)*limit records
├─ Take limit number of records
├─ Sort by newest first (createdAt descending)
└─ Include how many comments each user made

STEP 5: Calculate Pagination Info
├─ Count total users (with filter)
├─ Calculate total pages
├─ Calculate if more pages exist
└─ Return all this info

STEP 6: Send Response
└─ Return users array + pagination info
```

#### Code with Explanations

```typescript
export async function GET(request: NextRequest) {
  try {
    // ===== STEP 1: VERIFY ADMIN ACCESS =====
    const authCheck = await verifyAdminAccess(request);
    if (authCheck.error) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: authCheck.status }
      );
    }

    // ===== STEP 2: PARSE QUERY PARAMETERS =====
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);      // Default: page 1
    const limit = parseInt(searchParams.get('limit') || '10', 10);   // Default: 10 per page
    const search = searchParams.get('search') || '';                 // Default: empty (no search)

    // ===== STEP 3: BUILD SEARCH FILTER =====
    // If user entered search text, create a filter
    const where = search ? {
      OR: [
        // Search in name field (case-insensitive)
        { name: { contains: search, mode: 'insensitive' } },
        // OR search in email field (case-insensitive)
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {};  // If no search, where is empty (no filtering)

    // ===== STEP 4: FETCH USERS FROM DATABASE =====
    const users = await prisma.user.findMany({
      where,                                    // Apply filter (if any)
      select: {                                 // Only get these fields (not password!)
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { comments: true } }  // Also count their comments
      },
      skip: (page - 1) * limit,                 // Skip to this page
      take: limit,                              // Get this many records
      orderBy: { createdAt: 'desc' }            // Newest users first
    });

    // ===== STEP 5: GET TOTAL COUNT FOR PAGINATION =====
    const total = await prisma.user.count({ where });  // Total users matching filter

    // ===== STEP 6: SEND RESPONSE =====
    return NextResponse.json({
      success: true,
      data: {
        users,  // Array of user objects
        pagination: {
          page,                                              // Current page
          limit,                                             // Users per page
          total,                                             // Total users
          totalPages: Math.ceil(total / limit),             // How many pages needed
          hasMore: page < Math.ceil(total / limit)          // Are there more pages?
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

#### Success Response (HTTP 200)

Here's what the server sends back:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "ADMIN",
        "createdAt": "2024-01-15T10:30:00Z",
        "_count": {
          "comments": 5
        }
      },
      {
        "id": "user_456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "EDITOR",
        "createdAt": "2024-01-14T14:20:00Z",
        "_count": {
          "comments": 12
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

**Response Fields Explained:**

```
users[]              → Array of users on current page
├─ id               → Unique user identifier
├─ name             → User's name
├─ email            → User's email address
├─ role             → ADMIN, EDITOR, or USER
├─ createdAt        → When user account was created
└─ _count.comments  → How many comments this user wrote

pagination          → Info about pages
├─ page             → Current page number (1, 2, 3...)
├─ limit            → Users shown per page
├─ total            → Total users in database (with filter)
├─ totalPages       → How many pages total
└─ hasMore          → Are there more pages after this? (true/false)
```

**Example: Making the Request**

```typescript
// Frontend code to fetch users
async function getUsers() {
  const response = await fetch(
    '/api/admin/users?page=1&limit=10&search=john',
    {
      headers: {
        'Authorization': `Bearer ${token}`  // Send admin token
      }
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    // Show users in UI
    data.data.users.forEach(user => {
      console.log(`${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Show pagination info
    console.log(`Page ${data.data.pagination.page} of ${data.data.pagination.totalPages}`);
  }
}
```

#### Error Responses

**401 - Not Authenticated:**
```json
{
  "success": false,
  "error": "No authentication token found"
}
```

**403 - Not Admin:**
```json
{
  "success": false,
  "error": "Admin access required"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Failed to fetch users"
}
```

#### HTTP Status Codes Used

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Users retrieved successfully |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User is not an admin |
| 500 | Server Error | Database error |

---

### POST /api/admin/users - Create User

**Purpose:** Create new user account (admin only)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePassword123",
  "role": "USER",
  "contactNumber": "+1234567890"
}
```

**Required Fields:** email, name, password

**Optional Fields:** role (default: USER), contactNumber

**Authorization:** Admin role required

#### Key Features

- Admin can create users with any role (USER, EDITOR, ADMIN)
- Password is validated (minimum 8 characters)
- Email uniqueness enforced (409 conflict if duplicate)
- Automatically generated user ID
- Returns 201 Created on success

#### Success Response (HTTP 201)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user_456",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "USER",
    "contactNumber": "+1234567890",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Error Responses

**409 - Email Already Exists:**
```json
{
  "success": false,
  "error": "Email already in use"
}
```

---

## Middleware Functions

**File:** `middleware.ts` (root level)

**What Is Middleware? (Simple Explanation)**

Middleware is code that runs on EVERY request before it reaches the actual API endpoint or page. Think of it as a security guard at a building entrance:

1. Person arrives (request comes in)
2. Guard checks ID (middleware verifies JWT)
3. Guard checks permission level (middleware checks role)
4. If ok, person enters (request goes to endpoint)
5. If not ok, person is turned away (request is rejected or redirected)

**Job of Our Middleware:**
1. ✅ Check if user is logged in (has valid JWT token)
2. ✅ Check if user has permission for this route (role check)
3. ✅ Add user info to request (so endpoint knows who they are)
4. ✅ Protect admin/editor routes from regular users

---

### Role-Based Access Control

**Role Hierarchy (Like a Pyramid):**

```
        ADMIN (Level 3)
           ↑
        EDITOR (Level 2)
           ↑
        USER (Level 1)
           ↑
        GUEST (Level 0)
```

**What This Means:**
- ADMIN can access everything (all levels)
- EDITOR can access EDITOR + USER routes
- USER can access USER routes only
- GUEST can access PUBLIC routes only

**Example Permissions:**

```
Route: /admin/dashboard
Required Level: 3 (ADMIN only)
├─ ADMIN ✅ → Allowed (level 3 >= 3)
├─ EDITOR ❌ → Blocked (level 2 < 3)
├─ USER ❌ → Blocked (level 1 < 3)
└─ GUEST ❌ → Blocked (level 0 < 3)

Route: /editor/dashboard
Required Level: 2 (EDITOR or higher)
├─ ADMIN ✅ → Allowed (level 3 >= 2)
├─ EDITOR ✅ → Allowed (level 2 >= 2)
├─ USER ❌ → Blocked (level 1 < 2)
└─ GUEST ❌ → Blocked (level 0 < 2)
```

---

### Protected Routes

**Admin Routes** (require ADMIN role):
```
/admin/*          → Admin dashboard and pages
/api/admin/*      → Admin APIs (user management, settings, etc.)
```

**Editor Routes** (require EDITOR or ADMIN):
```
/editor/*         → Editor dashboard
/api/editor/*     → Editor APIs (article creation, etc.)
```

**User Routes** (require USER or higher):
```
/profile          → User profile page
/api/profile/*    → User profile APIs
/api/dashboard/*  → User dashboard
/api/comments/*   → Comment management
```

**Public Routes** (anyone can access):
```
/                    → Home page
/login, /register    → Auth pages
/about, /contact     → Info pages
/articles/*          → Article viewing
/api/articles        → Article listing (read-only)
```

---

### Middleware Workflow

**What Happens When Someone Makes a Request:**

```
Browser sends request: GET /admin/dashboard

↓

Middleware runs (middleware.ts)

↓

STEP 1: Identify the route
├─ Path: /admin/dashboard
└─ Required role: ADMIN

STEP 2: Check if route is public
├─ Is /admin/dashboard in public routes? NO
└─ Need to verify authentication

STEP 3: Get JWT token
├─ Look in cookies for 'auth-token'
├─ Look in Authorization header
└─ If no token found:
   └─ Redirect to /login

STEP 4: Verify token is real & not expired
├─ Call verifyJWT(token)
├─ Check signature is correct
├─ Check token hasn't expired
└─ If invalid/expired:
   └─ Redirect to /login

STEP 5: Extract user from token
├─ User ID: user_123
├─ User role: EDITOR
└─ User email: user@example.com

STEP 6: Check role permission
├─ User role (EDITOR) >= Required role (ADMIN)?
├─ 2 >= 3? NO
└─ User doesn't have permission:
   └─ Redirect to /editor/dashboard (their role's dashboard)

(Or if they were ADMIN)

STEP 6b: Check role permission
├─ User role (ADMIN) >= Required role (ADMIN)?
├─ 3 >= 3? YES
└─ Permission granted! Continue...

STEP 7: Add user info to request headers
├─ Set header: x-user-id = user_123
├─ Set header: x-user-email = user@example.com
├─ Set header: x-user-role = ADMIN
└─ Set header: x-user-name = John Doe

STEP 8: Allow request to proceed
└─ Request goes to actual endpoint with user headers

STEP 9: Endpoint processes request
├─ Endpoint knows who user is (from headers)
├─ Endpoint performs action
└─ Endpoint returns response

STEP 10: Response sent back to browser
```

**In Simple Terms:**
1. Check if logged in → No? Go to login
2. Check if token is real → No? Go to login
3. Check if has permission → No? Go to their own page
4. Yes? Add user info and let request through

---

### Code Walkthrough

**Step 1: Get User Info From Token**

```typescript
// Get token from cookies or headers
const token = getAuthToken(request);

// Verify token is real and get user info
const validation = verifyJWT(token);
if (!validation.isValid) {
  // Token is fake or expired - send to login
  return NextResponse.redirect(getLoginRedirectUrl());
}

// Token is valid - extract user info
const user = validation.payload;  // { id, email, role, name }
```

**Step 2: Check Role Permission**

```typescript
// Get required role for this route
const { requiredRole } = getRouteSecurityContext(pathname);

// Check if user role >= required role
if (!hasPermission(user.role, requiredRole)) {
  // User doesn't have permission
  // Redirect to their role's dashboard
  return NextResponse.redirect(getRoleRedirectUrl(user.role));
}

// User has permission - continue
```

**Step 3: Add User Headers & Allow Request**

```typescript
// Create response that allows request to proceed
const response = NextResponse.next();

// Add user info as headers (endpoint can read these)
response.headers.set('x-user-id', user.id);
response.headers.set('x-user-email', user.email);
response.headers.set('x-user-role', user.role);
response.headers.set('x-user-name', user.name || '');

return response;
```

---

### Key Security Features

✅ **JWT Verification:**
- Signature checked (proves token is real)
- Expiration checked (proves token is still valid)
- Only valid tokens are accepted

✅ **Role Hierarchy:**
- Higher roles can't access lower role routes (ADMIN can't view as USER)
- Wait, that's wrong! Higher roles CAN access lower role routes (ADMIN can access USER pages)
- Lower roles CANNOT access higher role routes (USER cannot access ADMIN pages)

✅ **Automatic Redirects:**
- Not logged in → `/login`
- Not enough permissions → Your role's dashboard

✅ **User Headers:**
- Verified user info passed to endpoints
- Endpoints can trust headers (middleware already verified)

✅ **Rate Limiting:**
- (Optional Redis feature) Max 5 login attempts per 15 minutes
- Prevents brute force attacks

---

### Example: User Making Requests

```typescript
// User 1: John (ADMIN role)
GET /admin/users
├─ Token valid? YES
├─ Role ADMIN >= required ADMIN? YES
└─ ✅ Request allowed

// User 2: Jane (EDITOR role)
GET /admin/users
├─ Token valid? YES
├─ Role EDITOR >= required ADMIN? NO (2 >= 3? NO)
└─ ❌ Redirected to /editor/dashboard

// User 3: Bob (USER role)
GET /editor/articles
├─ Token valid? YES
├─ Role USER >= required EDITOR? NO (1 >= 2? NO)
└─ ❌ Redirected to /dashboard

// User 4: Not logged in
GET /admin/dashboard
├─ Token found? NO
└─ ❌ Redirected to /login
```

---

## API Response Format

All API endpoints follow a consistent response format:

### Success Response

```typescript
{
  success: true,
  message?: string,        // Optional message
  data?: any,              // Response data (varies by endpoint)
  statusCode?: number      // Optional status code
}
```

**HTTP Status:** 200 OK (or 201 Created for POST)

### Error Response

```typescript
{
  success: false,
  error: string,           // Error message
  details?: any,           // Optional error details (validation)
  msg?: string             // Optional additional message
}
```

**HTTP Status:** 400-500 (appropriate to error type)

### Standard HTTP Status Codes

| Code | Meaning | Use Cases |
|------|---------|-----------|
| 200 | OK | Successful GET, successful login |
| 201 | Created | New resource created (POST) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token, invalid credentials |
| 403 | Forbidden | Insufficient permissions (non-admin accessing admin) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, resource already exists |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 500 | Internal Server Error | Database error, unexpected exception |

See `docs/HTTP_STATUS_CODES_REFERENCE.md` for detailed status code reference.

---

## Error Handling Integration

All functions use consistent error handling patterns. See `docs/ERROR_HANDLING_GUIDE.md` for comprehensive error handling patterns.

### Try-Catch-Finally Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    // Main logic
    const result = await processRequest(request);
    return NextResponse.json({ success: true, data: result }, { status: 200 });
    
  } catch (error) {
    // Error handling
    console.error('Operation error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.details },
        { status: 400 }
      );
    }
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Default server error
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
    
  } finally {
    // Cleanup (if needed)
  }
}
```

### Custom Error Classes

From `src/lib/error-handler.ts`:

- `ValidationError` - Input validation failed (400)
- `AuthenticationError` - Auth credentials invalid (401)
- `AuthorizationError` - Insufficient permissions (403)
- `NotFoundError` - Resource not found (404)
- `DatabaseError` - Database operation failed (500)
- `ServerError` - General server error (500)

---

## Complete Integration Example

### Frontend Login Flow

```typescript
// 1. User submits login form
async function handleLogin(email: string, password: string) {
  try {
    // 2. Call login endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies in request
    });

    // 3. Parse response
    const data = await response.json();

    if (!data.success) {
      // Handle error (validation, credentials, etc.)
      showError(data.error);
      return;
    }

    // 4. Cookies automatically set by browser
    // AuthContext detects user and updates state
    
    // 5. Redirect based on role
    const user = data.data.user;
    if (user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (user.role === 'EDITOR') {
      router.push('/editor/dashboard');
    } else {
      router.push('/dashboard');
    }

  } catch (error) {
    showError('Network error during login');
  }
}
```

### Backend Request Flow

```
1. Browser sends request with auth-token cookie
   ↓
2. Middleware checks token validity
   ↓
3. Middleware verifies user role >= required role
   ↓
4. Middleware adds user headers to request
   ↓
5. API route receives verified user in headers
   ↓
6. API route processes request with user context
   ↓
7. API route returns success/error response
   ↓
8. Browser receives response and updates UI
```

---

## Token Expiration & Refresh

**Access Token Expiry:** 15 minutes

**Refresh Token Expiry:** 7 days

### Token Refresh Endpoint

**POST** `/api/auth/refresh`

**Purpose:** Exchange expired access token for new one using refresh token

**Automatic Refresh:**
1. API call gets 401 response (token expired)
2. Client calls refresh endpoint with refresh token
3. Server validates refresh token and issues new access token
4. Client retries original request with new token

---

## Summary

This documentation covers all critical authentication, user management, and API functions:

✅ **Login Function** - Complete authentication workflow with JWT tokens

✅ **Register Function** - User account creation with validation

✅ **Auth Utilities** - Token generation, verification, and parsing

✅ **Admin User Management** - User listing, creation, and administration

✅ **Middleware** - Route protection and role-based access control

✅ **Error Handling** - Consistent error responses and HTTP status codes

All functions follow security best practices and integrate seamlessly with the error handling system. See related documentation for additional details on error handling patterns and API routes.
