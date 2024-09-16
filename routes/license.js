// licensesRoutes.js
const express = require('express');
const router = express.Router();
const LicensesController = require('../controllers/licenseController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { licensesValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, licensesValidation, LicensesController.create);
router.get('/', AuthMiddleware.checkAuthorization, LicensesController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, LicensesController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, licensesValidation, LicensesController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, LicensesController.deleteById);

module.exports = router;
