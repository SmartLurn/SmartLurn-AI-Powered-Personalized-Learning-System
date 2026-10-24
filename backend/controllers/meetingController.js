import crypto from 'crypto';
import pool from '../config/db.js';

const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

//Meeting id
const generateMeetingCode = () => {
  const segment = () =>
    Array.from({ length: 3 }, () =>
      CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]
    ).join('');

  return `${segment()}-${segment()}-${segment()}`;
};

// POST /api/meetings
export const createMeeting = async (req, res) => {
  try {
    const title = req.body?.title?.trim() || 'Study Room';
    const hostId = req.userId; // set by authMiddleware from the token

    // get unique meeting code
    let meetingCode = generateMeetingCode();
    while ((await pool.query("SELECT 1 FROM study_sessions WHERE meeting_code = $1", [meetingCode])).rows.length > 0) {
      meetingCode = generateMeetingCode();
    }

    // save the meeting
    const result = await pool.query(
      `INSERT INTO study_sessions (host_user_id, title, meeting_code, status, started_at)
       VALUES ($1, $2, $3, 'active', NOW())
       RETURNING id, meeting_code, title, host_user_id, status, created_at`,
      [hostId, title, meetingCode]
    );
    const meeting = result.rows[0];

    // The host is the first participant
    await pool.query(
      "INSERT INTO session_participants (session_id, user_id) VALUES ($1, $2)",
      [meeting.id, hostId]
    );

    return res.status(201).json({
      message: 'Meeting created successfully',
      meeting: {
        id: meeting.id,
        meetingID: meeting.meeting_code,
        title: meeting.title,
        host: meeting.host_user_id,
        status: meeting.status,
        createdAt: meeting.created_at,
      },
    });
  } catch (error) {
    console.log('Create meeting error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET /api/meetings/:meetingId
export const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meetings = await pool.query(
      "SELECT * FROM study_sessions WHERE meeting_code = $1",
      [meetingId]
    );

    if (meetings.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const meeting = meetings.rows[0];

    // In the study_sessions table an ended meeting has status 'completed'
    if (meeting.status === 'completed') {
      return res.status(400).json({ message: 'Meeting has already ended' });
    }

    return res.status(200).json({
      meeting: {
        id: meeting.id,
        meetingID: meeting.meeting_code,
        title: meeting.title,
        host: meeting.host_user_id,
        status: meeting.status,
        createdAt: meeting.created_at,
      },
    });
  } catch (error) {
    console.log('Get meeting error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET /api/meetings/sessions
export const getStudySessions = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware from the token

    // Meetings where the user was the host or a participant, newest first
    const meetings = await pool.query(
      `SELECT s.*, u.name AS host_name
       FROM study_sessions s
       JOIN users u ON u.id = s.host_user_id
       WHERE s.host_user_id = $1
          OR s.id IN (SELECT session_id FROM session_participants WHERE user_id = $1)
       ORDER BY s.created_at DESC`,
      [userId]
    );

    const formattedMeetings = await Promise.all(
      meetings.rows.map(async (meeting) => {
        const participants = await pool.query(
          `SELECT p.user_id, u.name, p.joined_at
           FROM session_participants p
           JOIN users u ON u.id = p.user_id
           WHERE p.session_id = $1
           ORDER BY p.joined_at`,
          [meeting.id]
        );

        const messages = await pool.query(
          `SELECT m.id, m.user_id, u.name, m.content, m.sent_at
           FROM session_messages m
           LEFT JOIN users u ON u.id = m.user_id
           WHERE m.session_id = $1
           ORDER BY m.sent_at`,
          [meeting.id]
        );

        return {
          id: meeting.id,
          meetingID: meeting.meeting_code,
          title: meeting.title,
          status: meeting.status,
          host: {
            id: meeting.host_user_id,
            name: meeting.host_name,
          },
          createdAt: meeting.created_at,
          endedAt: meeting.ended_at,
          participants: participants.rows.map((participant) => ({
            id: participant.user_id,
            name: participant.name,
            isHost: participant.user_id === meeting.host_user_id,
            joinedAt: participant.joined_at,
          })),
          messages: messages.rows.map((message) => ({
            id: message.id,
            senderId: message.user_id,
            senderName: message.name,
            text: message.content,
            sentAt: message.sent_at,
          })),
        };
      })
    );

    return res.status(200).json({ sessions: formattedMeetings });
  } catch (error) {
    console.log('Get study sessions error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET /api/meetings/sessions/:sessionId
// Full history of one session: details, everyone who joined, and the chat
export const getSessionDetail = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId; // set by authMiddleware from the token

    const meetings = await pool.query(
      `SELECT s.*, u.name AS host_name
       FROM study_sessions s
       JOIN users u ON u.id = s.host_user_id
       WHERE s.id::text = $1`,
      [sessionId]
    );

    if (meetings.rows.length === 0) {
      return res.status(404).json({ message: 'Session details not found' });
    }

    const meeting = meetings.rows[0];

    // Authorization: only the host or someone who joined can see this session
    const isMember = await pool.query(
      "SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2",
      [meeting.id, userId]
    );

    if (meeting.host_user_id !== userId && isMember.rows.length === 0) {
      return res.status(403).json({ message: 'You are not allowed to view this session' });
    }

    const participants = await pool.query(
      `SELECT p.user_id, u.name, p.joined_at
       FROM session_participants p
       JOIN users u ON u.id = p.user_id
       WHERE p.session_id = $1
       ORDER BY p.joined_at`,
      [meeting.id]
    );

    const messages = await pool.query(
      `SELECT m.id, m.user_id, u.name, m.content, m.sent_at
       FROM session_messages m
       LEFT JOIN users u ON u.id = m.user_id
       WHERE m.session_id = $1
       ORDER BY m.sent_at`,
      [meeting.id]
    );

    const formattedMeeting = {
      id: meeting.id,
      meetingID: meeting.meeting_code,
      title: meeting.title,
      status: meeting.status,
      host: {
        id: meeting.host_user_id,
        name: meeting.host_name,
      },
      createdAt: meeting.created_at,
      endedAt: meeting.ended_at,
      participants: participants.rows.map((participant) => ({
        id: participant.user_id,
        name: participant.name,
        isHost: participant.user_id === meeting.host_user_id,
        joinedAt: participant.joined_at,
      })),
      messages: messages.rows.map((message) => ({
        id: message.id,
        senderId: message.user_id,
        senderName: message.name,
        text: message.content,
        sentAt: message.sent_at,
      })),
    };

    return res.status(200).json({ meeting: formattedMeeting });
  } catch (error) {
    console.log('Get session detail error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET /api/meetings/stats
export const getMeetingStats = async (req, res) => {
  try {
    const userId = req.userId; // set by authMiddleware from the token

    // Meetings the user joined (the host is always a participant too)
    const totalSessions = await pool.query(
      "SELECT COUNT(*) FROM session_participants WHERE user_id = $1",
      [userId]
    );

    const hostedSessions = await pool.query(
      "SELECT COUNT(*) FROM study_sessions WHERE host_user_id = $1",
      [userId]
    );

    const messagesSent = await pool.query(
      "SELECT COUNT(*) FROM session_messages WHERE user_id = $1",
      [userId]
    );

    // Minutes spent in meetings; if still in a room, count up to now
    const totalMinutes = await pool.query(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(left_at, NOW()) - joined_at))), 0) / 60 AS minutes
       FROM session_participants WHERE user_id = $1`,
      [userId]
    );

    // pg returns counts and sums as strings, so convert them to numbers
    return res.status(200).json({
      stats: {
        totalSessions: Number(totalSessions.rows[0].count),
        hostedSessions: Number(hostedSessions.rows[0].count),
        messagesSent: Number(messagesSent.rows[0].count),
        totalMinutes: Math.round(Number(totalMinutes.rows[0].minutes)),
      },
    });
  } catch (error) {
    console.log('Get meeting stats error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
