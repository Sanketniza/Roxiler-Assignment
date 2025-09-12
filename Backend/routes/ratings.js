const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { protect } = require('../middleware/auth');

// @route   POST /api/ratings
// @desc    Create or update a rating
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { storeId, rating } = req.body;

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user has already rated this store
    let existingRating = await Rating.findOne({
      user: req.user._id,
      store: storeId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.updatedAt = Date.now();
      await existingRating.save();

      // Update store's average rating
      await updateStoreRating(storeId);

      return res.json(existingRating);
    }

    // Create new rating
    const newRating = await Rating.create({
      user: req.user._id,
      store: storeId,
      rating
    });

    // Update store's average rating
    await updateStoreRating(storeId);

    res.status(201).json(newRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/ratings/user
// @desc    Get all ratings by current user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user._id })
      .populate('store', 'name address averageRating');

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/ratings/store/:storeId
// @desc    Get user's rating for a specific store
// @access  Private
router.get('/store/:storeId', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({
      user: req.user._id,
      store: req.params.storeId
    });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/ratings/:id
// @desc    Update a rating
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating } = req.body;

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    let existingRating = await Rating.findById(req.params.id);

    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns this rating
    if (existingRating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this rating' });
    }

    // Update rating
    existingRating.rating = rating;
    existingRating.updatedAt = Date.now();
    await existingRating.save();

    // Update store's average rating
    await updateStoreRating(existingRating.store);

    res.json(existingRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   DELETE /api/ratings/:id
// @desc    Delete a rating
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user owns this rating
    if (rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    const storeId = rating.store;

    // Delete rating
    await rating.remove();

    // Update store's average rating
    await updateStoreRating(storeId);

    res.json({ message: 'Rating removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Helper function to update store's average rating
async function updateStoreRating(storeId) {
  try {
    const ratings = await Rating.find({ store: storeId });
    
    if (ratings.length === 0) {
      await Store.findByIdAndUpdate(storeId, {
        averageRating: 0,
        totalRatings: 0
      });
      return;
    }

    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / ratings.length;

    await Store.findByIdAndUpdate(storeId, {
      averageRating: averageRating.toFixed(1),
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error updating store rating:', error);
    throw error;
  }
}

module.exports = router;