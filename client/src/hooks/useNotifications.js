import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  getNotificationPermission,
  isPushNotificationSupported,
  onForegroundMessage,
  initializeFirebase,
} from "../config/firebase";
import { authAPI } from "../utils/api";

/**
 * Custom Hook for managing push notifications
 *
 * Provides functions to:
 * - Check notification support and permission
 * - Request notification permission
 * - Subscribe/unsubscribe from notifications
 * - Listen for foreground messages
 */
export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Firebase and check support
  useEffect(() => {
    initializeFirebase();
    setIsSupported(isPushNotificationSupported());
    setPermission(getNotificationPermission());
  }, []);

  // Check if user is already subscribed (has push token in backend)
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await authAPI.getNotificationStatus();
        setIsSubscribed(response.enabled);
      } catch (err) {
        console.error("Error checking notification status:", err);
      }
    };

    if (isSupported && permission === "granted") {
      checkSubscriptionStatus();
    }
  }, [isSupported, permission]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || permission !== "granted") {
      return;
    }

    const unsubscribe = onForegroundMessage((payload) => {
      console.log("📬 Received foreground message:", payload);
      // You can handle the message here (show toast, update UI, etc.)
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isSupported, permission]);

  /**
   * Refresh subscription status from backend
   */
  const refreshStatus = useCallback(async () => {
    try {
      const response = await authAPI.getNotificationStatus();
      setIsSubscribed(response.enabled);
      setPermission(getNotificationPermission());
      return { success: true, enabled: response.enabled };
    } catch (err) {
      console.error("Error refreshing notification status:", err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Subscribe to push notifications
   * Requests permission, gets FCM token, and sends to backend
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser");
      return { success: false, error: "not_supported" };
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Starting notification subscription...");
      // Always request permission and get a fresh token
      const token = await requestNotificationPermission();
      console.log("🔑 Token received:", token);

      if (!token) {
        const currentPermission = getNotificationPermission();
        console.log(
          "❌ No token received. Current permission:",
          currentPermission
        );
        setError(
          "Failed to get notification permission. Check browser console for details."
        );
        setPermission(currentPermission);
        return { success: false, error: "permission_denied" };
      }

      // Send token to backend
      const response = await authAPI.savePushToken(token);
      console.log("📡 Backend response:", response);

      if (response.success) {
        setIsSubscribed(true);
        setPermission("granted");
        await refreshStatus(); // Ensure UI is up to date
        console.log("✅ Successfully subscribed to push notifications");
        return { success: true, token };
      } else {
        throw new Error(response.message || "Failed to save push token");
      }
    } catch (err) {
      console.error("❌ Error subscribing to notifications:", err);
      let errorMessage = "Failed to subscribe to notifications";
      if (err.message) errorMessage = err.message;
      else if (err.response?.data?.message)
        errorMessage = err.response.data.message;
      if (err.message?.includes("VAPID"))
        errorMessage += " (Check VAPID key configuration)";
      else if (err.message?.includes("Firebase"))
        errorMessage += " (Check Firebase configuration)";
      else if (err.message?.includes("Service worker"))
        errorMessage += " (Service worker issue)";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isSupported, refreshStatus]);

  /**
   * Unsubscribe from push notifications
   * Removes push token from backend
   */
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.removePushToken();
      console.log("🗑️ Backend response:", response);
      if (response.success) {
        setIsSubscribed(false);
        await refreshStatus(); // Ensure UI is up to date
        console.log("✅ Successfully unsubscribed from push notifications");
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to unsubscribe");
      }
    } catch (err) {
      console.error("❌ Error unsubscribing from notifications:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to unsubscribe";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  /**
   * Send a test notification
   */
  const sendTestNotification = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.sendTestNotification();

      if (response.success) {
        console.log("✅ Test notification sent:", response.method);
        return { success: true, method: response.method };
      } else {
        throw new Error(response.message || "Failed to send test notification");
      }
    } catch (err) {
      console.error("❌ Error sending test notification:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,

    // Actions
    subscribe,
    unsubscribe,
    sendTestNotification,
    refreshStatus,

    // Computed
    canSubscribe: isSupported && permission !== "denied",
    needsPermission: isSupported && permission === "default",
  };
};

export default useNotifications;
