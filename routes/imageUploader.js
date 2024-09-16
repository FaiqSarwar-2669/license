const express = require('express');
const router = express.Router();
const config = require('../config.json');

const configureMulter = require('../middlewares/uploader');
const imageUploaderController = require('../controllers/imageUploaderController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// Assuming your destination folder and FILE_SERVER_URL are defined
const uploadHandlers = configureMulter(config.IMAGE_STORAGE_PATH, config.FILE_SERVER_URL);

// Route to upload a single image
router.post('/single', AuthMiddleware.checkAuthorization, uploadHandlers.single('photo'), imageUploaderController.uploadSingleImage);

// Route to upload multiple images
router.post('/multiple', AuthMiddleware.checkAuthorization, uploadHandlers.array('photos', 5), imageUploaderController.uploadMultipleImages);

module.exports = router;
