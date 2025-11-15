const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
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

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('userId', 'userId name email username')
      // Sort boosted listings first and then recent items
      .sort({ boosted: -1, boostedUntil: -1, createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create sell listing
router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const { company, isin, price, shares } = req.body;
    const basePrice = Number(price);
    const feeBreakdown = buildFeeBreakdown(basePrice);

    const listing = new Listing({
      company,
      isin,
      type: 'sell',
      price: basePrice,
      sellerPrice: basePrice,
      displayPrice: feeBreakdown.finalPrice,
      feeBreakdown,
      shares,
      userId: req.user.id
    });

    await listing.save();
    
    // Populate userId with username, name, email before sending response
    await listing.populate('userId', 'userId name email username');
    
    res.status(201).json({ success: true, listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Create buy listing
router.post('/buy', authMiddleware, async (req, res) => {
  try {
    const { company, isin, price, shares } = req.body;

    const listing = new Listing({
      company,
      isin,
      type: 'buy',
      price,
      shares,
      userId: req.user.id
    });

    await listing.save();
    
    // Populate userId with username, name, email before sending response
    await listing.populate('userId', 'userId name email username');
    
    res.status(201).json({ success: true, listing });
  } catch (error) {
    console.error('Create buy listing error:', error);
    res.status(500).json({ error: 'Failed to create buy listing' });
  }
});

// Place bid on listing
router.post('/:id/bid', authMiddleware, async (req, res) => {
  try {
    const { price, quantity, bidder, bidderName } = req.body;

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Validate quantity doesn't exceed available shares
    if (Number(quantity) > listing.shares) {
      return res.status(400).json({ 
        error: `Quantity exceeds available shares. Only ${listing.shares} shares available.` 
      });
    }

    const baseBidPrice = Number(price);
    const bidDisplayPrice = computeDisplayPrice(baseBidPrice);
    
    listing.bids.push({
      userId: req.user.id,
      price: baseBidPrice,
      displayPrice: bidDisplayPrice,
      quantity: Number(quantity),
      bidder: bidder || req.user.email,
      bidderName: bidderName || req.user.name || req.user.username,
      status: 'pending',
      createdAt: new Date()
    });

    await listing.save();
    
    // Populate userId before returning
    await listing.populate('userId', 'userId name email username');
    
    res.json({ success: true, listing });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ 
      error: 'Failed to place bid',
      message: error.message 
    });
  }
});

// Seller creates a counter offer for a bid
router.post('/:id/bid/:bidId/counter', authMiddleware, async (req, res) => {
  try {
    const { counterPrice, quantity } = req.body;
    const listingId = req.params.id;
    const bidId = req.params.bidId;

    const listing = await Listing.findOne({ _id: listingId, 'bids._id': bidId });
    if (!listing) return res.status(404).json({ error: 'Listing or bid not found' });

    // Only seller of listing can create counter on bids
    if (listing.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    // Update bid in place using positional operator
    const counterBasePrice = Number(counterPrice);
    const counterDisplayPrice = computeDisplayPrice(counterBasePrice);

    const updated = await Listing.findOneAndUpdate(
      { _id: listingId, 'bids._id': bidId },
      {
        $set: {
          'bids.$.counterPrice': counterBasePrice,
          'bids.$.counterDisplayPrice': counterDisplayPrice,
          'bids.$.quantity': quantity || listing.bids.find(b => b._id == bidId).quantity,
          'bids.$.status': 'counter_offered',
          'bids.$.counterBy': 'seller',
          'bids.$.buyerAccepted': false,
          'bids.$.sellerAccepted': false
        },
        $push: {
          'bids.$.counterHistory': {
            price: counterPrice,
            by: 'seller',
            at: new Date()
          }
        }
      },
      { new: true }
    );

    return res.json({ success: true, listing: updated });
  } catch (err) {
    console.error('Counter offer error:', err);
    return res.status(500).json({ error: 'Failed to set counter offer' });
  }
});

// Buyer responds with counter to a seller counter or counter again
router.post('/:id/bid/:bidId/counter/respond', authMiddleware, async (req, res) => {
  try {
    const { counterPrice, quantity } = req.body;
    const listingId = req.params.id;
    const bidId = req.params.bidId;

    const listing = await Listing.findOne({ _id: listingId, 'bids._id': bidId });
    if (!listing) return res.status(404).json({ error: 'Listing or bid not found' });

    const bid = listing.bids.find(b => (b._id || b.id).toString() === bidId.toString());
    // Only the bid owner (buyer) can respond
    if (bid.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const counterBasePrice = Number(counterPrice);
    const counterDisplayPrice = computeDisplayPrice(counterBasePrice);

    const updated = await Listing.findOneAndUpdate(
      { _id: listingId, 'bids._id': bidId },
      {
        $set: {
          'bids.$.counterPrice': counterBasePrice,
          'bids.$.counterDisplayPrice': counterDisplayPrice,
          'bids.$.quantity': quantity || bid.quantity,
          'bids.$.status': 'counter_offered',
          'bids.$.counterBy': 'buyer',
        },
        $push: {
          'bids.$.counterHistory': {
            price: counterPrice,
            by: 'buyer',
            at: new Date()
          }
        }
      },
      { new: true }
    );

    return res.json({ success: true, listing: updated });
  } catch (err) {
    console.error('Counter respond error:', err);
    return res.status(500).json({ error: 'Failed to respond with counter' });
  }
});

// Accept bid by seller or buyer and create trade automatically when both accept
router.post('/:id/bid/:bidId/accept', authMiddleware, async (req, res) => {
  try {
    const { party } = req.body; // 'seller' or 'buyer'
    const listingId = req.params.id;
    const bidId = req.params.bidId;

    const listing = await Listing.findOne({ _id: listingId, 'bids._id': bidId });
    if (!listing) return res.status(404).json({ error: 'Listing or bid not found' });

    const bid = listing.bids.find(b => (b._id || b.id).toString() === bidId.toString());
    const isSeller = listing.userId.toString() === req.user.id;
    const bidUserId = bid && bid.userId ? bid.userId.toString() : null;
    const isBuyer = bidUserId ? bidUserId === req.user.id : false;
    if (!(isSeller || isBuyer)) return res.status(403).json({ error: 'Unauthorized' });

    const update = {};
    if (party === 'seller' && isSeller) update['bids.$.sellerAccepted'] = true;
    if (party === 'buyer' && isBuyer) update['bids.$.buyerAccepted'] = true;

    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Invalid party or unauthorized' });

    const updated = await Listing.findOneAndUpdate(
      { _id: listingId, 'bids._id': bidId },
      { $set: update },
      { new: true }
    );

    // Re-check both accepted
    const refreshedBid = updated.bids.find(b => (b._id || b.id).toString() === bidId.toString());
    if (refreshedBid.buyerAccepted && refreshedBid.sellerAccepted) {
      // Create trade automatically
      const Trade = require('../models/Trade');
      const basePrice = Number(refreshedBid.counterPrice || refreshedBid.price);
      const feeBreakdown = buildFeeBreakdown(basePrice);
      const tradeNumber = 'TRD-' + Date.now();
      const trade = new Trade({
        listingId: listing._id,
        sellerId: listing.userId,
        buyerId: refreshedBid.userId,
        company: listing.company,
        isin: listing.isin,
        price: basePrice,
        quantity: refreshedBid.quantity,
        totalAmount: feeBreakdown.finalPrice * refreshedBid.quantity,
        tradeNumber,
        feeBreakdown,
        buyerConfirmed: false,
        sellerConfirmed: true,
        status: 'pending_closure',
        bothAcceptedAt: new Date()
      });
      await trade.save();

      // Update listing with trade reference
      updated.tradeId = trade._id;
      updated.status = 'pending_closure';
      updated.acceptedBid = bidId;
      updated.feeBreakdown = feeBreakdown;
      updated.displayPrice = feeBreakdown.finalPrice;
      await updated.save();
      return res.json({ success: true, listing: updated, trade });
    }

    res.json({ success: true, listing: updated });

  } catch (err) {
    console.error('Accept bid error:', err);
    return res.status(500).json({ error: 'Failed to accept bid' });
  }
});

// Boost a listing (feature for 1 day)
router.post('/:id/boost', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    // Only owner can boost
    if (listing.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    listing.boosted = true;
    listing.boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    console.error('Boost listing error:', error);
    res.status(500).json({ error: 'Failed to boost listing' });
  }
});

// Boost with payment (simulate or real)
router.post('/:id/boost/pay', authMiddleware, async (req, res) => {
  try {
    const { paymentMethod, paymentToken, simulate } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    // For real integration: add Stripe/Razorpay provider here using env keys
    // For now, support a simulate flag to mark boost without real payment
    if (!simulate && (!paymentToken || !paymentMethod)) {
      return res.status(400).json({ error: 'paymentMethod and paymentToken are required unless simulate=true' });
    }

    // Simulate success
    const txRef = 'BOOST-' + Date.now();
    listing.boosted = true;
    listing.boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    listing.boostTx = { amount: 100, currency: 'INR', provider: paymentMethod || 'simulate', reference: txRef };
    await listing.save();
    return res.json({ success: true, listing });
  } catch (err) {
    console.error('Boost pay error:', err);
    return res.status(500).json({ error: 'Failed to process boost payment' });
  }
});

// Mark listing as sold manually by seller
router.post('/:id/mark-sold', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    listing.status = 'closed';
    listing.closedAt = new Date();
    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    console.error('Mark sold error:', error);
    res.status(500).json({ error: 'Failed to mark as sold' });
  }
});

// Create Trade when both parties accept
router.post('/:id/create-trade', authMiddleware, async (req, res) => {
  try {
    const { bidId, buyerId, price, quantity } = req.body;
    const Trade = require('../models/Trade');
    
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Create new Trade
    // Compute fee breakdown and trade number
    const basePrice = Number(price);
    const feeBreakdown = buildFeeBreakdown(basePrice);

    const tradeNumber = 'TRD-' + Date.now();

    const trade = new Trade({
      listingId: listing._id,
      sellerId: listing.userId,
      buyerId: buyerId,
      company: listing.company,
      isin: listing.isin,
      price: basePrice,
      quantity: quantity,
      totalAmount: feeBreakdown.finalPrice * quantity,
      tradeNumber,
      feeBreakdown,
      buyerConfirmed: false,
      sellerConfirmed: true,
      status: 'pending_closure',
      bothAcceptedAt: new Date()
    });
    
    await trade.save();
    
    // Update listing with trade reference and status
    listing.tradeId = trade._id;
    listing.status = 'pending_closure';
    listing.acceptedBid = bidId;
    listing.displayPrice = feeBreakdown.finalPrice;
    listing.feeBreakdown = feeBreakdown;
    await listing.save();
    
    res.json({ success: true, trade, listing });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

module.exports = router;
