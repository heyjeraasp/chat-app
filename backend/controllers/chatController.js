import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

// Create new chat room if it doesn't exist
export const createChatRoom = async (req, res) => {
  const { user1Id, user2Id } = req.body;

  try {
    // Check if chat room already exists
    const existingRoom = await ChatRoom.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ],
    });

    if (existingRoom) {
      return res.status(400).json({ message: 'Chat room already exists' });
    }

    // Create new chat room
    const chatRoom = new ChatRoom({ user1: user1Id, user2: user2Id });
    await chatRoom.save();

    res.status(201).json(chatRoom);
  } catch (err) {
    console.error('❌ Error in createChatRoom:', err);
    res.status(500).json({ message: 'Server error while creating chat room.' });
  }
};

export const sendMessage = async (req, res) => {
    const { senderId, receiverId, messageText } = req.body;
  
    try {
      // Find the chat room between the two users
      let chatRoom = await ChatRoom.findOne({
        $or: [
          { user1: senderId, user2: receiverId },
          { user1: receiverId, user2: senderId }
        ]
      });
  
      if (!chatRoom) {
        return res.status(400).json({ message: 'Chat room not found' });
      }
  
      // Create new message
      const newMessage = new Message({ sender: senderId, receiver: receiverId, message: messageText });
      await newMessage.save();
  
      // Add the new message to the chat room
      chatRoom.messages.push(newMessage._id);
      await chatRoom.save();
  
      res.status(200).json({ message: 'Message sent successfully', newMessage });
    } catch (err) {
      console.error('❌ Error in sendMessage:', err);
      res.status(500).json({ message: 'Server error while sending message.' });
    }
  };

  export const getMessages = async (req, res) => {
    const { user1Id, user2Id } = req.query;
  
    try {
      const chatRoom = await ChatRoom.findOne({
        $or: [
          { user1: user1Id, user2: user2Id },
          { user1: user2Id, user2: user1Id }
        ]
      }).populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'email' // 👈 This will fetch only the email of the sender
        }
      });
  
      if (!chatRoom) {
        return res.status(400).json({ message: 'Chat room not found' });
      }
  
      // Format messages to include senderEmail directly
      const formattedMessages = chatRoom.messages.map((msg) => ({
        _id: msg._id,
        sender: msg.sender._id,
        senderEmail: msg.sender.email,
        receiver: msg.receiver,
        message: msg.message,
        createdAt: msg.createdAt,
      }));
  
      res.status(200).json(formattedMessages);
    } catch (err) {
      console.error('❌ Error in getMessages:', err);
      res.status(500).json({ message: 'Server error while retrieving messages.' });
    }
  };

  // Get all chat rooms for a user
export const getChatRooms = async (req, res) => {
  const { userId } = req.query; // Get the logged-in user's ID from query

  try {
    // Find chat rooms where user is either user1 or user2
    const chatRooms = await ChatRoom.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2 messages');

    // Send response with chat room data
    res.status(200).json(chatRooms);
  } catch (err) {
    console.error('❌ Error in getChatRooms:', err);
    res.status(500).json({ message: 'Server error while fetching chat rooms.' });
  }
};

