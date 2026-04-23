const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Internship = require('../models/Internship'); // Assuming this exists or will exist
const notificationService = require('../services/notificationService');
const emailTemplates = require('../utils/emailTemplates');

function initCronJobs() {
    // 1. Daily Deadline Alert (Runs every day at 8:00 AM)
    // "Check internships expiring in 5 days. Send deadline reminder notification"
    cron.schedule('0 8 * * *', async () => {
        console.log('[Cron] Running Daily Deadline Alert job...');
        try {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 5);

            // Start of and end of target date to match any time within that day
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            // Find internships expiring in exactly 5 days
            // Note: Since Internship Posting is 'complete', we assume an applicationDeadline field
            const expiringInternships = await Internship.find({
                applicationDeadline: { $gte: startOfDay, $lte: endOfDay },
                status: 'open' // assuming some standard status
            });

            if (expiringInternships.length === 0) return;

            // For each expiring internship, find students who liked it/saved it/matched well
            // Since Student Profile isn't done, we'll just send to all students as a placeholder logic
            // In reality, this would query a 'SavedInternship' or 'Application' (drafts) table
            const students = await User.find({ role: 'student' });

            for (const internship of expiringInternships) {
                for (const student of students) {
                    await notificationService.notifyDeadlineApproaching(
                        student._id,
                        internship._id,
                        internship.title || 'Upcoming Internship',
                        internship.applicationDeadline.toDateString()
                    );
                }
            }
        } catch (err) {
            console.error('[Cron Error] Daily Deadline Alert failed:', err);
        }
    });

    // 2. Weekly Digest (Runs every Sunday at 9:00 AM)
    // "Send summary email of: Matches, Status updates, Messages"
    cron.schedule('0 9 * * 0', async () => {
        console.log('[Cron] Running Weekly Digest job...');
        try {
            // Find users who have email enabled and want weekly digests...
            // Or just process any PENDING emailNotifications older than 7 days?
            // Spec says "Send summary email of Matches, Status updates, Messages" 
            const users = await User.find({
                role: 'student',
                'notificationPreferences.emailEnabled': true
            });

            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            for (const user of users) {
                // Find unread/pending notifications from the last week
                const recentNotifs = await Notification.find({
                    userId: user._id,
                    createdAt: { $gte: oneWeekAgo },
                    // Combine them regardless of in-app read status, or only unread ones?
                    // Usually digest summarizes all activities of those types
                    type: { $in: ['MATCH', 'STATUS_CHANGE', 'MESSAGE'] }
                });

                if (recentNotifs.length === 0) continue;

                const matchCount = recentNotifs.filter(n => n.type === 'MATCH').length;
                const statusCount = recentNotifs.filter(n => n.type === 'STATUS_CHANGE').length;
                const messageCount = recentNotifs.filter(n => n.type === 'MESSAGE').length;

                // Use the trigger function with the consolidated count
                // We'll repurpose 'notifyWeeklyMatchReport' to handle the full digest context
                // But for now, just sending the match count as per the existing trigger
                await notificationService.notifyWeeklyMatchReport(user._id, matchCount + statusCount + messageCount);
            }
        } catch (err) {
            console.error('[Cron Error] Weekly Digest failed:', err);
        }
    });

    console.log('[Cron] Notification jobs initialized.');
}

module.exports = { initCronJobs };
