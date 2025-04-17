import nodemailer from 'nodemailer';

export const sendApprovalEmail = async (to, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const approvalUrl = `http://localhost:3001/api/auth/approve/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Chat App - Approve Your Account',
    html: `<p>Click to approve: <a href="${approvalUrl}">${approvalUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};