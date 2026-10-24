import express from 'express';
// mergeParams lets this router read :meetingCode from the path it is mounted on
const messageRouter=express.Router({ mergeParams: true });
import authMiddleware from '../middleware/authMiddleware.js';
import { loadMeeting, requireActiveMeeting, requireParticipant } from '../middleware/meetingMiddleware.js';
import { getMeetingMessages, sendMessage } from '../controllers/messageController.js';

// Only people in the meeting can read or send its chat
messageRouter.use(authMiddleware,loadMeeting,requireParticipant);

messageRouter.get('/',getMeetingMessages);
messageRouter.post('/',requireActiveMeeting,sendMessage);

export default messageRouter;
