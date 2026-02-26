const express = require('express');
const router = express.Router();
const {
  getProfile,
  initializeProfile,
  savePersonalInfo,
  saveEducation,
  addSkill,
  removeSkill,
  getSkills,
  getEducation,
  removeEducation,
  updatePortfolio,
  getProfileCompletion,
  uploadProfileImage,
  uploadCoverImage,
  addCertification,
  removeCertification,
  uploadResume,
  resetProfile,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Protect all routes with authentication
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.post('/profile/init', initializeProfile);
router.get('/profile/completion', getProfileCompletion);

// Personal information routes
router.post('/profile/personal', savePersonalInfo);
router.post('/profile/image', upload.single('profileImage'), uploadProfileImage);
router.post('/profile/cover', upload.single('coverImage'), uploadCoverImage);

// Education routes
router.get('/profile/education', getEducation);
router.post('/profile/education', saveEducation);
router.delete('/profile/education/:educationId', removeEducation);

// Skills routes
router.get('/profile/skills', getSkills);
router.post('/profile/skill', addSkill);
router.delete('/profile/skill/:skillId', removeSkill);

// Portfolio routes
router.post('/profile/portfolio', updatePortfolio);

// Certification routes
router.post('/profile/certification', addCertification);
router.delete('/profile/certification/:certificationId', removeCertification);

// Resume routes
router.post('/profile/resume', upload.single('resume'), uploadResume);

// Reset profile route
router.delete('/profile/reset', resetProfile);

module.exports = router;
