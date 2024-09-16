// categoryRoutes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { categoryValidation } = require('../middlewares/validation');

router.post('/create', AuthMiddleware.checkAuthorization, categoryValidation, CategoryController.create);
router.get('/', AuthMiddleware.checkAuthorization, CategoryController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, CategoryController.getById);
router.put('/:id', AuthMiddleware.checkAuthorization, CategoryController.updateById);
router.put('/status/:id', AuthMiddleware.checkAuthorization, CategoryController.updateStatusById);
router.delete('/:id', AuthMiddleware.checkAuthorization, CategoryController.deleteById);

module.exports = router;
