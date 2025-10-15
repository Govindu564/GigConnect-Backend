// Backend/routes/gig.js
const express = require('express');
const router = express.Router();
const Gig = require('../models/Gig');

// Create gig
router.post('/', async (req, res) => {
  try {
    const gig = new Gig(req.body);
    await gig.save();
    res.status(201).json({ message: 'Gig created successfully', gig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all gigs
router.get('/', async (req, res) => {
  try {
    const gigs = await Gig.find().populate('clientId', 'name email');
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
