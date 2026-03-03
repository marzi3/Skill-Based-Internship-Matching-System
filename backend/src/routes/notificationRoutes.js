const express = require('express');
const router = express.Router();

// Notification routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all notifications' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create notification' });
});

module.exports = router;
