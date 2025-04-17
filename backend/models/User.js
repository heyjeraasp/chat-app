import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true }); // This adds createdAt and updatedAt fields automatically

export default mongoose.model('User', userSchema);