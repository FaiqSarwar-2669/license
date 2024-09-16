const express = require('express');
const router = express.Router();
const config = require('../config.json');

const AuthController = require('../controllers/authController');
const { loginValidation, signupValidation } = require('../middlewares/validation.js');
const configureMulter = require('../middlewares/uploader.js');
const imageUploader = configureMulter(config.IMAGE_STORAGE_PATH, config.FILE_SERVER_URL);

router.post('/register', signupValidation, imageUploader.single('photo'), AuthController.register);
router.post('/login', loginValidation, AuthController.login);

module.exports = router;
