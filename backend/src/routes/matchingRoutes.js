const express = require('express');
const router = express.Router();

// Matching routes
router.get('/', (req, res) => {
  res.json({ message: 'Get matching results' });
});

module.exports = router;
