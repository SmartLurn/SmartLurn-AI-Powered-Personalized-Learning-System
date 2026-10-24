import express from 'express';
// mergeParams lets this router read :meetingCode from the path it is mounted on
const participantRouter=express.Router({ mergeParams: true });
import authMiddleware from '../middleware/authMiddleware.js';
import { loadMeeting, requireActiveMeeting } from '../middleware/meetingMiddleware.js';
import {
  getRoomParticipants,
  joinMeeting,
  leaveMeeting,
} from '../controllers/participantController.js';

// Every route here needs a logged-in user and an existing meeting
participantRouter.use(authMiddleware,loadMeeting);

participantRouter.get('/',getRoomParticipants);
participantRouter.post('/join',requireActiveMeeting,joinMeeting);
participantRouter.post('/leave',leaveMeeting);

export default participantRouter;
