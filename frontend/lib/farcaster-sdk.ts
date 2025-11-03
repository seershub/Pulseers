/**
 * Farcaster SDK Configuration
 * Pattern from SeersLeague + Base Docs
 */

import { sdk as farcasterSdk } from "@farcaster/frame-sdk";

export const sdk = farcasterSdk;

// Initialize SDK
export async function initializeFarcasterSDK() {
  try {
    const isInMiniApp = await sdk.isInMiniApp();
    if (isInMiniApp) {
      console.log("✅ Running in Farcaster Mini App");
      const context = await sdk.context;
      console.log("👤 User context:", context.user);
      console.log("📱 Client:", context.client);
      return context;
    } else {
      console.log("ℹ️ Not in Farcaster Mini App");
      return null;
    }
  } catch (error) {
    console.error("❌ Farcaster SDK initialization error:", error);
    return null;
  }
}

// Get user context
export async function getFarcasterUser() {
  try {
    const isInMiniApp = await sdk.isInMiniApp();
    if (isInMiniApp) {
      const context = await sdk.context;
      return context.user;
    }
    return null;
  } catch (error) {
    console.error("Error getting Farcaster user:", error);
    return null;
  }
}

// Check if in Mini App
export async function isInFarcasterMiniApp() {
  try {
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}
