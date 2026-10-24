import pool from '../config/db.js';

export const findParticipant = async (sessionId, userId) => {
  const result = await pool.query(
    `SELECT * FROM session_participants
     WHERE session_id = $1 AND user_id = $2`,
    [sessionId, userId]
  );

  return result.rows[0];
};

// Number of people currently in the room
export const countActiveParticipants = async (sessionId) => {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM session_participants
     WHERE session_id = $1 AND left_at IS NULL`,
    [sessionId]
  );

  return result.rows[0].count;
};

// Add a user to a meeting, or bring them back if they left earlier
export const addParticipant = async (sessionId, userId) => {
  const result = await pool.query(
    `INSERT INTO session_participants (session_id, user_id)
     VALUES ($1, $2)
     ON CONFLICT (session_id, user_id)
     DO UPDATE SET left_at = NULL
     RETURNING *`,
    [sessionId, userId]
  );

  return result.rows[0];
};

export const removeParticipant = async (sessionId, userId) => {
  const result = await pool.query(
    `UPDATE session_participants
     SET left_at = NOW()
     WHERE session_id = $1 AND user_id = $2 AND left_at IS NULL
     RETURNING *`,
    [sessionId, userId]
  );

  return result.rows[0];
};

// Everyone who has ever joined; pass onlyActive to get just those in the room now
export const getParticipants = async (sessionId, onlyActive = false) => {
  const result = await pool.query(
    `SELECT p.user_id, u.name, p.joined_at, p.left_at,
            (p.user_id = s.host_user_id) AS is_host
     FROM session_participants p
     JOIN users u ON u.id = p.user_id
     JOIN study_sessions s ON s.id = p.session_id
     WHERE p.session_id = $1
       AND ($2::boolean = FALSE OR p.left_at IS NULL)
     ORDER BY p.joined_at`,
    [sessionId, onlyActive]
  );

  return result.rows;
};
