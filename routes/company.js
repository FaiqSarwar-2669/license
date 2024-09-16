// companyRoutes.js
const express = require('express');
const router = express.Router();
const CompanyController = require('../controllers/companyController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { companyValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, companyValidation, CompanyController.create);
router.get('/', AuthMiddleware.checkAuthorization, CompanyController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, CompanyController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, CompanyController.updateById);
router.put('/status/:id', AuthMiddleware.checkAuthorization, CompanyController.updateStatusById);
router.delete('/:id', AuthMiddleware.checkAuthorization, CompanyController.deleteById);

module.exports = router;
