import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, same limit as the frontend

// Keep the file in memory (req.file.buffer); the controller sends it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are supported'));
    }
    cb(null, true);
  },
});

// Accept one PDF in the "file" field and turn upload problems into clear 400 errors
export const uploadPdf = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'The PDF must be smaller than 10 MB'
        : error.message;

      return res.status(400).json({ message });
    }

    next();
  });
};
