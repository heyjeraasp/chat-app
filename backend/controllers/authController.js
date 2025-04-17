// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { sendApprovalEmail } from '../utils/sendEmail.js';


// export const registerUser = async (req, res) => {
//     console.log('✅ Register endpoint hit');
  
//     const { email, password } = req.body;
//     try {
//       const hashedPass = await bcrypt.hash(password, 10);
  
//       const user = await User.create({ email, password: hashedPass });
//       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
//       await sendApprovalEmail(email, token);
  
//       res.status(201).json({ message: 'Registration successful. Check your email to approve account.' });
//     } catch (err) {
//       console.error('❌ Error in registerUser:', err.message);
//       res.status(500).json({ message: 'Server error during registration.' });
//     }
//   };
  
// export const approveUser = async (req, res) => {
//   const { token } = req.params;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
//   await User.findByIdAndUpdate(decoded.userId, { isApproved: true });
//   res.send('Account approved. You can now log in.');
// };

import User from '../models/User.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Assuming User model exists
import { sendApprovalEmail } from '../utils/sendEmail.js'; // Assuming the email function exists

// Register user function
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Optional: explicit pre-check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered with this email.' });
    }

    // Hash password and create new user
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPass });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await sendApprovalEmail(email, token);

    res.status(201).json({
      message: 'Registration successful. Check your email to approve account.',
    });
  } catch (err) {
    console.error('❌ Error in registerUser:', err);

    // Check for duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'User already registered with this email.',
      });
    }

    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Approve user function
export const approveUser = async (req, res) => {
  const { token } = req.params;

  try {
    // Decode JWT token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update user status to 'approved'
    const user = await User.findByIdAndUpdate(decoded.userId, { isApproved: true }, { new: true });

    // If user not found
    if (!user) {
      return res.status(404).send('User not found.');
    }

    res.send('Account approved. You can now log in.');
  } catch (err) {
    console.error('❌ Error in approveUser:', err.message);
    res.status(500).send('Server error during account approval.');
  }
};

// Login user function
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email.' });
    }

    // Check if email is approved
    if (!user.isApproved) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Return success
    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('❌ Error in loginUser:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};