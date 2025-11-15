const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const authMiddleware = require('../middleware/auth');

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
    // Platform fee calculation: 2%
    const basePrice = Number(price);
    let displayPrice = Number((basePrice * 1.02).toFixed(2));
    if (basePrice >= 10) {
      displayPrice = Math.ceil(displayPrice);
    }

    const listing = new Listing({
      company,
      isin,
      type: 'sell',
      price: basePrice,
      sellerPrice: basePrice,
      displayPrice,
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
    const { price, quantity } = req.body;

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Compute display price for bid relative to seller's listing price
    const listingSellerPrice = listing.sellerPrice || listing.price || 0;
    const baseBidPrice = Number(price);
    let bidDisplayPrice = Number((baseBidPrice * 1.02).toFixed(2));
    if (baseBidPrice >= 10) {
      bidDisplayPrice = Math.ceil(bidDisplayPrice);
    }
    listing.bids.push({
      userId: req.user.id,
      price: baseBidPrice,
      displayPrice: bidDisplayPrice,
      quantity,
      status: 'pending'
    });

    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bid' });
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
    let finalPrice = Number((basePrice * 1.02).toFixed(2));
    if (basePrice >= 10) finalPrice = Math.ceil(finalPrice);
    const fee = Number((finalPrice - basePrice).toFixed(2));

    const tradeNumber = 'TRD-' + Date.now();

    const trade = new Trade({
      listingId: listing._id,
      sellerId: listing.userId,
      buyerId: buyerId,
      company: listing.company,
      isin: listing.isin,
      price: basePrice,
      quantity: quantity,
      totalAmount: finalPrice * quantity,
      tradeNumber,
      feeBreakdown: { basePrice, fee, finalPrice },
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
    await listing.save();
    
    res.json({ success: true, trade, listing });
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

module.exports = router;
