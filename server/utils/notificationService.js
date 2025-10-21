import { sendPushNotification } from "../config/firebase.js";
import { sendEmail } from "./sendEmail.js";

/**
 * Notification Service
 *
 * Handles sending notifications to users via push or email fallback
 */

/**
 * Send a daily reminder notification to a user
 * Tries push notification first, falls back to email if no push token
 *
 * @param {Object} user - User document from MongoDB
 * @param {string} user.email - User's email address
 * @param {string} user.username - User's name
 * @param {string} [user.pushToken] - User's FCM push token (optional)
 * @returns {Promise<Object>} - Result of notification attempt
 */
export const sendDailyReminder = async (user) => {
  const { email, username, pushToken } = user;

  const notificationTitle = "💰 Time to Track Your Day's Spending!";
  const notificationBody =
    "Don't forget to log your expenses for today. Keep your budget on point! ✨";

  try {
    // Attempt to send push notification if token exists
    if (pushToken) {
      try {
        const result = await sendPushNotification(
          pushToken,
          notificationTitle,
          notificationBody,
          {
            type: "daily_reminder",
            link: "/dashboard",
          }
        );

        console.log(`✅ Push notification sent to ${username} (${email})`);
        return {
          success: true,
          method: "push",
          user: username,
          email,
          messageId: result,
        };
      } catch (pushError) {
        console.warn(
          `⚠️  Push notification failed for ${username}, falling back to email`
        );

        // If token is invalid, we'll fall through to email
        // The calling function should handle removing invalid tokens
        if (pushError.message === "INVALID_TOKEN") {
          console.log(
            `🗑️  Invalid push token for ${username}, should be removed`
          );
        }
      }
    }

    // Fallback to email if no push token or push failed
    console.log(`📧 Sending email reminder to ${username} (${email})`);

    const emailSubject = notificationTitle;
    const emailText = notificationBody;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">🚀 Daily Reminder</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Hey <strong>${username}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Don't forget to check your Expense Tracker today! Stay on top of your finances. 💰
        </p>
        <div style="margin: 30px 0;">
          <a href="${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/dashboard" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Open App
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          You're receiving this because you have daily reminders enabled.
        </p>
      </div>
    `;

    await sendEmail(email, emailSubject, emailText, emailHtml);

    console.log(`✅ Email reminder sent to ${username} (${email})`);
    return {
      success: true,
      method: "email",
      user: username,
      email,
    };
  } catch (error) {
    console.error(
      `❌ Failed to send reminder to ${username} (${email}):`,
      error.message
    );
    return {
      success: false,
      user: username,
      email,
      error: error.message,
    };
  }
};

/**
 * Send daily reminders to all users
 *
 * @param {Array} users - Array of user documents
 * @returns {Promise<Object>} - Summary of notification results
 */
export const sendDailyRemindersToAllUsers = async (users) => {
  console.log(
    `\n📬 Starting daily reminder process for ${users.length} users...`
  );

  const results = {
    total: users.length,
    successful: 0,
    failed: 0,
    pushSent: 0,
    emailSent: 0,
    details: [],
    invalidTokens: [],
  };

  // Process all users
  for (const user of users) {
    try {
      const result = await sendDailyReminder(user);
      results.details.push(result);

      if (result.success) {
        results.successful++;
        if (result.method === "push") {
          results.pushSent++;
        } else {
          results.emailSent++;
        }
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(
        `❌ Error processing user ${user.username}:`,
        error.message
      );
      results.failed++;
      results.details.push({
        success: false,
        user: user.username,
        email: user.email,
        error: error.message,
      });
    }

    // Small delay between users to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Log summary
  console.log("\n📊 Daily Reminder Summary:");
  console.log(`   Total Users: ${results.total}`);
  console.log(`   ✅ Successful: ${results.successful}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📱 Push Notifications: ${results.pushSent}`);
  console.log(`   📧 Email Fallbacks: ${results.emailSent}`);
  console.log("\n");

  return results;
};

/**
 * Send a test notification to verify setup
 *
 * @param {Object} user - User to send test to
 * @returns {Promise<Object>} - Result of test
 */
export const sendTestNotification = async (user) => {
  const { email, username, pushToken } = user;

  try {
    if (pushToken) {
      await sendPushNotification(
        pushToken,
        "Test Notification",
        `Hi ${username}, your push notifications are working! ✅`,
        {
          type: "test",
          link: "/settings",
        }
      );

      return {
        success: true,
        method: "push",
        message: "Test push notification sent successfully",
      };
    } else {
      // Send test email
      await sendEmail(
        email,
        "Test Notification - Push Token Missing",
        `Hi ${username}, you don't have push notifications enabled. This is a test email fallback.`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Notification</h2>
          <p>Hi <strong>${username}</strong>,</p>
          <p>You don't have push notifications enabled yet. This is a test email fallback.</p>
          <p>Enable push notifications in your settings to receive instant updates!</p>
        </div>
        `
      );

      return {
        success: true,
        method: "email",
        message: "Test email sent successfully (no push token found)",
      };
    }
  } catch (error) {
    console.error("❌ Test notification failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  sendDailyReminder,
  sendDailyRemindersToAllUsers,
  sendTestNotification,
};
