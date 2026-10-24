import pool from '../config/db.js';

// Find a meeting by its code, with the host's name
export const findSessionByCode = async (meetingCode) => {
  const result = await pool.query(
    `SELECT s.*, u.name AS host_name
     FROM study_sessions s
     JOIN users u ON u.id = s.host_user_id
     WHERE s.meeting_code = $1`,
    [meetingCode]
  );

  return result.rows[0];
};
