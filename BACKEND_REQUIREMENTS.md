# Backend Requirements for Token Refresh

## Critical: Backend Changes Required for Token Refresh Feature

The mobile app now implements automatic token refresh to prevent forced logouts. **The backend must be updated** to support this feature.

---

## 1. Update Login Endpoint

### Current Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Required Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": { ... },
  "store": { ... }
}
```

### New Fields
- **`refresh_token`** (string, required): A separate JWT with longer expiry (30 days recommended)
- **`expires_in`** (integer, required): Access token lifetime in seconds (3600 = 1 hour recommended)

---

## 2. Create Token Refresh Endpoint

### Endpoint
```
POST /api/auth/refresh
```

### Request Body
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

### Error Response (401)
```json
{
  "error": "Invalid or expired refresh token"
}
```

### Implementation Logic
1. Validate refresh token signature and expiry
2. Check if refresh token exists in whitelist database
3. Generate new access token with same user claims
4. **Optional but recommended**: Generate new refresh token and revoke old one
5. Return new tokens

---

## 3. Database Schema for Refresh Tokens

### Create Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  device_info TEXT  -- Optional: track device
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

### Usage
- **On Login**: Insert new refresh token
- **On Refresh**: Validate token exists and is not revoked
- **On Logout**: Mark token as revoked

---

## 4. Update Logout Endpoint

### Current Behavior
Client clears tokens locally

### Required Behavior
```
POST /api/auth/logout
```

**Request Headers:**
```
Authorization: Bearer <refresh_token>
```

**Action:**
- Mark refresh token as revoked in database
- Prevent further use of that refresh token

---

## 5. JWT Configuration

### Access Token
```javascript
const accessToken = jwt.sign(
  { user_id, email, role },
  ACCESS_TOKEN_SECRET,
  { expiresIn: '1h' }  // 1 hour
);
```

### Refresh Token
```javascript
const refreshToken = jwt.sign(
  { user_id, type: 'refresh' },
  REFRESH_TOKEN_SECRET,  // Different secret!
  { expiresIn: '30d' }  // 30 days
);
```

**Important:**
- Use **different secrets** for access and refresh tokens
- Access token should expire in **15 minutes to 1 hour**
- Refresh token should expire in **7 to 30 days**

---

## 6. Example Node.js/Express Implementation

```javascript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  const user = await User.findByCredentials(email, password);

  // Generate tokens
  const accessToken = jwt.sign(
    { user_id: user.id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { user_id: user.id, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );

  // Store refresh token in database
  await RefreshToken.create({
    user_id: user.id,
    token: refreshToken,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  res.json({
    success: true,
    token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,  // 1 hour in seconds
    user: user
  });
});

// POST /auth/refresh
app.post('/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);

    // Check if token exists and is not revoked
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refresh_token,
        user_id: decoded.user_id,
        revoked: false,
        expires_at: { $gte: new Date() }
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const user = await User.findById(decoded.user_id);
    const newAccessToken = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    // Optional: Rotate refresh token
    const newRefreshToken = jwt.sign(
      { user_id: user.id, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    // Revoke old refresh token
    await tokenRecord.update({ revoked: true });

    // Store new refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    res.json({
      token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 3600
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /auth/logout
app.post('/auth/logout', async (req, res) => {
  const { refresh_token } = req.body;

  // Revoke refresh token
  await RefreshToken.update(
    { revoked: true },
    { where: { token: refresh_token } }
  );

  res.json({ success: true });
});
```

---

## 7. Testing Checklist

- [ ] Login returns `token`, `refresh_token`, and `expires_in`
- [ ] `/auth/refresh` endpoint exists and validates refresh tokens
- [ ] Refresh tokens are stored in database
- [ ] Old refresh tokens are revoked on refresh (token rotation)
- [ ] Logout revokes refresh tokens
- [ ] Expired refresh tokens are rejected
- [ ] Invalid refresh tokens return 401

---

## 8. Security Best Practices

✅ **Use HTTPS only** (already done: Railway deployment uses HTTPS)
✅ **Use different secrets** for access and refresh tokens
✅ **Store hashed refresh tokens** in database (optional but recommended)
✅ **Implement rate limiting** on `/auth/refresh` endpoint
✅ **Log refresh token usage** for security monitoring
✅ **Implement token rotation** (revoke old refresh token when issuing new one)

---

## 9. Migration Impact

### For Existing Users
- New field `expires_in` is backward compatible (mobile app has default fallback)
- New field `refresh_token` is optional on first deployment
- Recommended: Add `refresh_token` and `expires_in` to login response immediately

### Deployment Strategy
1. **Phase 1**: Update login endpoint to return new fields (but don't enforce refresh)
2. **Phase 2**: Deploy `/auth/refresh` endpoint
3. **Phase 3**: Mobile app uses refresh tokens automatically
4. **Phase 4**: Shorten access token lifetime (from 24h to 1h)

---

## 10. Priority

**CRITICAL**: This must be implemented before shortening access token lifetimes.

**Timeline:**
- Backend implementation: 1-2 days
- Testing: 1 day
- Deployment: Same day as mobile app update

---

## Questions?

Contact the mobile development team or refer to `TOKEN_REFRESH_IMPLEMENTATION.md` for full technical details.
