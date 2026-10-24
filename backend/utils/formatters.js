// Turn database rows (snake_case) into the shapes the frontend expects (camelCase)

export const formatSession = (row) => ({
  id: row.id,
  meetingID: row.meeting_code,
  title: row.title,
  description: row.description,
  status: row.status,
  host: {
    id: row.host_user_id,
    name: row.host_name,
  },
  maxParticipants: row.max_participants,
  createdAt: row.created_at,
  startedAt: row.started_at,
  endedAt: row.ended_at,
});

export const formatParticipant = (row) => ({
  id: row.user_id,
  name: row.name,
  isHost: row.is_host,
  joinedAt: row.joined_at,
  leftAt: row.left_at,
});

export const formatMessage = (row) => ({
  id: row.id,
  senderId: row.user_id,
  senderName: row.sender_name,
  text: row.content,
  sentAt: row.sent_at,
});
