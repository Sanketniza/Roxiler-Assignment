const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/stores
// @desc    Get all stores
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { name, address } = req.query;
    let query = {};

    // Apply filters if provided
    if (name) query.name = { $regex: name, $options: 'i' };
    if (address) query.address = { $regex: address, $options: 'i' };

    const stores = await Store.find(query).populate('owner', 'name email');
    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/stores
// @desc    Create a new store
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store with this email already exists
    const storeExists = await Store.findOne({ email });
    if (storeExists) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    // Check if owner exists and is a store_owner
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Update user role to store_owner if not already
    if (owner.role !== 'store_owner') {
      owner.role = 'store_owner';
      await owner.save();
    }

    // Create new store
    const store = await Store.create({
      name,
      email,
      address,
      owner: ownerId
    });

    res.status(201).json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/stores/:id
// @desc    Get store by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('owner', 'name email');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/stores/:id
// @desc    Update store
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, address } = req.body;

    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Update store fields
    store.name = name || store.name;
    store.email = email || store.email;
    store.address = address || store.address;

    const updatedStore = await store.save();

    res.json(updatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   DELETE /api/stores/:id
// @desc    Delete store
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Delete all ratings for this store
    await Rating.deleteMany({ store: store._id });

    // Delete store
    await store.remove();

    res.json({ message: 'Store removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/stores/owner/:userId
// @desc    Get store by owner ID
// @access  Private
router.get('/owner/:userId', protect, async (req, res) => {
  try {
    // Check if user is the owner or an admin
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const store = await Store.findOne({ owner: req.params.userId });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/stores/:id/ratings
// @desc    Get all ratings for a store
// @access  Private/StoreOwner or Admin
router.get('/:id/ratings', protect, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user is the store owner or an admin
    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const ratings = await Rating.find({ store: req.params.id }).populate('user', 'name email');

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;