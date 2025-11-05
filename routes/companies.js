const express = require('express');
const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  res.json({ message: 'Companies routes' });
});

module.exports = router;
