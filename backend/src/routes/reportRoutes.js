const express = require('express');
const router = express.Router();
const { createReport, getMyReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createReport);
router.get('/my-reports', getMyReports);

module.exports = router;
