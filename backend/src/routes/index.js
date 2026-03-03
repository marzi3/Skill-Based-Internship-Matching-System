const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const internshipRoutes = require('./internshipRoutes');
const applicationRoutes = require('./applicationRoutes');
const matchingRoutes = require('./matchingRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes');
const searchRoutes = require('./searchRoutes');
const adminRoutes = require('./adminRoutes');
const verificationRoutes = require('./verificationRoutes');

// Route registration
router.use('/auth', authRoutes);
// Verification routes (new)
router.use('/verification', verificationRoutes);

router.use('/students', studentRoutes);
router.use('/internships', internshipRoutes);
router.use('/applications', applicationRoutes);
router.use('/matching', matchingRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
