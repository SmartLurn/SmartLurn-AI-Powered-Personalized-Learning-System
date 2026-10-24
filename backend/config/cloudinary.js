import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Credentials from the Cloudinary dashboard (Settings -> API Keys)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = 'smartlurn/materials';

// Upload a PDF (held in memory by multer) to Cloudinary as a 'raw' file (served as-is).
// New Cloudinary accounts block public PDF links (401), so we view files through
// getPdfViewUrl below instead of the public secure_url.
export const uploadPdfToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: FOLDER,
        // Random name (with .pdf so browsers open it as a PDF)
        public_id: `${crypto.randomUUID()}.pdf`,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(buffer);
  });
};

const LINK_VALID_SECONDS = 60 * 60; // 1 hour

// A signed, temporary link to view a PDF in the browser.
// It goes through Cloudinary's API, so it works even when public PDF delivery
// is blocked on the account, and only people we give the link to can open it.
export const getPdfViewUrl = (publicId) => {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + LINK_VALID_SECONDS,
  });
};

// Delete a file from Cloudinary using the public_id saved as storage_key
export const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

export default cloudinary;
