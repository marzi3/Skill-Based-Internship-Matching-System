const express = require('express');
const router = express.Router();

// Search routes
router.get('/', (req, res) => {
  res.json({ message: 'Search internships' });
});

module.exports = router;
