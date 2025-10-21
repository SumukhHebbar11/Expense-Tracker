// firebase-messaging-sw.js
// Service Worker for handling background push notifications

// Import Firebase scripts for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Your Firebase configuration
// Note: In service workers, we can't use import.meta.env, so these are hardcoded
// Make sure to update these values when deploying
const firebaseConfig = {
  apiKey: "AIzaSyCsJEq5XBvwmfHak9gD0sWLpKIikZ6Eezo",
  authDomain: "expense-tracker-85774.firebaseapp.com",
  projectId: "expense-tracker-85774",
  storageBucket: "expense-tracker-85774.firebasestorage.app",
  messagingSenderId: "983054829347",
  appId: "1:983054829347:web:c806a2dad5122c7f3cae96",
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log("[Service Worker] Background message received:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/logo192.png",
    badge: "/badge.png",
    vibrate: [200, 100, 200],
    data: {
      ...payload.data,
      url: payload.fcmOptions?.link || "/",
    },
    tag: "expense-tracker-notification",
    requireInteraction: false,
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event);

  event.notification.close();

  // Handle action clicks
  if (event.action === "close") {
    return;
  }

  // Get the URL to open (from notification data or default)
  const urlToOpen = event.notification.data?.url || "/";

  // Open or focus existing window
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if app is already open in a tab
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push events
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push event received:", event);

  if (!event.data) {
    console.log("[Service Worker] Push event had no data");
    return;
  }

  try {
    const data = event.data.json();
    console.log("[Service Worker] Push data:", data);
  } catch (error) {
    console.error("[Service Worker] Error parsing push data:", error);
  }
});

// Log service worker installation
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  self.skipWaiting();
});

// Log service worker activation
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(self.clients.claim());
});

console.log("[Service Worker] Firebase Messaging Service Worker loaded");
