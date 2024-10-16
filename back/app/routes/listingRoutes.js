const express = require('express');
const listingController = require('../controllers/listingController');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const listings = await listingController.getAllListings();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const listing = await listingController.createListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await listingController.getListing(req.params.id);
    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
    } else {
      res.json(listing);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const listing = await listingController.updateListing(req.params.id, req.body);
    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
    } else {
      res.json(listing);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const listing = await listingController.deleteListing(req.params.id);
    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
    } else {
      res.json({ message: 'Listing deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;