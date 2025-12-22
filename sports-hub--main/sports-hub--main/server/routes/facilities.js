const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/facilities
// @desc    Get all facilities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.sport) {
      query.sports = req.query.sport;
    }
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    const facilities = await Facility.find(query).sort({ 'rating.average': -1 });

    res.json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get facility by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    res.json({ success: true, data: facility });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/facilities
// @desc    Create a facility
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const facility = await Facility.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: facility
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/facilities/:id
// @desc    Update facility
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    res.json({
      success: true,
      message: 'Facility updated successfully',
      data: facility
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/facilities/:id
// @desc    Delete facility
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: 'Facility not found'
      });
    }

    res.json({
      success: true,
      message: 'Facility deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
