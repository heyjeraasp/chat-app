import nodemailer from 'nodemailer';
import { BASE_URL } from '../utils/api.js';

export const sendApprovalEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const approvalUrl = `${BASE_URL}/api/auth/approve/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Chat App - Approve Your Account',
    html: `<p>Click to approve: <a href="${approvalUrl}">${approvalUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};