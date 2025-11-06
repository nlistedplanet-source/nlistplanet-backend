const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  holdings: [{
    company: {
      type: String,
      required: true
    },
    isin: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    purchasePrice: {
      type: Number,
      required: true
    },
    currentPrice: {
      type: Number,
      required: true
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  transactions: [{
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
      enum: ['buy', 'sell'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    totalValue: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
