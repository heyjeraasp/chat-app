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




// Create a group chat room
export const createGroupChat = async (req, res) => {
  const { name, userIds } = req.body;

  if (!name || !userIds || userIds.length < 2) {
    return res.status(400).json({ message: 'Group name and at least 2 users are required.' });
  }

  try {
    const newGroup = new ChatRoom({
      name,
      isGroup: true,
      users: userIds,
    });

    await newGroup.save();
    const populatedGroup = await newGroup.populate('users', 'email');

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error('❌ Error creating group chat:', error);
    res.status(500).json({ message: 'Server error while creating group chat.' });
  }
};


export const sendMessage = async (req, res) => {
  const { senderId, messageText, chatRoomId, receiverId } = req.body;

  try {
    let chatRoom;

    // If chatRoomId is provided, it’s a group chat
    if (chatRoomId) {
      chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ message: 'Group chat room not found.' });
      }
    } else if (senderId && receiverId) {
      // Otherwise, it’s a private chat
      chatRoom = await ChatRoom.findOne({
        $or: [
          { user1: senderId, user2: receiverId },
          { user1: receiverId, user2: senderId },
        ],
      });

      if (!chatRoom) {
        return res.status(404).json({ message: 'Private chat room not found.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid request: chatRoomId or receiverId required.' });
    }

    // Create a new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId || null,
      message: messageText,
    });

    await newMessage.save();

    // Add the message to the chat room
    chatRoom.messages.push(newMessage._id);
    await chatRoom.save();

    res.status(200).json({ message: 'Message sent successfully', newMessage });
  } catch (err) {
    console.error('❌ Error in sendMessage:', err);
    res.status(500).json({ message: 'Server error while sending message.' });
  }
};



  export const getMessages = async (req, res) => {
    const { user1Id, user2Id, chatRoomId } = req.query;
  
    try {
      let chatRoom;
  
      if (chatRoomId) {
        // Group chat
        chatRoom = await ChatRoom.findById(chatRoomId).populate({
          path: 'messages',
          populate: {
            path: 'sender',
            select: 'email' // Include sender's email
          }
        });
      } else if (user1Id && user2Id) {
        // Private chat
        chatRoom = await ChatRoom.findOne({
          $or: [
            { user1: user1Id, user2: user2Id },
            { user1: user2Id, user2: user1Id }
          ]
        }).populate({
          path: 'messages',
          populate: {
            path: 'sender',
            select: 'email'
          }
        });
      } else {
        return res.status(400).json({ message: 'Missing required query parameters.' });
      }
  
      if (!chatRoom) {
        return res.status(404).json({ message: 'Chat room not found' });
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
// export const getChatRooms = async (req, res) => {
//   const { userId } = req.query; // Get the logged-in user's ID from query

//   try {
//     // Find chat rooms where user is either user1 or user2
//     const chatRooms = await ChatRoom.find({
//       $or: [{ user1: userId }, { user2: userId }],
//     }).populate('user1 user2 messages');

//     // Send response with chat room data
//     res.status(200).json(chatRooms);
//   } catch (err) {
//     console.error('❌ Error in getChatRooms:', err);
//     res.status(500).json({ message: 'Server error while fetching chat rooms.' });
//   }
// };

export const getChatRooms = async (req, res) => {
  const { userId } = req.query;

  try {
    const chatRooms = await ChatRoom.find({
      $or: [
        { user1: userId },
        { user2: userId },
        { isGroup: true, users: userId }, // ✅ Include group chats
      ],
    }).populate('user1 user2 users messages');

    res.status(200).json(chatRooms);
  } catch (err) {
    console.error('❌ Error in getChatRooms:', err);
    res.status(500).json({ message: 'Server error while fetching chat rooms.' });
  }
};

export const getGroupChatById = async (req, res) => {
  const { chatRoomId } = req.params;
  console.log('🔍 Looking for group chatRoomId:', chatRoomId);

  try {
    const group = await ChatRoom.findById(chatRoomId);
    if (!group) {
      console.log('❌ No chat room found with this ID.');
      return res.status(404).json({ message: 'Group chat not found' });
    }

    console.log('✅ Found chat room:', group);

    if (!group.isGroup) {
      console.log('⚠️ Found, but not a group chat.');
      return res.status(404).json({ message: 'Not a group chat' });
    }

    res.status(200).json({ name: group.name });
  } catch (err) {
    console.error('❌ Error fetching group chat:', err);
    res.status(500).json({ message: 'Server error while fetching group chat.' });
  }
};

