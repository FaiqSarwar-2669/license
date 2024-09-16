// recentActivityRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.post('/create', NotificationController.generateNotifications);
router.get('/summary-count', AuthMiddleware.checkAuthorization, NotificationController.getSummaryCount);
router.get('/', AuthMiddleware.checkAuthorization, NotificationController.getAllNotifications);
router.get('/push-to-webhook', NotificationController.getNotificationsForWebhook);
// Optional: Get by ID if necessary
router.get('/:id', AuthMiddleware.checkAuthorization, NotificationController.getNotificationById);
router.put('/:id', AuthMiddleware.checkAuthorization, NotificationController.markAsRead);
module.exports = router;
