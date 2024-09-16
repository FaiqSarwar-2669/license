const express = require('express');
const router = express.Router();
const config = require('../config.json');

const UserController = require('../controllers/userController.js');
const AuthMiddleware = require('../middlewares/authMiddleware.js');
const { signupValidation } = require('../middlewares/validation.js');
const configureMulter = require('../middlewares/uploader.js');
const imageUploader = configureMulter(config.IMAGE_STORAGE_PATH, config.FILE_SERVER_URL);

// POST endpoint to create a new user
router.post('/create', AuthMiddleware.checkAuthorization, signupValidation, UserController.create);

// GET endpoint to retrieve all users
router.get('/', AuthMiddleware.checkAuthorization, UserController.getAll);

// GET endpoint to retrieve a user by ID
router.get('/:id', AuthMiddleware.checkAuthorization, UserController.getById);

// PUT endpoint to update a user's password
router.put('/password/:id', AuthMiddleware.checkAuthorization, UserController.updatePassword);

// PUT endpoint to update a user's details
router.put('/:id', AuthMiddleware.checkAuthorization, UserController.updateById);

// PUT endpoint to update a user's status
router.put('/status/:id', AuthMiddleware.checkAuthorization, UserController.updateStatusById);

// DELETE endpoint to remove a user
router.delete('/:id', AuthMiddleware.checkAuthorization, UserController.deleteById);

module.exports = router;
