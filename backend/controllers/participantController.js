import {
  findParticipant,
  countActiveParticipants,
  addParticipant,
  removeParticipant,
  getParticipants,
} from '../models/participantModel.js';
import { formatSession, formatParticipant } from '../utils/formatters.js';

// req.meeting is set by the loadMeeting middleware in every handler below

// GET /api/meetings/:meetingCode/participants
// People currently in the room
export const getRoomParticipants = async (req, res) => {
  try {
    const participants = await getParticipants(req.meeting.id, true);

    return res.status(200).json({
      participants: participants.map(formatParticipant),
    });
  } catch (error) {
    console.log('Get participants error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/meetings/:meetingCode/participants/join
export const joinMeeting = async (req, res) => {
  try {
    const meeting = req.meeting;

    // Only check the limit for people not already in the room
    const existing = await findParticipant(meeting.id, req.userId);
    const isInRoom = existing && !existing.left_at;

    if (!isInRoom) {
      const activeCount = await countActiveParticipants(meeting.id);

      if (activeCount >= meeting.max_participants) {
        return res.status(403).json({ message: 'This meeting is full' });
      }
    }

    await addParticipant(meeting.id, req.userId);

    return res.status(200).json({
      message: 'Joined meeting',
      meeting: formatSession(meeting),
      isHost: meeting.host_user_id === req.userId,
    });
  } catch (error) {
    console.log('Join meeting error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/meetings/:meetingCode/participants/leave
export const leaveMeeting = async (req, res) => {
  try {
    const participant = await removeParticipant(req.meeting.id, req.userId);

    if (!participant) {
      return res.status(400).json({ message: 'You are not in this meeting' });
    }

    return res.status(200).json({ message: 'Left meeting' });
  } catch (error) {
    console.log('Leave meeting error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
