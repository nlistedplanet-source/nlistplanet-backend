const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const authMiddleware = require('../middleware/auth');

// Get all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate('userId', 'userId name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create sell listing
router.post('/sell', authMiddleware, async (req, res) => {
  try {
    const { company, isin, price, shares } = req.body;

    const listing = new Listing({
      company,
      isin,
      type: 'sell',
      price,
      shares,
      userId: req.user.id
    });

    await listing.save();
    res.status(201).json({ success: true, listing });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
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

    listing.bids.push({
      userId: req.user.id,
      price,
      quantity,
      status: 'pending'
    });

    await listing.save();
    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

module.exports = router;
