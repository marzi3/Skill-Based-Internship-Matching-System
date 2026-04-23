require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const notificationService = require('./src/services/notificationService');

async function testNotifications() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_platform');

    // Find the latest registered student
    const student = await User.findOne({ role: 'student' }).sort({ createdAt: -1 });

    if (!student) {
        console.log('❌ No student users found to test with. Please register a student first.');
        process.exit(1);
    }

    console.log(`Sending test notifications to ${student.email}...`);

    try {
        // Test Event 1: New Match Recommendation
        await notificationService.notifyNewMatch(
            student._id,
            new mongoose.Types.ObjectId(), // Fake internship ID
            95,
            'EXCELLENT',
            'Software Engineering Intern',
            'TechGiant MERN Corp'
        );
        console.log('✅ Sent Match Notification');

        // Test Event 2: High Priority Interview (will bypass settings)
        await notificationService.notifyInterviewScheduled(
            student._id,
            'Frontend Developer',
            'Creative Agency Studio',
            new Date(Date.now() + 86400000).toLocaleString(), // Tomorrow
            new mongoose.Types.ObjectId() // Fake app ID
        );
        console.log('✅ Sent Interview Notification');

        console.log('\n✅ Success! Check your frontend browser at http://localhost:3000.');
        console.log('If you are logged into the student account, the notification bell should have two new alerts immediately.');

    } catch (err) {
        console.error('Failed:', err);
    } finally {
        process.exit(0);
    }
}

testNotifications();
