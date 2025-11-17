const express = require('express');
const router = express.Router();
const Trade = require('../models/Trade');
const Listing = require('../models/Listing');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists (skip in serverless)
const uploadDir = 'uploads/proofs';
if (process.env.NODE_ENV !== 'production') {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create upload directory:', err.message);
  }
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
});

// Multer configured above

// Get all trades for current user
router.get('/my-trades', authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({
      $or: [{ sellerId: req.user.id }, { buyerId: req.user.id }]
    })
      .populate('sellerId', 'name email username')
      .populate('buyerId', 'name email username')
      .populate('listingId')
      .sort({ createdAt: -1 });
    
    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get specific trade by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('sellerId', 'name email username')
      .populate('buyerId', 'name email username')
      .populate('listingId');
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Check if user is part of this trade
    if (trade.sellerId._id.toString() !== req.user.id && 
        trade.buyerId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    res.json(trade);
  } catch (error) {
    console.error('Get trade error:', error);
    res.status(500).json({ error: 'Failed to fetch trade' });
  }
});

// Upload seller proofs (DP Slip + Transfer Confirmation)
router.post('/:id/seller-proofs', authMiddleware, upload.fields([
  { name: 'dpSlip', maxCount: 1 },
  { name: 'transferConfirmation', maxCount: 1 }
]), async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Verify user is the seller
    if (trade.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only seller can upload these proofs' });
    }
    
    // Check trade status
    if (trade.status !== 'pending_closure') {
      return res.status(400).json({ error: 'Trade is not in pending_closure status' });
    }
    
    // Save file paths
    if (req.files.dpSlip) {
      trade.proofs.seller.dpSlip = req.files.dpSlip[0].path;
    }
    if (req.files.transferConfirmation) {
      trade.proofs.seller.transferConfirmation = req.files.transferConfirmation[0].path;
    }
    trade.proofs.seller.uploadedAt = new Date();
    
    await trade.save();
    
    res.json({ success: true, message: 'Seller proofs uploaded successfully', trade });
  } catch (error) {
    console.error('Upload seller proofs error:', error);
    res.status(500).json({ error: 'Failed to upload proofs' });
  }
});

// Upload buyer proofs (Payment Screenshot + UTR)
router.post('/:id/buyer-proofs', authMiddleware, upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const { utr } = req.body;
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Verify user is the buyer
    if (trade.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only buyer can upload these proofs' });
    }
    
    // Check trade status
    if (trade.status !== 'pending_closure') {
      return res.status(400).json({ error: 'Trade is not in pending_closure status' });
    }
    
    // Save file path and UTR
    if (req.file) {
      trade.proofs.buyer.paymentScreenshot = req.file.path;
    }
    if (utr) {
      trade.proofs.buyer.utr = utr;
    }
    trade.proofs.buyer.uploadedAt = new Date();
    
    await trade.save();
    
    res.json({ success: true, message: 'Buyer proofs uploaded successfully', trade });
  } catch (error) {
    console.error('Upload buyer proofs error:', error);
    res.status(500).json({ error: 'Failed to upload proofs' });
  }
});

// Admin: Verify and complete trade
router.post('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }
    
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    if (trade.status !== 'pending_closure') {
      return res.status(400).json({ error: 'Trade is not pending closure' });
    }
    
    // Verify all proofs are uploaded
    if (!trade.proofs.seller.dpSlip || !trade.proofs.seller.transferConfirmation ||
        !trade.proofs.buyer.paymentScreenshot || !trade.proofs.buyer.utr) {
      return res.status(400).json({ error: 'All proofs must be uploaded before verification' });
    }
    
    // Mark trade as complete
    trade.status = 'complete';
    trade.verifiedBy = req.user.id;
    trade.verifiedAt = new Date();
    trade.completedAt = new Date();
    
    await trade.save();
    
    // Update listing status
    await Listing.findByIdAndUpdate(trade.listingId, {
      status: 'complete'
    });
    
    res.json({ success: true, message: 'Trade verified and completed successfully', trade });
  } catch (error) {
    console.error('Verify trade error:', error);
    res.status(500).json({ error: 'Failed to verify trade' });
  }
});

// Admin: Reject trade with reason
router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const trade = await Trade.findById(req.params.id);
    
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    if (trade.status === 'complete') {
      return res.status(400).json({ error: 'Cannot reject completed trade' });
    }
    
    // Mark trade as rejected
    trade.status = 'rejected';
    trade.rejectionReason = reason;
    trade.rejectedBy = req.user.id;
    trade.rejectedAt = new Date();
    
    await trade.save();
    
    // Update listing status back to active
    await Listing.findByIdAndUpdate(trade.listingId, {
      status: 'active',
      rejectionReason: reason,
      rejectedBy: req.user.id,
      rejectedAt: new Date()
    });
    
    res.json({ success: true, message: 'Trade rejected successfully', trade });
  } catch (error) {
    console.error('Reject trade error:', error);
    res.status(500).json({ error: 'Failed to reject trade' });
  }
});

// Confirm trade by buyer/seller (explicit confirmation step after acceptance)
router.post('/:id/confirm', authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'Trade not found' });

    const userId = req.user.id;
    let modified = false;
    if (trade.buyerId.toString() === userId && !trade.buyerConfirmed) {
      trade.buyerConfirmed = true;
      trade.buyerAcceptedAt = new Date();
      modified = true;
    }
    if (trade.sellerId.toString() === userId && !trade.sellerConfirmed) {
      trade.sellerConfirmed = true;
      trade.sellerAcceptedAt = new Date();
      modified = true;
    }

    if (!modified) {
      return res.status(400).json({ error: 'Already confirmed or unauthorized' });
    }

    if (trade.buyerConfirmed && trade.sellerConfirmed) {
      trade.bothAcceptedAt = new Date();
      // Ensure listing is pending_closure and trade created
      await Listing.findByIdAndUpdate(trade.listingId, { status: 'pending_closure' });
    }

    await trade.save();
    res.json({ success: true, trade });
  } catch (error) {
    console.error('Confirm trade error:', error);
    res.status(500).json({ error: 'Failed to confirm trade' });
  }
});

module.exports = router;
