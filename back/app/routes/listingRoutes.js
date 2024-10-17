const express = require('express');
const listingController = require('../controllers/listingController');
const errorHandler = require('../utils/errorHandler');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const listings = await listingController.getAllListings();
    res.json(listings);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const listing = await listingController.createListing(req.body);
    res.status(201).json(listing);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await listingController.getListing(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const listing = await listingController.updateListing(req.params.id, req.body);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    errorHandler(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const listing = await listingController.deleteListing(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    errorHandler(res, error);
  }
});

module.exports = router;