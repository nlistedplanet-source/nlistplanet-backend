const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  isin: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['sell', 'buy'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  shares: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending_admin_approval', 'approved', 'closed'],
    default: 'active'
  },
  bids: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    price: Number,
    quantity: Number,
    counterPrice: Number,
    status: {
      type: String,
      enum: ['pending', 'counter_offered', 'accepted', 'rejected', 'counter_accepted_by_bidder'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  acceptedBid: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
