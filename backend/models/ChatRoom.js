import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema(
  {
    name: { type: String }, // Optional name (used for group chats)
    isGroup: { type: Boolean, default: false }, // Flag to distinguish between 1-1 and group

    // For group chats
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Optional: still support legacy private chat format
    user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true }
);

export default mongoose.model('ChatRoom', chatRoomSchema);