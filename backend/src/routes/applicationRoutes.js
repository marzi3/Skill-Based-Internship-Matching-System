const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitApplication,
  applyToInternship,
  getMyApplications,
  getApplicationById,
  getApplicationStudentProfile,
  withdrawApplication,
  addApplicationMessage,
  getEmployerApplications,
  updateApplicationStatus,
  scheduleInterview,
  getStudentStats
} = require('../controllers/applicationController');

// All application routes are protected
router.use(protect);

// Student routes
router.get('/student/stats', authorize('student'), getStudentStats);
router.post('/', authorize('student'), submitApplication);
router.get('/me', authorize('student'), getMyApplications);
router.post('/apply/:id', authorize('student'), applyToInternship);

// Employer routes
router.get('/employer', authorize('employer', 'admin'), getEmployerApplications);

// Shared application routes
router.get('/:id/student-profile', getApplicationStudentProfile);
router.get('/:id', getApplicationById);
router.patch('/:id/withdraw', authorize('student'), withdrawApplication);
router.post('/:id/messages', addApplicationMessage);
router.patch('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);
router.post('/:id/interview', authorize('employer', 'admin'), scheduleInterview);

module.exports = router;
