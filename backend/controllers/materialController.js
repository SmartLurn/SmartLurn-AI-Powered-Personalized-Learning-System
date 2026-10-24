import pool from '../config/db.js';
import { uploadPdfToCloudinary, deleteFromCloudinary, getPdfViewUrl } from '../config/cloudinary.js';

// Shape a study_materials row the way the frontend expects it
const formatMaterial = (material) => ({
  id: material.id,
  title: material.title,
  subject: material.subject,
  description: material.description,
  fileType: 'PDF',
  fileName: material.original_file_name,
  fileSize: `${(material.file_size_bytes / (1024 * 1024)).toFixed(2)} MB`,
  // Signed link that opens the PDF in the browser (valid for 1 hour)
  fileUrl: getPdfViewUrl(material.storage_key),
  uploadedAt: material.uploaded_at,
});

// GET /api/materials
export const getMaterials = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware from the token

    const materials = await pool.query(
      "SELECT * FROM study_materials WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [userId]
    );

    return res.status(200).json({
      materials: materials.rows.map(formatMaterial),
    });
  } catch (error) {
    console.log('Get materials error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/materials  (multipart form: title, subject, description, file)
// The uploadPdf middleware has already checked the file and put it in req.file
export const uploadMaterial = async (req, res) => {
  let uploaded = null;

  try {
    const userId = req.userId;
    const title = req.body?.title?.trim();
    const subject = req.body?.subject?.trim();
    const description = req.body?.description?.trim() || null;

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a PDF file' });
    }

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    if (title.length > 255 || subject.length > 150) {
      return res.status(400).json({ message: 'Title or subject is too long' });
    }

    // Upload the PDF to Cloudinary
    uploaded = await uploadPdfToCloudinary(req.file.buffer);

    // Save the details and the Cloudinary link in the database
    const result = await pool.query(
      `INSERT INTO study_materials
         (user_id, title, subject, description, original_file_name,
          file_url, storage_key, file_size_bytes, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        title,
        subject,
        description,
        req.file.originalname,
        uploaded.secure_url,
        uploaded.public_id,
        req.file.size,
        req.file.mimetype,
      ]
    );

    return res.status(201).json({
      message: 'Material uploaded successfully',
      material: formatMaterial(result.rows[0]),
    });
  } catch (error) {
    console.log('Upload material error:', error);

    // The file reached Cloudinary but the database save failed: remove the file again
    if (uploaded) deleteFromCloudinary(uploaded.public_id).catch(() => {});

    return res.status(500).json({ message: 'Could not upload material' });
  }
};

// DELETE /api/materials/:id
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Only the owner can delete their material
    const materials = await pool.query(
      "SELECT * FROM study_materials WHERE id::text = $1 AND user_id = $2",
      [id, userId]
    );

    if (materials.rows.length === 0) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const material = materials.rows[0];

    await pool.query("DELETE FROM study_materials WHERE id = $1", [material.id]);

    // Remove the file from Cloudinary too (don't fail the request if this fails)
    if (material.storage_key) {
      deleteFromCloudinary(material.storage_key).catch((error) =>
        console.log('Cloudinary delete error:', error)
      );
    }

    return res.status(200).json({ message: 'Material deleted' });
  } catch (error) {
    console.log('Delete material error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
