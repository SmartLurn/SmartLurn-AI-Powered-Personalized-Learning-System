import express from 'express';
const turnRouter=express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { getTurnCredentials } from '../controllers/turnController.js';

// Only logged-in users can get TURN credentials (so strangers can't use our quota)
turnRouter.use(authMiddleware);

turnRouter.get('/',getTurnCredentials);

export default turnRouter;
