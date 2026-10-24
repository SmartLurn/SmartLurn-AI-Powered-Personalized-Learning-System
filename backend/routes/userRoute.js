import express from 'express';
const userRouter=express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/userController.js';

// Every route here works on the logged-in user (from the token)
userRouter.use(authMiddleware);

userRouter.get('/me',getProfile);
userRouter.patch('/me',updateProfile);
userRouter.patch('/me/password',changePassword);
userRouter.delete('/me',deleteAccount);

export default userRouter;
