// customerRoutes.js
const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { customerValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, customerValidation, CustomerController.create);
router.get('/', AuthMiddleware.checkAuthorization, CustomerController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, CustomerController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, CustomerController.updateById);
router.put('/status/:id', AuthMiddleware.checkAuthorization, CustomerController.updateStatusById);
router.delete('/:id', AuthMiddleware.checkAuthorization, CustomerController.deleteById);

module.exports = router;
