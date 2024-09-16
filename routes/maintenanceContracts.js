// maintenanceContractsRoutes.js
const express = require('express');
const router = express.Router();
const MaintenanceContractsController = require('../controllers/maintenanceContractsController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { maintenanceContractsValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, maintenanceContractsValidation, MaintenanceContractsController.create);
router.get('/', AuthMiddleware.checkAuthorization, MaintenanceContractsController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, MaintenanceContractsController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, maintenanceContractsValidation, MaintenanceContractsController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, MaintenanceContractsController.deleteById);

module.exports = router;
