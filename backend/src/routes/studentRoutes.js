const express = require('express');
const router = express.Router();

// Student routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all students' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get student by ID' });
});

module.exports = router;
