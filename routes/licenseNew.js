// licensesNewRoutes.js
const express = require('express');
const router = express.Router();
const LicensesNewController = require('../controllers/licenseNewController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { licensesNewValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, licensesNewValidation, LicensesNewController.create);
router.get('/', AuthMiddleware.checkAuthorization, LicensesNewController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, LicensesNewController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, licensesNewValidation, LicensesNewController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, LicensesNewController.deleteById);

module.exports = router;
