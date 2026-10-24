import pool from '../config/db.js';

// Save a message and return it with the sender's name
export const createMessage = async (sessionId, userId, content) => {
  const result = await pool.query(
    `WITH inserted AS (
       INSERT INTO session_messages (session_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *
     )
     SELECT i.id, i.user_id, u.name AS sender_name, i.content, i.sent_at
     FROM inserted i
     LEFT JOIN users u ON u.id = i.user_id`,
    [sessionId, userId, content]
  );

  return result.rows[0];
};

export const getMessages = async (sessionId) => {
  const result = await pool.query(
    `SELECT m.id, m.user_id, u.name AS sender_name, m.content, m.sent_at
     FROM session_messages m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.session_id = $1
     ORDER BY m.sent_at`,
    [sessionId]
  );

  return result.rows;
};
