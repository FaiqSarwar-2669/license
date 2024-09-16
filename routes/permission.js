// permissionsRoutes.js
const express = require('express');
const router = express.Router();
const PermissionsController = require('../controllers/permissionController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { permissionsValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, permissionsValidation, PermissionsController.create);
router.get('/', AuthMiddleware.checkAuthorization, PermissionsController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, PermissionsController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, permissionsValidation, PermissionsController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, PermissionsController.deleteById);

// Additional endpoint for checking permissions
router.get('/check', AuthMiddleware.checkAuthorization, PermissionsController.checkUserPermission);

module.exports = router;
