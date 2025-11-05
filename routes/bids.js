const express = require('express');
const router = express.Router();

// Placeholder routes
router.get('/', async (req, res) => {
  res.json({ message: 'Bids routes' });
});

module.exports = router;
