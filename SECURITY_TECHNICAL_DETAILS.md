# Technical Security Vulnerability Details

## Detailed Technical Analysis

### 1. Critical Vulnerability: Unauthenticated Admin Access

**File:** `app/api/reset-users/route.ts`
**Lines:** 1-62

**Vulnerable Code:**
```typescript
export async function POST(req: Request) {
  try {
    // Log token status (without exposing the actual token)
    const hasToken = !!process.env.SANITY_API_TOKEN;
    console.log('Sanity token status:', {
      hasToken,
      tokenLength: hasToken ? process.env.SANITY_API_TOKEN?.length : 0, // INFO LEAK
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // INFO LEAK
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET // INFO LEAK
    });

    // Delete all existing users - NO AUTHENTICATION CHECK!
    const existingUsers = await client.fetch(`*[_type == "user"]{_id}`);

    if (existingUsers.length > 0) {
      const transaction = client.transaction();
      existingUsers.forEach((user: { _id: string }) => {
        transaction.delete(user._id); // DELETES ALL USERS
      });
      await transaction.commit();
      console.log(`Deleted ${existingUsers.length} existing users`);
    }

    // Create a new user with a known password
    const email = 'test@example.com';
    const password = 'password123'; // HARDCODED PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _type: 'user',
      email,
      password: hashedPassword,
      accountStatus: 'active',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await client.create(newUser);
    console.log('Created new test user');

    return NextResponse.json({
      message: 'Users reset successfully',
      testUser: {
        email,
        password: 'password123' // EXPOSED IN RESPONSE
      }
    });
  } catch (error) {
    console.error('Error resetting users:', error);
    return NextResponse.json(
      { message: 'Failed to reset users' },
      { status: 500 }
    );
  }
}
```

**Attack Vector:**
```bash
# Anyone can execute this to wipe all users and gain admin access
curl -X POST https://your-domain.com/api/reset-users
```

**Impact:**
- Complete user database wipe
- Admin account creation with known credentials
- System takeover
- Data loss

---

### 2. Critical Vulnerability: Environment Variable Exposure

**Multiple Files:** Various API routes

**Vulnerable Code Examples:**
```typescript
// From auth.ts
console.log('Sanity token status:', {
  hasToken,
  tokenLength: hasToken ? process.env.SANITY_API_TOKEN?.length : 0,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET
});

// From revalidate/route.ts
console.log(`[${requestId}] 📝 Revalidation parameters:`, {
  path,
  hasSecret: !!secret,
  expectedSecret: !!process.env.REVALIDATE_SECRET_TOKEN // EXPOSES ENV VAR EXISTENCE
});

// From save-address/route.ts
if (!process.env.SANITY_API_TOKEN) {
  console.error('Missing SANITY_API_TOKEN environment variable'); // LOGS MISSING ENV
  return NextResponse.json(
    { error: 'Server configuration error: Missing API token' }, // EXPOSES CONFIG INFO
    { status: 500 }
  );
}
```

**Attack Vector:**
- Server logs contain sensitive configuration information
- Error responses leak internal configuration details
- Debugging information exposed in production

---

### 3. High Vulnerability: Username Enumeration

**File:** `app/api/check-user/route.ts`
**Lines:** 6-38

**Vulnerable Code:**
```typescript
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and has a password - INFORMATION DISCLOSURE
    const user = await sanityClientPublic.fetch(
      `*[_type == "user" && email == $email][0]{
        _id,
        password
      }`,
      { email }
    );

    return NextResponse.json({
      exists: !!user,        // USERNAME ENUMERATION
      hasPassword: !!user?.password  // PASSWORD STATUS LEAK
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { message: 'Failed to check user status' },
      { status: 500 }
    );
  }
}
```

**Attack Vector:**
```javascript
// Attacker can enumerate valid user accounts
const checkUser = async (email) => {
  const response = await fetch(`/api/check-user?email=${email}`);
  const data = await response.json();
  return data.exists; // true if user exists
};

// Automated enumeration attack
const emails = ['admin@example.com', 'test@example.com', ...];
const validEmails = [];
for (const email of emails) {
  if (await checkUser(email)) {
    validEmails.push(email);
  }
}
```

---

### 4. High Vulnerability: Insecure Order Access

**File:** `app/api/orders/route.ts`
**Lines:** 4-72

**Vulnerable Code:**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    console.log('🔍 Fetching orders for email:', email); // EMAIL IN LOGS
    
    // Fetch the user document if email is provided
    let userId = undefined;
    if (email) {
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && email == $email][0]{_id, email}`,
        { email }
      );
      if (user?._id) {
        userId = user._id;
      }
    }

    // Build the query dynamically - COMPLEX AUTHORIZATION LOGIC
    let query = `*[_type == "order" && (
      customerEmail == $email || 
      user->email == $email${userId ? ' || (user._ref == $userId && defined(userId))' : ''}
    )] | order(createdAt desc) {
      _id,
      orderNumber,
      createdAt,
      totalAmount,
      paymentStatus,
      items[]{ name, quantity, price, image },
      shippingAddress,
      user->{_id, email},
      userId
    }`;

    const params: { email: string; userId?: string } = { email };
    if (userId) params.userId = userId;

    console.log('🟧 Query:', query); // QUERY IN LOGS
    console.log('🟧 Params:', params); // PARAMS IN LOGS
    const orders = await sanityClientWrite.fetch(query, params);
    console.log('🟧 Raw orders from Sanity:', orders); // ORDER DATA IN LOGS

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
```

**Attack Vector:**
- Complex query logic may allow unauthorized order access
- No session validation - anyone with an email can query orders
- Sensitive data logged to server logs

---

### 5. Medium Vulnerability: Password Reset Token in URL

**File:** `app/api/reset-password/route.ts`
**Lines:** 8-27

**Vulnerable Code:**
```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token"); // TOKEN IN URL - LOGGED AND CACHED
  if (!token) return NextResponse.json({ message: "Missing token." }, { status: 400 });

  const now = new Date().toISOString();
  const params = {
    token,
    now
  };

  const user = await client.fetch<{ email: string }>(
    `*[_type == "user" && resetToken == $token && resetTokenExpiry > $now][0]{email}`,
    params as any
  );
  if (!user) {
    return NextResponse.json({ message: "Invalid or expired token." }, { status: 400 });
  }
  return NextResponse.json({ email: user.email }); // EMAIL LEAK
}
```

**Security Issues:**
- Reset tokens transmitted via GET parameters
- Tokens logged in server access logs
- Tokens cached by browsers and proxies
- User email exposed in response

---

### 6. High Vulnerability: Insecure Cart Operations

**File:** `app/api/cart/clear/route.ts`

**Vulnerable Code:**
```typescript
export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      console.error(`[${requestId}] ❌ No email provided for cart clearing`);
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Store the cart state in Sanity for the user - NO AUTH CHECK
    await sanityClientWrite.create({
      _type: 'cartState',
      email,
      items: [],
      lastCleared: new Date().toISOString()
    });

    console.log(`[${requestId}] ✅ Cart cleared for user:`, email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error clearing cart:`, error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
```

**Attack Vector:**
```bash
# Anyone can clear any user's cart
curl -X POST https://your-domain.com/api/cart/clear \
  -H "Content-Type: application/json" \
  -d '{"email":"victim@example.com"}'
```

---

### 7. Critical Vulnerability: Revalidation Secret in URL

**File:** `app/api/revalidate/route.ts`

**Vulnerable Code:**
```typescript
export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 🔄 Revalidation request received`);

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const secret = searchParams.get('secret'); // SECRET IN URL!

    console.log(`[${requestId}] 📝 Revalidation parameters:`, {
      path,
      hasSecret: !!secret,
      expectedSecret: !!process.env.REVALIDATE_SECRET_TOKEN // ENV VAR LEAK
    });

    // Check the secret and next parameters
    if (!process.env.REVALIDATE_SECRET_TOKEN) {
      console.error(`[${requestId}] ❌ REVALIDATE_SECRET_TOKEN not set in environment`);
      return NextResponse.json(
        { error: 'Revalidation not configured' },
        { status: 500 }
      );
    }

    if (secret !== process.env.REVALIDATE_SECRET_TOKEN) {
      console.error(`[${requestId}] ❌ Invalid revalidation token`);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    // ... rest of function
  }
}
```

**Security Issues:**
- Revalidation secret transmitted in URL (logged everywhere)
- Environment variable status leaked in logs
- No rate limiting on failed attempts

---

## Common Security Patterns Found

### 1. Excessive Logging
```typescript
// Pattern found throughout codebase
console.log('🔍 Fetching orders for email:', email);
console.log('🟧 Query:', query);
console.log('🟧 Params:', params);
console.log('🟧 Raw orders from Sanity:', orders);
```

**Risk:** Sensitive data in server logs

### 2. Missing Authentication Checks
```typescript
// Pattern: No session validation
export async function POST(request: Request) {
  // Direct operation without auth check
  const { email } = await request.json();
  // ... perform sensitive operation
}
```

**Risk:** Unauthorized access to sensitive operations

### 3. Information Disclosure in Error Messages
```typescript
// Pattern: Detailed error responses
return NextResponse.json(
  { error: 'Server configuration error: Missing API token' },
  { status: 500 }
);
```

**Risk:** Internal system information leaked to attackers

### 4. No Rate Limiting
```typescript
// Pattern: No rate limiting on any endpoint
export async function POST(request: Request) {
  // No rate limiting implementation
  // Vulnerable to brute force and DoS
}
```

**Risk:** Brute force attacks, denial of service

## Remediation Code Examples

### Fix 1: Secure Reset Users Endpoint
```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  // Add admin authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Add additional confirmation parameter
  const { confirmReset } = await req.json();
  if (confirmReset !== 'CONFIRM_DELETE_ALL_USERS') {
    return NextResponse.json(
      { error: 'Confirmation required' },
      { status: 400 }
    );
  }

  // Rest of the function with audit logging
  console.log(`Admin ${session.user.email} initiated user reset`);
  // ... reset logic
}
```

### Fix 2: Secure User Check Endpoint
```typescript
export async function GET(req: Request) {
  // Add rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Valid email required' },
      { status: 400 }
    );
  }

  // Generic response to prevent enumeration
  return NextResponse.json({
    message: 'If the account exists, further instructions will be provided.'
  });
}
```

### Fix 3: Secure Order Access
```typescript
import { getServerSession } from 'next-auth/next';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Only allow users to access their own orders
  const userEmail = session.user.email;
  
  try {
    const orders = await sanityClientWrite.fetch(
      `*[_type == "order" && customerEmail == $email] | order(createdAt desc)`,
      { email: userEmail }
    );

    return NextResponse.json({ orders });
  } catch (error) {
    // Generic error without details
    return NextResponse.json(
      { error: 'Unable to fetch orders' },
      { status: 500 }
    );
  }
}
```

## Testing Recommendations

### 1. Automated Security Testing
```bash
# Add to CI/CD pipeline
npm audit --audit-level moderate
npm run test:security
npx retire --js
```

### 2. Manual Testing Checklist
- [ ] Test all endpoints without authentication
- [ ] Verify rate limiting on all endpoints
- [ ] Test input validation with malicious payloads
- [ ] Verify proper error handling without information leakage
- [ ] Test session management and timeout behavior

### 3. Penetration Testing Focus Areas
1. Authentication bypass attempts
2. Authorization escalation
3. SQL injection in Sanity queries
4. XSS in user inputs
5. CSRF on state-changing operations

## Compliance Requirements

### OWASP Top 10 Coverage
1. **A01:2021 – Broken Access Control** ✅ Multiple issues found
2. **A02:2021 – Cryptographic Failures** ✅ Password reset tokens in URLs
3. **A03:2021 – Injection** ⚠️ Potential Sanity query injection
4. **A04:2021 – Insecure Design** ✅ Multiple design flaws
5. **A05:2021 – Security Misconfiguration** ✅ Environment exposure
6. **A06:2021 – Vulnerable Components** ✅ 22 dependency vulnerabilities
7. **A07:2021 – Authentication Failures** ✅ Multiple auth issues
8. **A08:2021 – Software Data Integrity** ⚠️ Needs assessment
9. **A09:2021 – Security Logging** ✅ Excessive logging issues
10. **A10:2021 – SSRF** ⚠️ Potential in webhook handling