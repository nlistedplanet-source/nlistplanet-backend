const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email OTP Service
const sendEmailOTP = async (email, otp) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email content
    const mailOptions = {
      from: `"UnlistedHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification OTP - UnlistedHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">UnlistedHub - Email Verification</h2>
          <p>Your OTP for email verification is:</p>
          <h1 style="color: #10b981; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 UnlistedHub. All rights reserved.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email OTP error:', error);
    throw new Error('Failed to send email OTP');
  }
};

// SMS OTP Service (Twilio)
const sendSMSOTP = async (mobile, otp) => {
  try {
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send SMS
    await client.messages.create({
      body: `Your UnlistedHub verification OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobile
    });

    console.log(`✅ SMS OTP sent to ${mobile}`);
    return true;
  } catch (error) {
    console.error('SMS OTP error:', error);
    throw new Error('Failed to send SMS OTP');
  }
};

// Alternative: MSG91 SMS Service
const sendSMSOTP_MSG91 = async (mobile, otp) => {
  try {
    const axios = require('axios');
    
    const response = await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        mobile: mobile,
        otp: otp,
        sender: process.env.MSG91_SENDER_ID,
        message: `Your UnlistedHub OTP is ${otp}. Valid for 10 minutes.`
      }
    });

    console.log(`✅ MSG91 SMS sent to ${mobile}`);
    return true;
  } catch (error) {
    console.error('MSG91 SMS error:', error);
    throw new Error('Failed to send SMS via MSG91');
  }
};

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
  sendSMSOTP_MSG91
};
