import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shape a users row for the frontend (never send the password hash)
const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.created_at,
});

// GET /api/users/me
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware from the token

    const users = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    if (users.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: formatUser(users.rows[0]) });
  } catch (error) {
    console.log('Get profile error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PATCH /api/users/me  { name, email }
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const name = req.body?.name?.trim();
    // Kept as typed, the same way register/login compare emails
    const email = req.body?.email?.trim();

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (name.length > 100) {
      return res.status(400).json({ message: 'Name must be 100 characters or less' });
    }

    if (email.length > 255 || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // The email must not belong to another account
    const emailTaken = await pool.query(
      "SELECT 1 FROM users WHERE email = $1 AND id <> $2",
      [email, userId]
    );

    if (emailTaken.rows.length > 0) {
      return res.status(400).json({ message: 'This email is already used by another account' });
    }

    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2 WHERE id = $3
       RETURNING id, name, email, created_at`,
      [name, email, userId]
    );

    return res.status(200).json({
      message: 'Profile updated',
      user: formatUser(result.rows[0]),
    });
  } catch (error) {
    console.log('Update profile error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// PATCH /api/users/me/password  { currentPassword, newPassword }
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const users = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);

    if (users.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from the current one' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, userId]);

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log('Change password error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// DELETE /api/users/me  { password }
// Deleting the user also deletes their materials, hosted meetings, etc. (ON DELETE CASCADE)
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: 'Please enter your password to confirm' });
    }

    const users = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);

    if (users.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, users.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Remember the uploaded files before the rows are deleted
    const materials = await pool.query(
      "SELECT storage_key FROM study_materials WHERE user_id = $1 AND storage_key IS NOT NULL",
      [userId]
    );

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    // Remove their PDFs from Cloudinary (don't fail the request if this fails)
    materials.rows.forEach((material) => {
      deleteFromCloudinary(material.storage_key).catch((error) =>
        console.log('Cloudinary delete error:', error)
      );
    });

    return res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    console.log('Delete account error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
