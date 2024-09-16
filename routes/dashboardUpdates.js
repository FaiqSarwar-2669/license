// dashboardUpdatesRoutes.js
const express = require('express');
const router = express.Router();
const DashboardUpdatesController = require('../controllers/dashboardUpdatesController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { dashboardUpdatesValidation } = require('../middlewares/validation');

router.post('/', AuthMiddleware.checkAuthorization, dashboardUpdatesValidation, DashboardUpdatesController.create);
router.get('/', AuthMiddleware.checkAuthorization, DashboardUpdatesController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, DashboardUpdatesController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, dashboardUpdatesValidation, DashboardUpdatesController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, DashboardUpdatesController.deleteById);

module.exports = router;
