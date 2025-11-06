const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true // Allows null/undefined values but enforces uniqueness when present
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['individual', 'hni', 'institutional', 'admin'],
    default: 'individual'
  },
  roles: [{
    type: String,
    enum: ['buyer', 'seller', 'admin']
  }],
  rating: {
    type: Number,
    default: 5
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  mobileVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: String,
  mobileOTP: String,
  otpExpiry: Date,
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
