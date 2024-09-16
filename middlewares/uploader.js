const multer = require('multer');

// Function to configure multer for file upload
const configureMulter = (destination, FILE_SERVER_URL) => {

    // Create a multer storage object
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination); // Set the destination folder for uploaded files
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const imageName = file.originalname.toLowerCase();
            cb(null, uniqueSuffix + '-' + imageName); // Set the file name to be unique
        }
    });

    // Create a multer upload object
    const upload = multer({
        storage,
        limits: {
            fileSize: 50 * 1024 * 1024, // Limit the file size to 50MB
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = [
                'image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
                'application/pdf', 'text/plain', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                // Add other file types as needed
            ];
            if (!allowedTypes.includes(file.mimetype)) {
                return cb(new Error('Invalid file type. Allowed file types: Images, PDFs, Word documents, and plain text.'));
            }
            cb(null, true);
        }
    });

    return upload;
};

module.exports = configureMulter;
