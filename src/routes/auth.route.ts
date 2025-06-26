import express from 'express';
import {
  signupController,
  loginController,
  logoutController,
  updateProfileController,
  checkAuthController
} from '../controllers/auth.controller'
import protectRoute from '../middleware/auth.middleware';
import { uploadMulter } from '../lib/multer';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.put('/update-profile', protectRoute, updateProfileController);
router.get('/check',protectRoute,uploadMulter.single('profilePic'),checkAuthController)

export default router;
