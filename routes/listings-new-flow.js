const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Trade = require('../models/Trade');
const authMiddleware = require('../middleware/auth');

const computeDisplayPrice = (amount = 0) => {
  const base = Number(amount) || 0;
  let withFee = Number((base * 1.02).toFixed(2));
  if (base >= 10) {
    withFee = Math.ceil(withFee);
  }
  return withFee;
};

const buildFeeBreakdown = (amount = 0) => {
  const base = Number(amount) || 0;
  const finalPrice = computeDisplayPrice(base);
  const fee = Number((finalPrice - base).toFixed(2));
  return {
    basePrice: base,
    fee,
    finalPrice
  };
};

// ═══════════════════════════════════════════════════════════════
//                    NEW CLEAN SELL FLOW ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// 1. SELLER ACCEPTS BID (Direct acceptance without counter)
router.post('/:id/bid/:bidId/seller-accept', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    // Verify seller
    if (listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the seller can accept bids' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Validate current status
    if (bid.status !== 'pending_seller_response') {
      return res.status(400).json({ 
        error: 'Can only accept bids in pending_seller_response status',
        currentStatus: bid.status 
      });
    }
    
    // Update bid status
    bid.status = 'accepted_by_seller';
    bid.acceptedAt = new Date();
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      message: 'Bid accepted. Waiting for buyer confirmation.' 
    });
  } catch (error) {
    console.error('Seller accept error:', error);
    return res.status(500).json({ error: 'Failed to accept bid' });
  }
});

// 2. BUYER CONFIRMS SELLER'S ACCEPTANCE (Creates trade)
router.post('/:id/bid/:bidId/buyer-confirm', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Verify buyer
    if (bid.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the bidder can confirm' });
    }
    
    // Validate current status
    if (bid.status !== 'accepted_by_seller') {
      return res.status(400).json({ 
        error: 'Can only confirm bids in accepted_by_seller status',
        currentStatus: bid.status 
      });
    }
    
    // Update bid status
    bid.status = 'both_accepted';
    bid.finalConfirmedAt = new Date();
    
    // Create Trade
    const basePrice = bid.currentPrice || bid.price;
    const feeBreakdown = buildFeeBreakdown(basePrice);
    const tradeNumber = 'TRD-' + Date.now();
    
    const trade = new Trade({
      listingId: listing._id,
      sellerId: listing.userId,
      buyerId: bid.userId,
      company: listing.company,
      isin: listing.isin,
      price: basePrice,
      quantity: bid.quantity,
      totalAmount: feeBreakdown.finalPrice * bid.quantity,
      tradeNumber,
      feeBreakdown,
      buyerConfirmed: true,
      sellerConfirmed: true,
      status: 'pending_closure',
      bothAcceptedAt: new Date()
    });
    
    await trade.save();
    
    // Update listing
    listing.status = 'pending_admin_closure';
    listing.tradeId = trade._id;
    listing.acceptedBid = bid._id;
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      trade,
      message: 'Deal confirmed! Moved to admin closure queue.' 
    });
  } catch (error) {
    console.error('Buyer confirm error:', error);
    return res.status(500).json({ error: 'Failed to confirm deal' });
  }
});

// 3. SELLER SENDS COUNTER OFFER
router.post('/:id/bid/:bidId/seller-counter', authMiddleware, async (req, res) => {
  try {
    const { counterPrice, quantity } = req.body;
    
    if (!counterPrice || counterPrice <= 0) {
      return res.status(400).json({ error: 'Valid counter price required' });
    }
    
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    // Verify seller
    if (listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the seller can counter' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Validate current status
    if (!['pending_seller_response', 'counter_by_buyer'].includes(bid.status)) {
      return res.status(400).json({ 
        error: 'Can only counter from pending_seller_response or counter_by_buyer status',
        currentStatus: bid.status 
      });
    }
    
    // Check max counter rounds
    if (bid.counterRound >= bid.maxCounterRounds) {
      return res.status(400).json({ 
        error: `Maximum ${bid.maxCounterRounds} counter rounds reached` 
      });
    }
    
    // Update bid
    const counterBasePrice = Number(counterPrice);
    bid.counterPrice = counterBasePrice;
    bid.counterDisplayPrice = computeDisplayPrice(counterBasePrice);
    bid.currentPrice = counterBasePrice;
    bid.quantity = quantity || bid.quantity;
    bid.status = 'counter_by_seller';
    bid.counterRound += 1;
    bid.counterHistory.push({
      price: counterBasePrice,
      proposedBy: 'seller',
      proposedAt: new Date()
    });
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      message: `Counter offer sent: ₹${counterPrice}` 
    });
  } catch (error) {
    console.error('Seller counter error:', error);
    return res.status(500).json({ error: 'Failed to send counter offer' });
  }
});

// 4. BUYER ACCEPTS SELLER'S COUNTER (Seller must final confirm)
router.post('/:id/bid/:bidId/buyer-accept-counter', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Verify buyer
    if (bid.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the bidder can accept counter' });
    }
    
    // Validate current status
    if (bid.status !== 'counter_by_seller') {
      return res.status(400).json({ 
        error: 'Can only accept counter in counter_by_seller status',
        currentStatus: bid.status 
      });
    }
    
    // Update bid
    bid.status = 'counter_accepted_by_buyer';
    bid.acceptedAt = new Date();
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      message: 'Counter accepted. Waiting for seller final confirmation.' 
    });
  } catch (error) {
    console.error('Buyer accept counter error:', error);
    return res.status(500).json({ error: 'Failed to accept counter' });
  }
});

// 5. SELLER FINAL CONFIRMS AFTER BUYER ACCEPTS COUNTER (Creates trade)
router.post('/:id/bid/:bidId/seller-final-confirm', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    // Verify seller
    if (listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the seller can final confirm' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Validate current status
    if (bid.status !== 'counter_accepted_by_buyer') {
      return res.status(400).json({ 
        error: 'Can only final confirm in counter_accepted_by_buyer status',
        currentStatus: bid.status 
      });
    }
    
    // Update bid
    bid.status = 'both_accepted';
    bid.finalConfirmedAt = new Date();
    
    // Create Trade
    const basePrice = bid.counterPrice || bid.currentPrice || bid.price;
    const feeBreakdown = buildFeeBreakdown(basePrice);
    const tradeNumber = 'TRD-' + Date.now();
    
    const trade = new Trade({
      listingId: listing._id,
      sellerId: listing.userId,
      buyerId: bid.userId,
      company: listing.company,
      isin: listing.isin,
      price: basePrice,
      quantity: bid.quantity,
      totalAmount: feeBreakdown.finalPrice * bid.quantity,
      tradeNumber,
      feeBreakdown,
      buyerConfirmed: true,
      sellerConfirmed: true,
      status: 'pending_closure',
      bothAcceptedAt: new Date()
    });
    
    await trade.save();
    
    // Update listing
    listing.status = 'pending_admin_closure';
    listing.tradeId = trade._id;
    listing.acceptedBid = bid._id;
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      trade,
      message: 'Deal confirmed! Moved to admin closure queue.' 
    });
  } catch (error) {
    console.error('Seller final confirm error:', error);
    return res.status(500).json({ error: 'Failed to final confirm' });
  }
});

// 6. BUYER SENDS RE-COUNTER
router.post('/:id/bid/:bidId/buyer-counter', authMiddleware, async (req, res) => {
  try {
    const { counterPrice } = req.body;
    
    if (!counterPrice || counterPrice <= 0) {
      return res.status(400).json({ error: 'Valid counter price required' });
    }
    
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Verify buyer
    if (bid.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the bidder can counter' });
    }
    
    // Validate current status
    if (bid.status !== 'counter_by_seller') {
      return res.status(400).json({ 
        error: 'Can only counter in counter_by_seller status',
        currentStatus: bid.status 
      });
    }
    
    // Check max counter rounds
    if (bid.counterRound >= bid.maxCounterRounds) {
      return res.status(400).json({ 
        error: `Maximum ${bid.maxCounterRounds} counter rounds reached` 
      });
    }
    
    // Update bid
    const counterBasePrice = Number(counterPrice);
    bid.counterPrice = counterBasePrice;
    bid.counterDisplayPrice = computeDisplayPrice(counterBasePrice);
    bid.currentPrice = counterBasePrice;
    bid.status = 'counter_by_buyer';
    bid.counterRound += 1;
    bid.counterHistory.push({
      price: counterBasePrice,
      proposedBy: 'buyer',
      proposedAt: new Date()
    });
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      message: `Counter offer sent: ₹${counterPrice}` 
    });
  } catch (error) {
    console.error('Buyer counter error:', error);
    return res.status(500).json({ error: 'Failed to send counter offer' });
  }
});

// 7. SELLER RESPONDS TO BUYER'S COUNTER
router.post('/:id/bid/:bidId/seller-respond-counter', authMiddleware, async (req, res) => {
  try {
    const { action, counterPrice } = req.body; // action: 'accept' | 'counter' | 'reject'
    
    if (!['accept', 'counter', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be accept, counter, or reject' });
    }
    
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    // Verify seller
    if (listing.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the seller can respond' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Validate current status
    if (bid.status !== 'counter_by_buyer') {
      return res.status(400).json({ 
        error: 'Can only respond in counter_by_buyer status',
        currentStatus: bid.status 
      });
    }
    
    if (action === 'accept') {
      // Seller accepts buyer's counter - buyer must final confirm
      bid.status = 'counter_accepted_by_seller';
      bid.acceptedAt = new Date();
      
      await listing.save();
      await listing.populate('userId', 'userId name email username');
      
      return res.json({ 
        success: true, 
        listing,
        message: 'Counter accepted. Waiting for buyer final confirmation.' 
      });
      
    } else if (action === 'counter') {
      // Seller sends new counter
      if (!counterPrice || counterPrice <= 0) {
        return res.status(400).json({ error: 'Counter price required for counter action' });
      }
      
      // Check max rounds
      if (bid.counterRound >= bid.maxCounterRounds) {
        return res.status(400).json({ 
          error: `Maximum ${bid.maxCounterRounds} counter rounds reached` 
        });
      }
      
      const counterBasePrice = Number(counterPrice);
      bid.counterPrice = counterBasePrice;
      bid.counterDisplayPrice = computeDisplayPrice(counterBasePrice);
      bid.currentPrice = counterBasePrice;
      bid.status = 'counter_by_seller';
      bid.counterRound += 1;
      bid.counterHistory.push({
        price: counterBasePrice,
        proposedBy: 'seller',
        proposedAt: new Date()
      });
      
      await listing.save();
      await listing.populate('userId', 'userId name email username');
      
      return res.json({ 
        success: true, 
        listing,
        message: `Counter offer sent: ₹${counterPrice}` 
      });
      
    } else if (action === 'reject') {
      // Seller rejects
      bid.status = 'rejected_by_seller';
      bid.rejectedAt = new Date();
      
      await listing.save();
      await listing.populate('userId', 'userId name email username');
      
      return res.json({ 
        success: true, 
        listing,
        message: 'Bid rejected' 
      });
    }
  } catch (error) {
    console.error('Seller respond counter error:', error);
    return res.status(500).json({ error: 'Failed to respond to counter' });
  }
});

// 8. BUYER FINAL CONFIRMS AFTER SELLER ACCEPTS BUYER'S COUNTER (Creates trade)
router.post('/:id/bid/:bidId/buyer-final-confirm', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    
    // Verify buyer
    if (bid.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the bidder can final confirm' });
    }
    
    // Validate current status
    if (bid.status !== 'counter_accepted_by_seller') {
      return res.status(400).json({ 
        error: 'Can only final confirm in counter_accepted_by_seller status',
        currentStatus: bid.status 
      });
    }
    
    // Update bid
    bid.status = 'both_accepted';
    bid.finalConfirmedAt = new Date();
    
    // Create Trade
    const basePrice = bid.counterPrice || bid.currentPrice || bid.price;
    const feeBreakdown = buildFeeBreakdown(basePrice);
    const tradeNumber = 'TRD-' + Date.now();
    
    const trade = new Trade({
      listingId: listing._id,
      sellerId: listing.userId,
      buyerId: bid.userId,
      company: listing.company,
      isin: listing.isin,
      price: basePrice,
      quantity: bid.quantity,
      totalAmount: feeBreakdown.finalPrice * bid.quantity,
      tradeNumber,
      feeBreakdown,
      buyerConfirmed: true,
      sellerConfirmed: true,
      status: 'pending_closure',
      bothAcceptedAt: new Date()
    });
    
    await trade.save();
    
    // Update listing
    listing.status = 'pending_admin_closure';
    listing.tradeId = trade._id;
    listing.acceptedBid = bid._id;
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      trade,
      message: 'Deal confirmed! Moved to admin closure queue.' 
    });
  } catch (error) {
    console.error('Buyer final confirm error:', error);
    return res.status(500).json({ error: 'Failed to final confirm' });
  }
});

// 9. REJECT BID (By seller or buyer depending on status)
router.post('/:id/bid/:bidId/reject', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findOne({ 
      _id: req.params.id, 
      'bids._id': req.params.bidId 
    });
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing or bid not found' });
    }
    
    const bid = listing.bids.id(req.params.bidId);
    const isSeller = listing.userId.toString() === req.user.id;
    const isBuyer = bid.userId.toString() === req.user.id;
    
    if (!isSeller && !isBuyer) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Determine who is rejecting based on status
    if (isSeller) {
      bid.status = 'rejected_by_seller';
    } else {
      bid.status = 'rejected_by_buyer';
    }
    
    bid.rejectedAt = new Date();
    
    await listing.save();
    await listing.populate('userId', 'userId name email username');
    
    return res.json({ 
      success: true, 
      listing,
      message: 'Bid rejected' 
    });
  } catch (error) {
    console.error('Reject bid error:', error);
    return res.status(500).json({ error: 'Failed to reject bid' });
  }
});

module.exports = router;
