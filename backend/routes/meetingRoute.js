import express from 'express';
const meetingRouter=express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import {
  createMeeting,
  getMeeting,
  getStudySessions,
  getSessionDetail,
  getMeetingStats,
} from '../controllers/meetingController.js';

// Every meeting route needs a logged-in user
meetingRouter.use(authMiddleware);

// Session history (fixed paths must come before /:meetingId so they aren't read as a code)
meetingRouter.get('/sessions',getStudySessions);
meetingRouter.get('/sessions/:sessionId',getSessionDetail);
meetingRouter.get('/stats',getMeetingStats);

// Live meetings
meetingRouter.post('/',createMeeting);
meetingRouter.get('/:meetingId',getMeeting);

export default meetingRouter;
