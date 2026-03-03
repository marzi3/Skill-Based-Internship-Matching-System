const express = require('express');
const router = express.Router();
const { getMessagesByApplication, sendMessage, markMessageAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(sendMessage);

router.route('/:applicationId')
  .get(getMessagesByApplication);

router.route('/:id/read')
  .patch(markMessageAsRead);

module.exports = router;
