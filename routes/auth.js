const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmailOTP, sendSMSOTP } = require('../utils/otpService');

// Generate User ID
const generateUserId = async () => {
  const count = await User.countDocuments();
  return `USR${String(count + 1).padStart(3, '0')}`;
};

// Generate Funny Username
const generateFunnyUsername = () => {
  const prefixes = [
    'ironman', 'batman', 'superman', 'spiderman', 'thor', 'hulk', 'captainamerica', 'blackwidow',
    'rajnikant', 'salmankhan', 'shahrukhkhan', 'amitabhbachchan', 'akshaykumar', 'hrithikroshan',
    'deepikapadukone', 'priyankachopra', 'katrinakaif', 'aliabhatt',
    'sherlock', 'jonsnow', 'tyrionlannister', 'tonystark', 'brucewayne',
    'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'goa',
    'wolf', 'tiger', 'lion', 'eagle', 'falcon', 'panther', 'cobra', 'dragon',
    'ninja', 'samurai', 'warrior', 'knight', 'viking', 'spartan',
    'einstein', 'newton', 'tesla', 'edison', 'darwin',
    'crypto', 'stock', 'trader', 'investor', 'whale', 'bull', 'bear',
    'rockstar', 'legend', 'champion', 'master', 'boss', 'king', 'queen',
    'pixel', 'byte', 'quantum', 'matrix', 'cyber', 'tech', 'digital'
  ];
  
  const suffixes = [
    'trader', 'investor', 'pro', 'master', 'king', 'queen', 'boss', 'legend',
    'warrior', 'hero', 'star', 'genius', 'wizard', 'ninja', 'samurai',
    'returns', 'gains', 'profits', 'wealth', 'rich', 'millionaire',
    'hustler', 'grinder', 'player', 'gamer', 'winner', 'champion',
    'alpha', 'sigma', 'omega', 'prime', 'elite', 'supreme',
    '_001', '_247', '_360', '_007', '_420', '_786', '_999'
  ];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `@${randomPrefix}_${randomSuffix}`;
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, mobile, userType } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate User ID
    const userId = await generateUserId();
    
    // Generate unique funny username
    let username = generateFunnyUsername();
    let usernameExists = await User.findOne({ username });
    
    // Keep generating until we get a unique username
    while (usernameExists) {
      username = generateFunnyUsername();
      usernameExists = await User.findOne({ username });
    }

    // Create user
    const user = new User({
      userId,
      username,
      name,
      email,
      password: hashedPassword,
      mobile,
      userType: userType || 'individual',
      roles: userType === 'admin' ? ['buyer', 'seller', 'admin'] : ['buyer', 'seller']
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        userType: user.userType,
        roles: user.roles,
        emailVerified: user.emailVerified,
        mobileVerified: user.mobileVerified
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        userType: user.userType,
        roles: user.roles,
        emailVerified: user.emailVerified,
        mobileVerified: user.mobileVerified
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
});

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP (expires in 10 minutes)
    user.emailOTP = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via email
    await sendEmailOTP(email, otp);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Verify OTP
    if (user.emailOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Send Mobile OTP
router.post('/send-mobile-otp', async (req, res) => {
  try {
    const { mobile } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP (expires in 10 minutes)
    user.mobileOTP = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via SMS
    await sendSMSOTP(mobile, otp);

    res.json({ success: true, message: 'OTP sent to mobile' });
  } catch (error) {
    console.error('Send mobile OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify Mobile OTP
router.post('/verify-mobile-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Verify OTP
    if (user.mobileOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark mobile as verified
    user.mobileVerified = true;
    user.mobileOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Mobile verified successfully' });
  } catch (error) {
    console.error('Verify mobile OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Forgot Password - send OTP
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
      return res.status(400).json({ error: 'Email and mobile are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.mobile !== mobile) {
      return res.status(400).json({ error: 'Email and mobile do not match' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.mobileOTP = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendSMSOTP(mobile, otp);

    res.json({ success: true, message: 'OTP sent to registered mobile number' });
  } catch (error) {
    console.error('Forgot password send OTP error:', error);
    res.status(500).json({ error: 'Failed to send reset OTP' });
  }
});

// Forgot Password - reset
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, mobile, otp, newPassword } = req.body;

    if (!email || !mobile || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, mobile, OTP, and new password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.mobile !== mobile) {
      return res.status(400).json({ error: 'Email and mobile do not match' });
    }

    if (!user.mobileOTP || user.mobileOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.mobileOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Forgot password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
