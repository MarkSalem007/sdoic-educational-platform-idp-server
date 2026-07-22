import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {

    if (!file.mimetype.startsWith('image/')) {
        return callback(
            new Error('Only image files are allowed.')
        );
    }
    callback(null, true);
};

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});