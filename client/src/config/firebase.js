import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

/**
 * Firebase Configuration for Push Notifications
 *
 * This file initializes Firebase and provides functions to:
 * 1. Request permission for notifications
 * 2. Get FCM token to send to backend
 * 3. Listen for foreground messages
 */

// Your web app's Firebase configuration
// Get these from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// VAPID key for web push (get from Firebase Console > Project Settings > Cloud Messaging)
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app = null;
let messaging = null;

/**
 * Initialize Firebase
 */
export const initializeFirebase = () => {
  try {
    // Check if all required config values are present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn(
        "⚠️  Firebase configuration incomplete. Push notifications will not work."
      );
      return null;
    }

    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log("✅ Firebase initialized");
    }

    return app;
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
    return null;
  }
};

/**
 * Get Firebase Messaging instance
 */
export const getFirebaseMessaging = () => {
  if (!app) {
    initializeFirebase();
  }

  if (!messaging && app) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("❌ Error getting messaging instance:", error);
      return null;
    }
  }

  return messaging;
};

/**
 * Request notification permission and get FCM token
 *
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const requestNotificationPermission = async () => {
  try {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.warn("⚠️  This browser does not support notifications");
      throw new Error("Browser does not support notifications");
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️  Service workers not supported");
      throw new Error("Service workers are not supported in this browser");
    }

    // Request permission
    console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("📋 Permission result:", permission);

    if (permission !== "granted") {
      console.log("ℹ️  Notification permission denied");
      throw new Error("Notification permission was denied");
    }

    console.log("✅ Notification permission granted");

    // Check Firebase config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error("❌ Firebase config incomplete:", {
        hasApiKey: !!firebaseConfig.apiKey,
        hasProjectId: !!firebaseConfig.projectId,
      });
      throw new Error(
        "Firebase configuration is incomplete. Check your .env file."
      );
    }

    // Get messaging instance
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      console.error("❌ Firebase messaging not available");
      throw new Error("Firebase messaging could not be initialized");
    }

    if (!vapidKey) {
      console.error("❌ VAPID key not configured");
      throw new Error(
        "VAPID key is missing. Check VITE_FIREBASE_VAPID_KEY in .env"
      );
    }

    // Register service worker
    console.log("📝 Registering service worker...");
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("✅ Service worker registered:", registration);

    // Wait for service worker to be ready
    console.log("⏳ Waiting for service worker to be ready...");
    await navigator.serviceWorker.ready;
    console.log("✅ Service worker ready");

    // Get FCM token
    console.log("🔑 Getting FCM token...");
    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");
      return token;
    } else {
      console.warn("⚠️  No registration token available");
      throw new Error("Failed to get FCM token. Token was empty.");
    }
  } catch (error) {
    console.error("❌ Error getting notification permission:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    throw error; // Re-throw so the calling code can handle it
  }
};

/**
 * Listen for foreground messages (when app is open)
 *
 * @param {Function} callback - Function to call when message received
 * @returns {Function|null} Unsubscribe function
 */
export const onForegroundMessage = (callback) => {
  const messagingInstance = getFirebaseMessaging();

  if (!messagingInstance) {
    console.warn(
      "⚠️  Cannot listen for messages: Firebase messaging not available"
    );
    return null;
  }

  return onMessage(messagingInstance, (payload) => {
    console.log("📬 Foreground message received:", payload);

    // Show browser notification
    if (payload.notification) {
      const { title, body } = payload.notification;

      // Show notification using Notification API
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: payload.notification.icon || "/logo192.png",
          badge: payload.notification.badge || "/badge.png",
          data: payload.data,
          tag: "expense-tracker-notification",
        });
      }
    }

    // Call custom callback
    if (callback && typeof callback === "function") {
      callback(payload);
    }
  });
};

/**
 * Check current notification permission status
 *
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
};

/**
 * Check if push notifications are supported
 *
 * @returns {boolean}
 */
export const isPushNotificationSupported = () => {
  return (
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
};

export default {
  initializeFirebase,
  getFirebaseMessaging,
  requestNotificationPermission,
  onForegroundMessage,
  getNotificationPermission,
  isPushNotificationSupported,
};
