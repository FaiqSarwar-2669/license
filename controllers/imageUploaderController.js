const config = require('../config.json');
class imageUploaderController {

    static saveImage(file) {
        if (file) {
            return {
                error: false,
                message: 'Image Uploaded Successfully',
                data: {
                    file_path: `${config.FILE_SERVER_URL}${file.filename}`,
                    file_name: `${file.originalname}`,
                    file_type: `${file.mimetype}`,
                    file_size: `${file.size}`
                }
            };
        } else {
            return {
                error: true,
                message: 'No Image Selected',
                data: null
            };
        }
    }

    // Function to handle single image upload
    static uploadSingleImage(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
        if (req.file) {
            const file_path = req.file ? `${config.FILE_SERVER_URL}${req.file.filename}` : null;
            res.json({ error: false, message: 'Image uploaded successfully', file: file_path });
        } else {
            res.status(400).json({ error: true, message: 'No image uploaded' });
        }
    }

    // Function to handle multiple images upload
    static uploadMultipleImages(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
        if (req.files && req.files.length > 0) {
            const file_path = req.file ? `${config.FILE_SERVER_URL}${req.file.filename}` : null;
            res.json({ success: true, message: 'Image uploaded successfully', file: file_path });
            // res.json({ success: true, message: `${req.files.length} images uploaded successfully`, files: req.files });
        } else {
            res.status(400).json({ success: false, message: 'No images uploaded' });
        }
    }
}
module.exports = imageUploaderController;