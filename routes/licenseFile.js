const express = require('express');
const router = express.Router();
const config = require('../config.json');
const configureMulter = require('../middlewares/uploader');
const LicenseFileController = require('../controllers/licenseFileController');
const AuthMiddleware = require('../middlewares/authMiddleware');
const { licenseFileValidation } = require('../middlewares/validation');

// Assuming your destination folder and FILE_SERVER_URL are defined
const upload = configureMulter(config.IMAGE_STORAGE_PATH, config.FILE_SERVER_URL);

const checkFileUrl = (req, res, next) => {
    if (req.file && req.file.originalname.toLowerCase().startsWith(config.FILE_SERVER_URL)) {
        req.file.filename = req.file.originalname.toLowerCase();
    }
    next();
};

router.post('/create', AuthMiddleware.checkAuthorization, licenseFileValidation, upload.single('photo'), checkFileUrl, LicenseFileController.create);
router.get('/', AuthMiddleware.checkAuthorization, LicenseFileController.getAll);
router.get('/:id', AuthMiddleware.checkAuthorization, LicenseFileController.getById);
router.get('/file-by-license-id/:id', AuthMiddleware.checkAuthorization, LicenseFileController.getFileByLicenseId);
router.put('/:id', AuthMiddleware.checkAuthorization, licenseFileValidation, upload.single('photo'), checkFileUrl, LicenseFileController.updateById);
router.delete('/:id', AuthMiddleware.checkAuthorization, LicenseFileController.deleteById);

module.exports = router;
