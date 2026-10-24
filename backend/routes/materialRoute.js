import express from 'express';
const materialRouter=express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadPdf } from '../middleware/uploadMiddleware.js';
import { getMaterials, uploadMaterial, deleteMaterial } from '../controllers/materialController.js';

// Every materials route needs a logged-in user
materialRouter.use(authMiddleware);

materialRouter.get('/',getMaterials);
materialRouter.post('/',uploadPdf,uploadMaterial);
materialRouter.delete('/:id',deleteMaterial);

export default materialRouter;
