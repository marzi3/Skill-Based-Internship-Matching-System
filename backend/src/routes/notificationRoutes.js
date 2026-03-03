const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/:id/read')
  .patch(markAsRead);

router.route('/:id')
  .delete(deleteNotification);

module.exports = router;
