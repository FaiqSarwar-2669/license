// recentActivityRoutes.js
const express = require('express');
const router = express.Router();
const RecentActivityController = require('../controllers/recentActivityController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { recentActivityValidation } = require('../middlewares/validation');

router.post('/', AuthMiddleware.checkAuthorization, recentActivityValidation, RecentActivityController.create);
router.get('/', AuthMiddleware.checkAuthorization, RecentActivityController.getAll);
router.get('/user/:admin_user_id', AuthMiddleware.checkAuthorization, RecentActivityController.getByAdminUserId);
router.get('/table/:table_affected', AuthMiddleware.checkAuthorization, RecentActivityController.getByTableAffected);
router.get('/action/:action_title', AuthMiddleware.checkAuthorization, RecentActivityController.getByActionTitle);
// Optional: Get by ID if necessary
router.get('/:id', AuthMiddleware.checkAuthorization, RecentActivityController.getById);

module.exports = router;
