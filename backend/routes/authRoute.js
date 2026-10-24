import express from 'express';
const authRouter=express.Router();
import {Login,Register} from '../controllers/authController.js';

authRouter.post('/login',Login);
authRouter.post('/register',Register);

export default authRouter;