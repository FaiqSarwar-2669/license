// licenseManufacturersRoutes.js
const express = require('express');
const router = express.Router();
const LicenseManufacturersController = require('../controllers/licenseManufacturersController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { licenseManufacturersValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, licenseManufacturersValidation, LicenseManufacturersController.create);
router.get('/', AuthMiddleware.checkAuthorization, LicenseManufacturersController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, LicenseManufacturersController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, licenseManufacturersValidation, LicenseManufacturersController.updateById);
router.put('/status/:id', AuthMiddleware.checkAuthorization, LicenseManufacturersController.updateStatusById);
router.delete('/:id', AuthMiddleware.checkAuthorization, LicenseManufacturersController.deleteById);

module.exports = router;
