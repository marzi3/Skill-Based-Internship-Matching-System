const express = require('express');
const router = express.Router();
const {
  getInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  getMyInternships,
  getSkillDemands,
  updateInternshipStatus
} = require('../controllers/internshipController');
const { protect, authorize, verifyStatus } = require('../middleware/auth');

// Public routes
router.get('/', getInternships);

// Protected routes (Employer only)
router.use(protect);
router.use(authorize('employer', 'admin'));

router.get('/my-postings', getMyInternships);
router.get('/skill-demands', getSkillDemands);
router.patch('/:id/status', updateInternshipStatus);
router.post('/create', verifyStatus, createInternship);
router.put('/:id', updateInternship);
router.delete('/:id', deleteInternship);

// Route with param should be last to avoid catching sub-routes
router.get('/:id', getInternship);

module.exports = router;
