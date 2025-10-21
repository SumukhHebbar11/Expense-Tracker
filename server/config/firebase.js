import admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK
 *
 * This service is used to send push notifications to users via Firebase Cloud Messaging (FCM)
 * Requires service account credentials from Firebase Console
 */

let firebaseApp = null;

export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (firebaseApp) {
      console.log("✅ Firebase Admin already initialized");
      return firebaseApp;
    }

    // Get credentials from environment variables
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
      process.env;

    // Validate required credentials
    if (
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      console.warn(
        "⚠️  Firebase credentials not configured. Push notifications will be disabled."
      );
      return null;
    }

    // Initialize Firebase Admin with service account
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in private key
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error.message);
    return null;
  }
};

/**
 * Get Firebase Admin messaging instance
 * @returns {admin.messaging.Messaging | null}
 */
export const getMessaging = () => {
  if (!firebaseApp) {
    console.warn(
      "⚠️  Firebase not initialized. Cannot get messaging instance."
    );
    return null;
  }
  return admin.messaging();
};

/**
 * Send push notification to a single device
 *
 * @param {string} token - FCM device token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<string>} - Message ID if successful
 */
export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const messaging = getMessaging();

    if (!messaging) {
      throw new Error("Firebase messaging not available");
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        clickAction: "FLUTTER_NOTIFICATION_CLICK", // For handling clicks
      },
      webpush: {
        notification: {
          icon: "/logo192.png", // Your app icon
          badge: "/badge.png", // Badge icon
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: data.link || "/", // Where to navigate on click
        },
      },
    };

    const response = await messaging.send(message);
    console.log("✅ Push notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending push notification:", error.message);

    // Handle specific FCM errors
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      console.warn(
        "⚠️  Invalid or expired token. Token should be removed from database."
      );
      throw new Error("INVALID_TOKEN");
    }

    throw error;
  }
};

/**
 * Send push notifications to multiple devices
 *
 * @param {Array<string>} tokens - Array of FCM device tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload (optional)
 * @returns {Promise<Object>} - Success and failure counts
 */
export const sendBulkPushNotifications = async (
  tokens,
  title,
  body,
  data = {}
) => {
  try {
    const messaging = getMessaging();

    if (!messaging) {
      throw new Error("Firebase messaging not available");
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
      webpush: {
        notification: {
          icon: "/logo192.png",
          badge: "/badge.png",
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: data.link || "/",
        },
      },
      tokens, // Send to multiple tokens at once
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `✅ Bulk notifications sent: ${response.successCount} successful, ${response.failureCount} failed`
    );

    // Log failed tokens for cleanup
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx],
            error: resp.error.message,
          });
        }
      });
      console.warn("⚠️  Failed tokens:", failedTokens);
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error("❌ Error sending bulk push notifications:", error.message);
    throw error;
  }
};

export default {
  initializeFirebase,
  getMessaging,
  sendPushNotification,
  sendBulkPushNotifications,
};
