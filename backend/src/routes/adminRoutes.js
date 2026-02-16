const express = require('express');
const router = express.Router();

// Admin routes
router.get('/users', (req, res) => {
  res.json({ message: 'Get all users' });
});

router.get('/analytics', (req, res) => {
  res.json({ message: 'Get analytics' });
});

module.exports = router;
