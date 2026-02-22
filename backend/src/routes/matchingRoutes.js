const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

// Match internships for a specific student
router.post('/internships', matchingController.matchInternshipsForStudent);

// Match students for a specific internship
router.post('/students', matchingController.matchStudentsForInternship);

// Get detailed explanation of a match score
router.get('/explain/:studentId/:internshipId', matchingController.explainMatch);

module.exports = router;
