const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password -emailOTP -mobileOTP');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailOTP -mobileOTP');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { username, name, mobile } = req.body;
    
    // Verify user is updating their own profile or is admin
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this profile' });
    }

    // Check if username already exists (if updating username)
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { username, name, mobile } },
      { new: true, runValidators: true }
    ).select('-password -emailOTP -mobileOTP');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
