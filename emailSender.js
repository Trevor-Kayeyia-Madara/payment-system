const nodemailer = require('nodemailer');

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

// Function to send an email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: 'your-email@gmail.com',
      to,
      subject,
      html,
    });

    console.log('Email sent: ', info.messageId);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
