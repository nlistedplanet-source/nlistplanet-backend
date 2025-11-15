const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  isin: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  // Trade number for verification (TRD-xxxxx)
  tradeNumber: {
    type: String
  },
  // Fee breakdown
  feeBreakdown: {
    basePrice: { type: Number },
    fee: { type: Number },
    finalPrice: { type: Number }
  },
  // Confirmation tracking (buyer/seller explicit confirmation)
  buyerConfirmed: { type: Boolean, default: false },
  sellerConfirmed: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['pending_closure', 'complete', 'rejected'],
    default: 'pending_closure'
  },
  // Proof uploads
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
  // Admin verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { type: Date },
  completedAt: { type: Date },
  // Rejection tracking
  rejectionReason: { type: String },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: { type: Date },
  // Acceptance tracking
  buyerAcceptedAt: { type: Date },
  sellerAcceptedAt: { type: Date },
  bothAcceptedAt: { type: Date }
}, { timestamps: true });

// Index for faster queries
tradeSchema.index({ sellerId: 1, status: 1 });
tradeSchema.index({ buyerId: 1, status: 1 });
tradeSchema.index({ listingId: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
