const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleAuthCallback,
  linkedinAuthCallback,
  forgotPassword,
  resetPassword,
  updateProfile,
  updatePassword,
  getStudents,
  getEmployerPublicProfile,
  getStudentPublicProfile
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Standard Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.get('/students', protect, authorize('employer', 'admin'), getStudents);
router.get('/students/:id', getStudentPublicProfile);
router.get('/employers/:id', getEmployerPublicProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleAuthCallback
);

// LinkedIn OAuth
router.get('/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
router.get('/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  linkedinAuthCallback
);

module.exports = router;
