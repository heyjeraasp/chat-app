import express from 'express';
import { registerUser, approveUser, loginUser,getAllUsers, searchUsers, getUserById } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/approve/:token', approveUser);
router.post('/login', loginUser); 
router.get('/search', searchUsers); // Search route
router.get('/users', getAllUsers);
router.get('/user/:id', getUserById);

export default router;