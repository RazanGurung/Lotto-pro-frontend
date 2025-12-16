# Payment Flow - How It Works

## 🔄 Complete User Journey

### New User (First Time)

```
1. User opens app
   ↓
2. User sees Login Screen
   ↓
3. User enters credentials and logs in
   ↓
4. LoginScreen redirects to → Paywall Screen
   ↓
5. Paywall checks: "Do you have active subscription?"
   ├─ YES → Navigate to Main App (skip payment)
   └─ NO → Show subscription plans
       ↓
6. User selects Monthly or Yearly plan
   ↓
7. User taps "Subscribe Now"
   ↓
8. iOS/Android payment sheet appears
   ↓
9. User completes payment
   ↓
10. Payment confirmed ✓
    ↓
11. App saves subscription status
    ↓
12. Navigate to Main App (StoreDashboard or MainTabs)
```

### Returning User (Has Subscription)

```
1. User opens app
   ↓
2. User logs in
   ↓
3. LoginScreen redirects to → Paywall Screen
   ↓
4. Paywall automatically checks subscription
   ↓
5. ✓ Active subscription found
   ↓
6. Automatically navigate to Main App
   (User never sees payment screen)
```

### User Reinstalls App

```
1. User reinstalls app
   ↓
2. User logs in
   ↓
3. Redirected to Paywall
   ↓
4. User taps "Restore Purchase"
   ↓
5. App validates previous purchase
   ↓
6. Subscription restored ✓
   ↓
7. Navigate to Main App
```

### Subscription Expired

```
1. User opens app
   ↓
2. User logs in
   ↓
3. Redirected to Paywall
   ↓
4. Subscription check: EXPIRED
   ↓
5. Show subscription plans
   ↓
6. User must renew subscription to continue
```

---

## 🎯 Key Integration Points

### 1. **LoginScreen.tsx** (Entry Point)
After successful login, ALL users are sent to Paywall:

```typescript
// Line 87-92
if (userType === 'store') {
  navigation.replace('Paywall');  // ← PAYMENT KICKS IN HERE
} else {
  navigation.replace('Paywall');  // ← PAYMENT KICKS IN HERE
}
```

### 2. **PaywallScreen.tsx** (Smart Router)
Automatically decides what to show:

```typescript
// Lines 42-61
const initializePaywall = async () => {
  // Check if user already subscribed
  await checkExistingSubscription();
  // If not subscribed, load products to show
  await loadProducts();
};

const checkExistingSubscription = async () => {
  const status = await paymentService.checkSubscriptionStatus();

  if (status.isActive) {
    // Has subscription → Go to main app
    await navigateToMainApp();
  } else {
    // No subscription → Show payment options
  }
};
```

### 3. **PaymentService.ts** (Brain)
Handles all payment logic:

```typescript
// Check subscription status
checkSubscriptionStatus() → returns { isActive: true/false }

// Purchase subscription
purchaseSubscription('monthly' or 'yearly')

// Restore previous purchase
restorePurchases()
```

---

## 🛡️ Payment Enforcement

### Where Payment is Required

1. **After Login** - Every login goes through Paywall
2. **App Launch** - Subscription checked automatically
3. **Expired Subscription** - Blocked from main app

### What Happens Without Payment

```
User tries to access app
  ↓
Login successful
  ↓
Redirected to Paywall
  ↓
No active subscription
  ↓
🚫 STUCK ON PAYWALL
  ↓
Must subscribe to continue
```

### What User Sees

**No Subscription:**
- 🔒 Paywall screen with subscription plans
- "Subscribe Now" button
- "Restore Purchase" button
- Cannot access main app

**Active Subscription:**
- ✅ Automatically bypass Paywall
- Direct access to main app
- Full features unlocked

---

## 💾 Subscription Storage

### Local Storage (AsyncStorage)

```javascript
Key: '@subscription_status'
Value: {
  isActive: true,
  productId: 'com.lotterypro.subscription.yearly',
  expiryDate: '2025-12-15T10:30:00Z',
  platform: 'ios'
}
```

### Where It's Checked

1. **App Launch** - SubscriptionContext initializes
2. **Login** - Redirects to Paywall
3. **Paywall Screen** - Auto-checks on mount
4. **After Purchase** - Status updated
5. **After Restore** - Status validated

---

## 🎨 User Experience

### First Launch (New User)
```
Login → Paywall (must subscribe) → Main App
  Time: ~30 seconds (including payment)
```

### Subsequent Launches (Paid User)
```
Login → Paywall (auto-bypass) → Main App
  Time: ~2 seconds (instant redirect)
```

### Without Subscription
```
Login → Paywall → 🛑 BLOCKED
  Cannot proceed without payment
```

---

## 🔧 Configuration

### Enable/Disable Paywall

To temporarily disable for testing:

**Option 1: Comment out Paywall redirect**
```typescript
// In LoginScreen.tsx
// navigation.replace('Paywall');
navigation.replace('MainTabs');  // Skip paywall
```

**Option 2: Mock active subscription**
```typescript
// In PaymentService.ts - checkSubscriptionStatus()
return {
  isActive: true,  // Force active
  productId: 'test',
  expiryDate: '2099-12-31',
  platform: 'ios'
};
```

### Testing Without Real Payment

See `PAYMENT_SETUP.md` for sandbox testing with Apple and Google test accounts.

---

## 📊 Flow Diagram

```
┌─────────────┐
│   App Load  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Login Screen│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Paywall Screen     │
│  (Auto-checks sub)  │
└──────┬──────────────┘
       │
       ├─── Has Subscription? ───┐
       │                         │
    [YES]                      [NO]
       │                         │
       ▼                         ▼
┌─────────────┐        ┌──────────────────┐
│  Main App   │        │ Show Payment UI  │
│  (Unlocked) │        │ (Subscription    │
└─────────────┘        │  Options)        │
                       └────────┬─────────┘
                                │
                         User Subscribes
                                │
                                ▼
                       ┌──────────────────┐
                       │ Payment Complete │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Save Subscription│
                       │ Status           │
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Main App       │
                       │   (Unlocked)     │
                       └──────────────────┘
```

---

## 🚀 Summary

**Payment is kicked in:**
1. ✅ Immediately after login (LoginScreen redirects to Paywall)
2. ✅ On every app launch (Paywall checks subscription)
3. ✅ When subscription expires (Blocked from main app)

**Users bypass payment when:**
- ✅ They have an active subscription
- ✅ Subscription is automatically detected
- ✅ They restore previous purchase

**No way around payment:**
- 🚫 Cannot access main app without subscription
- 🚫 All routes go through Paywall check
- 🚫 Expired subscriptions block access
