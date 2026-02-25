const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSavedInternships,
  bookmarkInternship,
  unbookmarkInternship
} = require('../controllers/studentController');

// Apply protection to all student routes
router.use(protect);
router.use(authorize('student'));

// Bookmark routes
router.get('/bookmarks', getSavedInternships);
router.post('/bookmarks/:id', bookmarkInternship);
router.delete('/bookmarks/:id', unbookmarkInternship);

module.exports = router;
