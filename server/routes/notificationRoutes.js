import express from "express";
import {
  savePushToken,
  removePushToken,
  getPushNotificationStatus,
  sendTestNotification,
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/notifications/push-token
 * @desc    Save user's FCM push token for notifications
 * @access  Private
 */
router.post("/push-token", savePushToken);

/**
 * @route   DELETE /api/notifications/push-token
 * @desc    Remove user's push token (unsubscribe from notifications)
 * @access  Private
 */
router.delete("/push-token", removePushToken);

/**
 * @route   GET /api/notifications/status
 * @desc    Get user's push notification status
 * @access  Private
 */
router.get("/status", getPushNotificationStatus);

/**
 * @route   POST /api/notifications/test
 * @desc    Send a test notification to verify setup
 * @access  Private
 */
router.post("/test", sendTestNotification);

export default router;
