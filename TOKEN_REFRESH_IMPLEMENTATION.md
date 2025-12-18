# Token Refresh Implementation

## Overview
This document describes the implementation of JWT token expiry checking and automatic token refresh mechanism to fix authentication flaws #17 and #18.

## What Was Fixed

### Issue #17: Token Never Expires (Client-Side)
**Before:** Tokens were stored indefinitely in AsyncStorage with no expiry validation.
**After:** Tokens now have expiry timestamps stored locally. The app checks expiry before each API call and prevents the use of expired tokens.

### Issue #18: No Token Refresh Mechanism
**Before:** When tokens expired, users were immediately logged out with no recovery.
**After:** The app automatically refreshes expired tokens using a refresh token, providing seamless authentication renewal.

---

## Client-Side Implementation (Completed)

### 1. **New Storage Keys**
Added to `src/config/env.ts`:
```typescript
STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',           // Access token
  REFRESH_TOKEN: '@refresh_token',     // Refresh token
  TOKEN_EXPIRY: '@token_expiry',       // Unix timestamp (ms)
  // ... other keys
}
```

### 2. **Token Expiry Validation**
`src/services/api.ts` - `isTokenExpired()`
- Checks if current token expires within 5 minutes
- Returns `true` if token is expired or missing
- 5-minute buffer ensures tokens are refreshed before they actually expire

### 3. **Automatic Token Refresh**
`src/services/api.ts` - `refreshAuthToken()`
- Calls `POST /auth/refresh` with refresh token
- Saves new access token, refresh token, and expiry
- Clears auth data if refresh fails
- Returns boolean success status

### 4. **Enhanced API Request Handler**
`src/services/api.ts` - `apiRequest()`
- **Before each request**: Checks token expiry and refreshes if needed
- **On 401 errors**: Attempts token refresh once, then retries the original request
- **On refresh failure**: Clears all auth data and forces re-login
- **Prevents infinite loops**: Uses `isRetryAfterRefresh` flag to avoid multiple refresh attempts

### 5. **Updated Login Flow**
`src/screens/LoginScreen.tsx` - `handleLogin()`
- Now uses `saveAuthTokens()` instead of manual AsyncStorage
- Stores: `token`, `refresh_token`, and `expires_in` from backend response
- Calculates expiry timestamp: `Date.now() + (expires_in * 1000)`

---

## Backend Requirements (TODO)

### 1. **Update Login Response**
The backend `/auth/login` endpoint must return:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,  // Token lifetime in seconds (e.g., 1 hour)
  "user": { ... },
  "store": { ... }
}
```

**Changes needed:**
- Add `refresh_token` field (a separate JWT with longer expiry)
- Add `expires_in` field (integer, seconds until access token expires)
- Recommended: Access token = 1 hour, Refresh token = 30 days

### 2. **Create Token Refresh Endpoint**
Create new endpoint: `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // Optional: new refresh token
  "expires_in": 3600
}
```

**Response (Failure):**
```json
{
  "error": "Invalid or expired refresh token"
}
```

**Implementation notes:**
- Validate refresh token signature and expiry
- Check if refresh token exists in whitelist (database)
- Generate new access token with same user claims
- Optionally: Issue new refresh token and revoke old one (refresh token rotation)
- Return 401 if refresh token is invalid/expired

### 3. **Refresh Token Storage (Backend)**
Create a `refresh_tokens` table:
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE
);
```

**Why?**
- Allows token revocation on logout
- Prevents reuse of old refresh tokens
- Enables tracking of user sessions

### 4. **Update Logout Endpoint**
`POST /auth/logout` should:
- Revoke the refresh token in database
- Clear user session

---

## Token Expiry Best Practices

### Recommended Token Lifetimes
- **Access Token**: 15 minutes to 1 hour
- **Refresh Token**: 7 to 30 days
- **Shorter access tokens** = More secure (less time for attacker to use stolen token)
- **Longer refresh tokens** = Better UX (users stay logged in)

### When to Use Refresh Tokens
✅ **Use refresh tokens when:**
- Access token expires within 5 minutes
- API returns 401 Unauthorized
- User opens app after long inactivity

❌ **Don't refresh when:**
- User manually logs out
- Refresh token is expired
- Previous refresh attempt failed (prevent loops)

---

## Security Considerations

### 1. **Refresh Token Storage**
✅ **Current implementation**: Stored in AsyncStorage (encrypted on iOS/Android)
⚠️ **Risk**: If device is rooted/jailbroken, tokens could be extracted
💡 **Future improvement**: Use Expo SecureStore for sensitive token storage

### 2. **Refresh Token Rotation**
💡 **Recommendation**: Backend should issue a new refresh token on each refresh
- Old refresh token is revoked immediately
- Prevents replay attacks if refresh token is stolen

### 3. **Token Revocation on Logout**
⚠️ **Current gap**: Client clears tokens, but backend doesn't revoke them
💡 **Fix**: Call `POST /auth/logout` to revoke refresh token in database

### 4. **HTTPS Only**
⚠️ **Critical**: All API calls must use HTTPS to prevent token interception
✅ **Current**: Production uses `https://lotto-pro-api-production.up.railway.app`

---

## Testing the Implementation

### Test Cases

#### 1. **Token Expiry Check**
```typescript
// Manually set token expiry to past
await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, (Date.now() - 1000).toString());
// Next API call should trigger refresh
```

#### 2. **Successful Refresh**
- Set token expiry to 4 minutes from now
- Make an API call
- Verify token is refreshed without user noticing

#### 3. **Failed Refresh (Invalid Refresh Token)**
- Set invalid refresh token
- Make an API call
- Verify user is logged out

#### 4. **401 Retry Logic**
- Mock 401 response from server
- Verify app attempts refresh once
- Verify retry with new token succeeds

#### 5. **Prevent Infinite Loops**
- Mock refresh endpoint to always fail
- Verify only ONE refresh attempt per request
- Verify user is logged out after failed refresh

---

## Migration Guide

### For Existing Users
⚠️ **Users upgrading from old version:**
- Old tokens in storage don't have `TOKEN_EXPIRY` or `REFRESH_TOKEN`
- `isTokenExpired()` will return `true` (no expiry = expired)
- Users will be logged out on first app launch after update
- **This is intended behavior** - forces fresh login with new token structure

### Smooth Migration (Optional)
If you want to avoid logging out existing users:
1. Set a default expiry for existing tokens (e.g., 7 days from now)
2. Add migration logic in `App.tsx`:
```typescript
const migrateOldTokens = async () => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const expiry = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

  if (token && !expiry) {
    // Set expiry to 7 days from now for old tokens
    const defaultExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, defaultExpiry.toString());
  }
};
```

---

## Monitoring & Debugging

### Client-Side Logs
The implementation includes console logs for debugging:
```javascript
console.log('Token expired, attempting to refresh...')
console.log('Token refreshed successfully')
console.log('Got 401, attempting token refresh...')
```

### Recommended Backend Logs
```javascript
// Log refresh token usage
logger.info('Token refresh requested', { user_id, old_token_hash });
logger.warn('Invalid refresh token used', { token_hash, user_id });
logger.info('Refresh token revoked', { token_id, reason: 'logout' });
```

---

## Summary of Changes

### Files Modified
1. ✅ `src/config/env.ts` - Added `REFRESH_TOKEN` and `TOKEN_EXPIRY` storage keys
2. ✅ `src/services/api.ts` - Added token refresh logic and expiry checking
3. ✅ `src/screens/LoginScreen.tsx` - Updated to use `saveAuthTokens()`

### Files Created
1. ✅ `TOKEN_REFRESH_IMPLEMENTATION.md` - This documentation

### Backend Changes Needed
1. ⚠️ Update `POST /auth/login` to return `refresh_token` and `expires_in`
2. ⚠️ Create `POST /auth/refresh` endpoint
3. ⚠️ Add `refresh_tokens` database table
4. ⚠️ Update `POST /auth/logout` to revoke refresh tokens

---

## Next Steps

### Immediate
1. **Backend team**: Implement refresh token endpoint and update login response
2. **Testing**: Test token refresh flow in development environment
3. **Verification**: Confirm refresh tokens are stored and revoked properly

### Future Enhancements
1. **Biometric authentication**: Use device biometrics to unlock refresh tokens
2. **Secure storage**: Migrate to Expo SecureStore for refresh tokens
3. **Session management**: Display active sessions to users (like Google/Facebook)
4. **Token binding**: Bind tokens to device fingerprint for extra security

---

## FAQ

**Q: What happens if the user's device is offline when token expires?**
A: The refresh attempt will fail with a network error. The user will see a connection error and be logged out when they go online.

**Q: Can users stay logged in forever?**
A: No. Refresh tokens expire (e.g., 30 days). After that, users must re-login with credentials.

**Q: What if someone steals the refresh token?**
A: They can generate new access tokens until the refresh token expires. Use token rotation and HTTPS to mitigate this.

**Q: Why not just use long-lived access tokens?**
A: Short access tokens limit the damage from token theft. If stolen, they expire quickly. Refresh tokens can be revoked server-side.

**Q: Does this work with the current backend?**
A: Not yet. Backend must be updated to return `refresh_token` and `expires_in` in login response and implement the `/auth/refresh` endpoint.

---

## Support
For questions about this implementation, contact the development team or refer to:
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- OAuth 2.0 Refresh Tokens: https://oauth.net/2/grant-types/refresh-token/
