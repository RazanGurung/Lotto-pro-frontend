# Payment Integration Quick Start

## 1. Install Dependencies

Run this command in your project root:

```bash
npm install react-native-iap
```

For iOS, also run:
```bash
cd ios && pod install && cd ..
```

## 2. Update App.tsx

Wrap your app with the SubscriptionProvider:

```typescript
import React from 'react';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SubscriptionProvider>
      <AppNavigator />
    </SubscriptionProvider>
  );
}
```

## 3. Update LoginScreen.tsx

After successful login, navigate users to the Paywall:

Find the login success section and change:

```typescript
// OLD CODE:
if (onboardingComplete === 'true') {
  navigation.replace('MainTabs');
} else {
  navigation.replace('ThemeSelection');
}

// NEW CODE:
navigation.replace('Paywall');
```

The Paywall screen will automatically handle:
- Checking if user has an active subscription
- Showing subscription options if not subscribed
- Navigating to MainTabs/ThemeSelection if subscribed

## 4. Configure Product IDs

After setting up products in App Store Connect and Google Play Console, update:

**File**: `src/config/subscriptionConfig.ts`

Replace the product IDs with your actual IDs:

```typescript
export const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    ios: 'com.YOUR_APP.subscription.monthly',
    android: 'com.YOUR_APP.subscription.monthly',
  },
  yearly: {
    ios: 'com.YOUR_APP.subscription.yearly',
    android: 'com.YOUR_APP.subscription.yearly',
  },
};
```

## 5. Test

### iOS Testing:
1. Create sandbox tester in App Store Connect
2. Sign out of App Store on device
3. Run app and use sandbox account when prompted

### Android Testing:
1. Add test Gmail account in Google Play Console
2. Upload APK to internal testing
3. Install and test

## Files Created

✅ `src/config/subscriptionConfig.ts` - Product IDs configuration
✅ `src/services/paymentService.ts` - Payment service wrapper
✅ `src/contexts/SubscriptionContext.tsx` - Subscription state management
✅ `src/screens/PaywallScreen.tsx` - Subscription UI
✅ Updated `src/navigation/AppNavigator.tsx` - Added Paywall route

## Next Steps

1. **Install the package**: `npm install react-native-iap`
2. **Set up App Store Connect**: Create subscription products
3. **Set up Google Play Console**: Create subscription products
4. **Update Product IDs**: In `subscriptionConfig.ts`
5. **Test subscriptions**: Use sandbox accounts
6. **Update App.tsx**: Add SubscriptionProvider
7. **Update LoginScreen**: Navigate to Paywall after login

For detailed instructions, see `PAYMENT_SETUP.md`
