const nodemailer = require('nodemailer');

async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // SMTP username
      pass: process.env.SMTP_PASS, // SMTP password
    },
  });

  const mailOptions = {
    from: `"Your Company Name" <${process.env.SMTP_USER}>`, // sender address
    to: email, 
    subject: 'Your OTP Code', 
    // text: `Your OTP code is ${otp}`,
    html: `<p>Your OTP code is <strong>${otp}</strong></p>`, 
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
}


module.exports = {sendOtpEmail}