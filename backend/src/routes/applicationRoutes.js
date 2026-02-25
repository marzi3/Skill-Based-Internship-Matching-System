const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyToInternship,
  getEmployerApplications,
  updateApplicationStatus,
  getStudentStats
} = require('../controllers/applicationController');

// All application routes are protected
router.use(protect);

// Student routes
router.get('/student/stats', authorize('student'), getStudentStats);
router.post('/apply/:id', authorize('student'), applyToInternship);

// Employer routes
router.get('/employer', authorize('employer', 'admin'), getEmployerApplications);
router.patch('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
