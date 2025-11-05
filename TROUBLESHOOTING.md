# Troubleshooting Guide

## Common Console Warnings/Errors

### 1. Reown Config 403 Error
**Error:** `[Reown Config] Failed to fetch remote project configuration. Using local/default values. Error: HTTP status code: 403`

**Explanation:**
- This is a **harmless warning** that occurs because the default WalletConnect project ID doesn't have remote configuration enabled
- Wallet connections still work perfectly fine
- The error is now suppressed in the console

**Solution:**
- Get your own free project ID from https://cloud.walletconnect.com
- Add it to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id`
- This will eliminate the warning

### 2. WalletConnect Core Initialized Twice
**Warning:** `WalletConnect Core is already initialized. This is probably a mistake and can lead to unexpected behavior. Init() was called 2 times.`

**Explanation:**
- This happens in development mode because React 18's StrictMode intentionally renders components twice to catch bugs
- It's a development-only issue and doesn't affect production
- WalletConnect has guards to prevent actual double initialization

**Solution:**
- This is expected behavior in development
- It won't happen in production builds
- If it's bothering you, you can disable StrictMode in `next.config.js` (not recommended):
  ```js
  reactStrictMode: false,
  ```

### 3. Multiple Versions of Lit Loaded
**Warning:** `Multiple versions of Lit loaded. Loading multiple versions is not recommended.`

**Explanation:**
- Some dependencies (likely @rainbow-me/rainbowkit or related packages) include different versions of Lit
- This is a transitive dependency conflict
- It doesn't break functionality, just adds extra bundle size

**Solution:**
- The warning is now suppressed in webpack config
- To fully resolve, you can add to `package.json`:
  ```json
  "resolutions": {
    "@lit/reactive-element": "^1.0.0",
    "lit": "^2.0.0"
  }
  ```
- Then run `npm install` (Note: resolutions only works with npm, not yarn)

## All of These Are Non-Critical

All three issues are:
- ✅ **Non-breaking** - They don't prevent the app from working
- ✅ **Development-only** - Most won't appear in production
- ✅ **Harmless** - They're warnings, not errors

The app is fully functional despite these warnings!

