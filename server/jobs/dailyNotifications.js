import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Daily Notifications Cron Job
 *
 * Sends daily reminder notifications to all verified users at 9:00 AM via EMAIL
 * No Firebase/Push notifications required - just email reminders
 *
 * Cron expression: '0 9 * * *'
 */

let dailyNotificationJob = null;

/**
 * Send daily email reminder to a user
 */
const sendDailyEmailReminder = async (user) => {
  const { email, username } = user;

  try {
    await sendEmail(
      email,
      "Daily Reminder - Expense Tracker",
      `Hey ${username}, don't forget to check your app today! 🚀`,
      `
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
      `
    );

    console.log(`✅ Email reminder sent to ${username} (${email})`);
    return { success: true, user: username, email };
  } catch (error) {
    console.error(
      `❌ Failed to send reminder to ${username} (${email}):`,
      error.message
    );
    return { success: false, user: username, email, error: error.message };
  }
};

/**
 * Initialize and start the daily notification cron job
 */
export const startDailyNotificationJob = () => {
  // Prevent duplicate jobs
  if (dailyNotificationJob) {
    console.log("⚠️  Daily notification job already running");
    return;
  }

  // Schedule job for 9:00 AM every day
  // Change '0 9 * * *' to your desired time
  // Examples:
  // - '0 9 * * *'  = 9:00 AM every day
  // - '30 8 * * *' = 8:30 AM every day
  // - '0 12 * * *' = 12:00 PM (noon) every day
  // - '0 18 * * *' = 6:00 PM every day
  // - '*/5 * * * *' = Every 5 minutes (for testing)

  dailyNotificationJob = cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("\n🔔 Daily Notification Cron Job Started");
      console.log(`⏰ Triggered at: ${new Date().toLocaleString()}`);

      try {
        // Fetch all verified users from the database
        const users = await User.find({ isVerified: true })
          .select("username email")
          .lean();

        if (users.length === 0) {
          console.log("ℹ️  No verified users found. Skipping notifications.");
          return;
        }

        console.log(`📋 Found ${users.length} verified users`);

        // Send email reminders to all users
        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
          const result = await sendDailyEmailReminder(user);
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }

          // Small delay between emails to avoid rate limits
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log("\n📊 Daily Reminder Summary:");
        console.log(`   Total Users: ${users.length}`);
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);
        console.log("✅ Daily notification job completed successfully\n");
      } catch (error) {
        console.error("❌ Daily notification job failed:", error.message);
        console.error(error.stack);
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || "America/New_York", // Set your timezone
      // Common timezones:
      // - 'America/New_York' (EST/EDT)
      // - 'America/Chicago' (CST/CDT)
      // - 'America/Los_Angeles' (PST/PDT)
      // - 'Europe/London' (GMT/BST)
      // - 'Asia/Kolkata' (IST)
      // - 'Asia/Tokyo' (JST)
    }
  );

  console.log("✅ Daily notification cron job started");
  console.log("⏰ Scheduled to run every day at 9:00 AM");
  console.log(`🌍 Timezone: ${process.env.TZ || "America/New_York"}`);
};

/**
 * Stop the daily notification cron job
 */
export const stopDailyNotificationJob = () => {
  if (dailyNotificationJob) {
    dailyNotificationJob.stop();
    dailyNotificationJob = null;
    console.log("🛑 Daily notification cron job stopped");
  }
};

/**
 * Manually trigger the daily notification job (for testing)
 */
export const triggerDailyNotificationNow = async () => {
  console.log("\n🧪 Manually triggering daily notifications (TEST MODE)");

  try {
    const users = await User.find({ isVerified: true })
      .select("username email")
      .lean();

    if (users.length === 0) {
      console.log("ℹ️  No verified users found");
      return { success: false, message: "No verified users found" };
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const result = await sendDailyEmailReminder(user);
      if (result.success) successCount++;
      else failCount++;
    }

    console.log("✅ Manual notification trigger completed\n");

    return {
      success: true,
      results: { total: users.length, successCount, failCount },
    };
  } catch (error) {
    console.error("❌ Manual notification trigger failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get status of the cron job
 */
export const getDailyNotificationJobStatus = () => {
  return {
    isRunning: dailyNotificationJob !== null,
    schedule: "0 9 * * *",
    timezone: process.env.TZ || "America/New_York",
    description: "Daily reminders at 9:00 AM",
  };
};

export default {
  startDailyNotificationJob,
  stopDailyNotificationJob,
  triggerDailyNotificationNow,
  getDailyNotificationJobStatus,
};
