import { createMessage, getMessages } from '../models/messageModel.js';
import { formatMessage } from '../utils/formatters.js';

const MAX_MESSAGE_LENGTH = 2000;

// req.meeting is set by the loadMeeting middleware in every handler below

// GET /api/meetings/:meetingCode/messages
export const getMeetingMessages = async (req, res) => {
  try {
    const messages = await getMessages(req.meeting.id);

    return res.status(200).json({ messages: messages.map(formatMessage) });
  } catch (error) {
    console.log('Get messages error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// POST /api/meetings/:meetingCode/messages
export const sendMessage = async (req, res) => {
  try {
    const text = req.body?.text?.trim();

    if (!text) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` });
    }

    const message = await createMessage(req.meeting.id, req.userId, text);

    return res.status(201).json({ message: formatMessage(message) });
  } catch (error) {
    console.log('Send message error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
