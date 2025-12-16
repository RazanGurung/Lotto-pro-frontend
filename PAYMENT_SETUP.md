# In-App Purchase (Subscription) Setup Guide

This guide will help you set up subscriptions for Lottery Pro on both iOS (App Store) and Android (Google Play).

## Table of Contents
1. [Installation](#installation)
2. [App Store Connect Setup (iOS)](#app-store-connect-setup-ios)
3. [Google Play Console Setup (Android)](#google-play-console-setup-android)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Implementation Details](#implementation-details)
7. [Troubleshooting](#troubleshooting)

---

## Installation

### Step 1: Install react-native-iap

```bash
npm install react-native-iap
# or
yarn add react-native-iap
```

### Step 2: Link the library (for React Native < 0.60)

If you're using React Native 0.60+, the library auto-links. Otherwise:

```bash
npx react-native link react-native-iap
```

### Step 3: iOS specific setup

```bash
cd ios
pod install
cd ..
```

---

## App Store Connect Setup (iOS)

### 1. Create an App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **App IDs**
4. Create or edit your app's ID
5. Enable **In-App Purchase** capability

### 2. Set up Subscriptions in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **Features** → **In-App Purchases**
4. Click the **+** button to create a new subscription group

#### Create Subscription Group

- **Reference Name**: "Lottery Pro Subscription"
- Click **Create**

#### Add Subscriptions

Create two subscriptions in the group:

##### Monthly Subscription
- **Product ID**: `com.lotterypro.subscription.monthly`
- **Reference Name**: "Lottery Pro Monthly"
- **Subscription Duration**: 1 month
- **Price**: Set your price (e.g., $9.99)

##### Yearly Subscription
- **Product ID**: `com.lotterypro.subscription.yearly`
- **Reference Name**: "Lottery Pro Annual"
- **Subscription Duration**: 1 year
- **Price**: Set your price (e.g., $99.99)

### 3. Configure Subscription Information

For each subscription:
- **Display Name**: "Monthly Subscription" / "Annual Subscription"
- **Description**: Describe what users get
- Upload a **screenshot** for review (can be a simple app screenshot)

### 4. Set up Auto-Renewable Subscription Information

- **Subscription Group Display Name**: "Lottery Pro"
- Upload **App Store Promotion Image** (optional)

### 5. Tax Category

Select appropriate tax category (usually "Software")

### 6. Submit for Review

Once configured, submit your in-app purchases for review along with your app.

---

## Google Play Console Setup (Android)

### 1. Create a Subscription Product

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Navigate to **Monetize** → **Products** → **Subscriptions**
4. Click **Create subscription**

#### Monthly Subscription

- **Product ID**: `com.lotterypro.subscription.monthly`
- **Name**: "Lottery Pro Monthly"
- **Description**: Describe the subscription

##### Add Base Plan

- **Billing period**: Monthly
- **Price**: Set your price (e.g., $9.99)
- **Renewal type**: Auto-renewing

#### Yearly Subscription

- **Product ID**: `com.lotterypro.subscription.yearly`
- **Name**: "Lottery Pro Annual"
- **Description**: Describe the subscription

##### Add Base Plan

- **Billing period**: Yearly (12 months)
- **Price**: Set your price (e.g., $99.99)
- **Renewal type**: Auto-renewing

### 2. Activate Subscriptions

Click **Activate** for each subscription product.

### 3. Set up License Tester

1. Go to **Setup** → **License testing**
2. Add test Gmail accounts that can make test purchases
3. Set **License response** to "RESPOND_NORMALLY"

---

## Configuration

### Update Product IDs

Edit `src/config/subscriptionConfig.ts` with your actual product IDs:

```typescript
export const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    ios: 'com.lotterypro.subscription.monthly',      // Your iOS product ID
    android: 'com.lotterypro.subscription.monthly',  // Your Android product ID
  },
  yearly: {
    ios: 'com.lotterypro.subscription.yearly',       // Your iOS product ID
    android: 'com.lotterypro.subscription.yearly',   // Your Android product ID
  },
};
```

**Note**: Product IDs must exactly match what you created in App Store Connect and Google Play Console.

### Update App Bundle Identifiers

Make sure your app's bundle identifier matches:

#### iOS (ios/LotteryPro.xcodeproj)
- Bundle Identifier: `com.lotterypro` (or your actual bundle ID)

#### Android (android/app/build.gradle)
```gradle
defaultConfig {
    applicationId "com.lotterypro"  // Your actual app ID
}
```

---

## Testing

### iOS Testing

1. **Use Sandbox Testers**:
   - Go to App Store Connect → **Users and Access** → **Sandbox Testers**
   - Create test accounts
   - Sign out of your Apple ID on your device
   - Run the app and when prompted to sign in, use the sandbox test account

2. **Test the Purchase Flow**:
   - Launch the app
   - Try purchasing a subscription
   - The sandbox environment won't charge real money

3. **Test Restore**:
   - Delete the app
   - Reinstall
   - Use "Restore Purchase" button

### Android Testing

1. **Add License Testers**:
   - Already done in Google Play Console setup above
   - Use a device/emulator signed in with a tester account

2. **Upload to Internal Testing**:
   - Create an internal testing track
   - Upload an APK/AAB with the billing library integrated
   - Add testers to the track

3. **Test Purchases**:
   - Install from internal testing
   - Purchases will be test purchases (no real charges)

---

## Implementation Details

### Files Created

1. **`src/config/subscriptionConfig.ts`**
   - Contains product IDs and subscription tiers
   - Platform-specific product ID mapping

2. **`src/services/paymentService.ts`**
   - Handles all IAP operations
   - Purchase flow, restoration, receipt validation
   - Subscription status management

3. **`src/contexts/SubscriptionContext.tsx`**
   - React context for subscription state
   - Provides `useSubscription()` hook across the app

4. **`src/screens/PaywallScreen.tsx`**
   - UI for displaying subscription options
   - Handles purchase and restore actions

### Usage in Your App

#### Wrap your app with SubscriptionProvider

Edit `App.tsx`:

```typescript
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';

export default function App() {
  return (
    <SubscriptionProvider>
      {/* Your app components */}
    </SubscriptionProvider>
  );
}
```

#### Check Subscription Status

Use the `useSubscription` hook in any component:

```typescript
import { useSubscription } from '../contexts/SubscriptionContext';

function MyComponent() {
  const { isSubscribed, subscriptionStatus } = useSubscription();

  if (!isSubscribed) {
    // Show paywall or limited features
    return <PaywallScreen />;
  }

  // Show full app features
  return <FullAppContent />;
}
```

#### Navigate to Paywall

In `LoginScreen.tsx`, after successful login, navigate to Paywall:

```typescript
// Replace this:
navigation.replace('MainTabs');

// With this:
navigation.replace('Paywall');
```

The Paywall screen will automatically check subscription status and navigate to MainTabs if subscribed.

---

## Subscription Flow

### New User Flow
1. User opens app
2. User logs in
3. Redirected to `PaywallScreen`
4. User selects a plan and subscribes
5. On successful purchase, navigates to `MainTabs`

### Existing Subscriber Flow
1. User opens app
2. User logs in
3. SubscriptionContext automatically checks status
4. If subscribed, redirects to `MainTabs`
5. If expired, shows `PaywallScreen`

### Restore Flow
1. User reinstalls app or logs in on new device
2. Goes to `PaywallScreen`
3. Taps "Restore Purchase"
4. Previous subscription is restored
5. Navigates to `MainTabs`

---

## Troubleshooting

### iOS Issues

**Problem**: "Cannot connect to App Store"
- **Solution**: Make sure you're signed in with a Sandbox tester account

**Problem**: Products not loading
- **Solution**:
  - Verify product IDs match exactly
  - Ensure subscriptions are "Ready to Submit" in App Store Connect
  - Wait 2-4 hours after creating products for them to propagate

**Problem**: "This In-App Purchase has already been bought"
- **Solution**: Delete the app, reinstall, and try again (sandbox issue)

### Android Issues

**Problem**: "Item not available for purchase"
- **Solution**:
  - Ensure subscriptions are activated in Google Play Console
  - Use an account added to license testers
  - App must be uploaded to at least internal testing track

**Problem**: Billing library errors
- **Solution**: Make sure `react-native-iap` is properly installed and linked

### General Issues

**Problem**: Subscription not detected after purchase
- **Solution**: Check `AsyncStorage` for `@subscription_status` key

**Problem**: Purchases working in test but not production
- **Solution**:
  - Submit in-app purchases for review in App Store Connect
  - Activate subscriptions in Google Play Console
  - Wait for app review approval

---

## Production Checklist

Before going live:

- [ ] Replace all product IDs with final production IDs
- [ ] Test subscriptions thoroughly with sandbox/test accounts
- [ ] Submit in-app purchases for Apple review
- [ ] Activate subscriptions in Google Play Console
- [ ] Add privacy policy and terms of service links in PaywallScreen
- [ ] Implement server-side receipt validation (recommended for production)
- [ ] Set up subscription management in your backend
- [ ] Test restore purchases on multiple devices
- [ ] Verify subscription expiration handling
- [ ] Add analytics to track subscription events

---

## Backend Integration (Optional but Recommended)

For production, you should validate receipts on your backend:

### iOS Receipt Validation
- Send receipt to your server
- Server validates with Apple's verification endpoint
- Store subscription status in database

### Android Receipt Validation
- Send purchase token to your server
- Server validates with Google Play Developer API
- Store subscription status in database

This prevents client-side manipulation and provides accurate subscription tracking.

---

## Additional Resources

- [Apple In-App Purchase Documentation](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing Documentation](https://developer.android.com/google/play/billing)
- [react-native-iap Documentation](https://github.com/dooboolab/react-native-iap)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review react-native-iap GitHub issues
3. Verify product IDs match exactly on both platforms
4. Ensure billing is set up correctly in both app stores

Happy monetizing! 🚀
