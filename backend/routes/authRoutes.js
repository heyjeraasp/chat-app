import express from 'express';
import { registerUser, approveUser, loginUser } from '../controllers/authController.js';
import { searchUsers } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/approve/:token', approveUser);
router.post('/login', loginUser); 
router.get('/search', searchUsers); // Search route

export default router;