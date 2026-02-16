const express = require('express');
const router = express.Router();

// Internship routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all internships' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create internship' });
});

module.exports = router;
