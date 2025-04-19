import express from 'express';
import { createChatRoom, sendMessage, getMessages, getChatRooms, createGroupChat, getGroupChatById } from '../controllers/chatController.js';

const router = express.Router();

router.post('/create', createChatRoom); // Create a new chat room
router.post('/send', sendMessage); // Send a message
router.get('/messages', getMessages); // Get messages in a chat room
router.get('/chatrooms', getChatRooms);  // Add this line
router.post('/group', createGroupChat); // Add this line for creating a group chat
router.get('/group/:chatRoomId', getGroupChatById);

export default router;  