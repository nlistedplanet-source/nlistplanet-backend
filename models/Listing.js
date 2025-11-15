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
  // Seller posted price (original)
  price: { type: Number },
  sellerPrice: {
    type: Number,
    required: true
  },
  // Price shown to buyers (sellerPrice + platform fee)
  displayPrice: { type: Number },
  feeBreakdown: {
    basePrice: { type: Number },
    fee: { type: Number },
    finalPrice: { type: Number }
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
    enum: ['active', 'pending', 'pending_admin_approval', 'approved', 'pending_closure', 'complete', 'rejected', 'closed'],
    default: 'active'
  },
  bids: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bidder: String,
    bidderName: String,
    bidderId: mongoose.Schema.Types.ObjectId,
    price: Number,
    displayPrice: Number,
    quantity: Number,
    counterPrice: Number,
    counterDisplayPrice: Number,
    counterHistory: [{
      price: Number,
      by: { type: String },
      at: { type: Date }
    }],
    counterBy: { type: String },
    buyerAccepted: { type: Boolean, default: false },
    sellerAccepted: { type: Boolean, default: false },
    bothAccepted: { type: Boolean, default: false },
    buyerAcceptedAt: { type: Date },
    sellerAcceptedAt: { type: Date },
    bothAcceptedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'counter_offered', 'accepted', 'rejected', 'counter_accepted_by_bidder', 'both_accepted'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  acceptedBid: mongoose.Schema.Types.ObjectId,
  // Proof uploads for transaction closure
  proofs: {
    seller: {
      dpSlip: { type: String },              // File URL/path
      transferConfirmation: { type: String }, // File URL/path
      uploadedAt: { type: Date }
    },
    buyer: {
      paymentScreenshot: { type: String },   // File URL/path
      utr: { type: String },                 // UTR number
      uploadedAt: { type: Date }
    }
  },
  // Admin rejection tracking
  rejectionReason: { type: String },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: { type: Date },
  // Trade reference (when both parties accept)
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  }
  ,
  // Boosting/Featured listing
  boosted: { type: Boolean, default: false },
  boostedUntil: { type: Date }
  ,
  // Boost transaction tracking
  boostTx: {
    amount: { type: Number },
    currency: { type: String, default: 'INR' },
    provider: { type: String },
    reference: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
