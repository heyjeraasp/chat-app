import express from 'express';
import { createChatRoom, sendMessage, getMessages, getChatRooms} from '../controllers/chatController.js';


const router = express.Router();

router.post('/create', createChatRoom); // Create a new chat room
router.post('/send', sendMessage); // Send a message
router.get('/messages', getMessages); // Get messages in a chat room
router.get('/chatrooms', getChatRooms);  // Add this line

export default router;