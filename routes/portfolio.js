const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const authMiddleware = require('../middleware/auth');

// Get user's portfolio
router.get('/', authMiddleware, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    // Create empty portfolio if doesn't exist
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: req.user.id,
        holdings: [],
        transactions: []
      });
      await portfolio.save();
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Add transaction
router.post('/transactions', authMiddleware, async (req, res) => {
  try {
    const { company, isin, type, quantity, price } = req.body;
    
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: req.user.id,
        holdings: [],
        transactions: []
      });
    }
    
    // Add transaction
    const transaction = {
      company,
      isin,
      type,
      quantity,
      price,
      totalValue: quantity * price
    };
    
    portfolio.transactions.unshift(transaction);
    
    // Update holdings
    if (type === 'buy') {
      const existingHolding = portfolio.holdings.find(h => h.isin === isin);
      
      if (existingHolding) {
        const totalQuantity = existingHolding.quantity + quantity;
        const avgPrice = ((existingHolding.purchasePrice * existingHolding.quantity) + 
                         (price * quantity)) / totalQuantity;
        
        existingHolding.quantity = totalQuantity;
        existingHolding.purchasePrice = avgPrice;
        existingHolding.currentPrice = price;
        existingHolding.lastUpdated = new Date();
      } else {
        portfolio.holdings.push({
          company,
          isin,
          quantity,
          purchasePrice: price,
          currentPrice: price
        });
      }
    } else if (type === 'sell') {
      const existingHolding = portfolio.holdings.find(h => h.isin === isin);
      
      if (existingHolding) {
        existingHolding.quantity -= quantity;
        existingHolding.lastUpdated = new Date();
        
        // Remove holding if quantity is 0
        if (existingHolding.quantity <= 0) {
          portfolio.holdings = portfolio.holdings.filter(h => h.isin !== isin);
        }
      }
    }
    
    await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Update holding price
router.patch('/holdings/:isin/price', authMiddleware, async (req, res) => {
  try {
    const { newPrice } = req.body;
    
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    const holding = portfolio.holdings.find(h => h.isin === req.params.isin);
    
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }
    
    holding.currentPrice = newPrice;
    holding.lastUpdated = new Date();
    
    await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

module.exports = router;
