import User from "../models/User.js";
import { z } from "zod";

const pushTokenSchema = z.object({
  pushToken: z.string().min(1, "Push token is required"),
});

/**
 * @desc    Save user's FCM push token
 * @route   POST /api/notifications/push-token
 * @access  Private
 */
export const savePushToken = async (req, res) => {
  try {
    // Validate request body
    const validatedData = pushTokenSchema.parse(req.body);
    const { pushToken } = validatedData;

    // Get user ID from auth middleware (req.userId)
    const userId = req.userId;

    // Update user's push token
    const user = await User.findByIdAndUpdate(
      userId,
      { pushToken },
      { new: true, select: "username email pushToken" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`✅ Push token saved for user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Push token saved successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hasPushToken: !!user.pushToken,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    console.error("❌ Error saving push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save push token",
    });
  }
};

/**
 * @desc    Remove user's FCM push token (unsubscribe)
 * @route   DELETE /api/notifications/push-token
 * @access  Private
 */
export const removePushToken = async (req, res) => {
  try {
    const userId = req.userId;

    // Remove push token from user
    const user = await User.findByIdAndUpdate(
      userId,
      { $unset: { pushToken: 1 } },
      { new: true, select: "username email" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`🗑️  Push token removed for user: ${user.username}`);

    res.status(200).json({
      success: true,
      message: "Push notifications disabled successfully",
    });
  } catch (error) {
    console.error("❌ Error removing push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove push token",
    });
  }
};

/**
 * @desc    Get user's push notification status
 * @route   GET /api/notifications/status
 * @access  Private
 */
export const getPushNotificationStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("pushToken username email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      enabled: !!user.pushToken,
      hasPushToken: !!user.pushToken,
    });
  } catch (error) {
    console.error("❌ Error getting push notification status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification status",
    });
  }
};

/**
 * @desc    Send test notification to user
 * @route   POST /api/notifications/test
 * @access  Private
 */
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("username email pushToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Import notification service here to avoid circular dependencies
    const { sendTestNotification: sendTest } = await import(
      "../utils/notificationService.js"
    );

    const result = await sendTest(user);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        method: result.method,
      });
    } else if (result.tokenCleared) {
      // Token was invalid and has been cleared - return 400 with instructions
      res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
        tokenCleared: true,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test notification",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
    });
  }
};

export default {
  savePushToken,
  removePushToken,
  getPushNotificationStatus,
  sendTestNotification,
};
