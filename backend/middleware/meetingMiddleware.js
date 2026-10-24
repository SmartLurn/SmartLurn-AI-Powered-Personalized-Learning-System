import { findSessionByCode } from '../models/meetingModel.js';
import { findParticipant } from '../models/participantModel.js';

// Find the meeting from :meetingCode in the URL and attach it as req.meeting.
// Codes are case-insensitive so typed codes still match.
export const loadMeeting = async (req, res, next) => {
  try {
    const meetingCode = req.params.meetingCode.trim().toLowerCase();
    const meeting = await findSessionByCode(meetingCode);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    req.meeting = meeting;
    next();
  } catch (error) {
    console.log('Load meeting error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Block actions on meetings that have already ended (use after loadMeeting)
export const requireActiveMeeting = (req, res, next) => {
  if (req.meeting.status !== 'active') {
    return res.status(400).json({ message: 'This meeting is no longer active' });
  }

  next();
};

// Only people currently in the room may continue (use after loadMeeting)
export const requireParticipant = async (req, res, next) => {
  try {
    const participant = await findParticipant(req.meeting.id, req.userId);

    if (!participant || participant.left_at) {
      return res.status(403).json({ message: 'Join the meeting first' });
    }

    next();
  } catch (error) {
    console.log('Check participant error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
