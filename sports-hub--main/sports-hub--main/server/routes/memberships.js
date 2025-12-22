const express = require('express');
const router = express.Router();
const Membership = require('../models/Membership');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/memberships
// @desc    Get all membership plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const memberships = await Membership.find({ isActive: true })
      .sort({ price: 1 });

    res.json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/memberships/my
// @desc    Get current user's membership
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('membership');

    if (!user.membership) {
      return res.json({
        success: true,
        data: null
      });
    }

    const isExpired = user.membershipExpiry && new Date() > user.membershipExpiry;

    res.json({
      success: true,
      data: {
        membership: user.membership,
        endDate: user.membershipExpiry,
        status: isExpired ? 'expired' : 'active',
        daysRemaining: isExpired ? 0 : Math.ceil((user.membershipExpiry - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/memberships/:id
// @desc    Get membership by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    res.json({ success: true, data: membership });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/memberships
// @desc    Create membership plan
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const membership = await Membership.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      data: membership
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/memberships/:id
// @desc    Update membership plan
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership plan updated successfully',
      data: membership
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/memberships/:id
// @desc    Delete membership plan
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Membership plan deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/memberships/:id/subscribe
// @desc    Subscribe to a membership
// @access  Private
router.post('/:id/subscribe', protect, async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    
    if (!membership || !membership.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Membership plan not found or inactive'
      });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + membership.duration);

    // Update user membership
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        membership: membership._id,
        membershipExpiry: expiryDate
      },
      { new: true }
    ).populate('membership');

    res.json({
      success: true,
      message: `Successfully subscribed to ${membership.name} plan`,
      data: {
        membership: user.membership,
        expiryDate: user.membershipExpiry
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/memberships/cancel
// @desc    Cancel membership
// @access  Private
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        membership: null,
        membershipExpiry: null
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Membership cancelled successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/memberships/status/me
// @desc    Get current user's membership status
// @access  Private
router.get('/status/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('membership');

    if (!user.membership) {
      return res.json({
        success: true,
        data: {
          hasMembership: false,
          message: 'No active membership'
        }
      });
    }

    const isExpired = new Date() > user.membershipExpiry;

    res.json({
      success: true,
      data: {
        hasMembership: !isExpired,
        membership: user.membership,
        expiryDate: user.membershipExpiry,
        isExpired,
        daysRemaining: isExpired ? 0 : Math.ceil((user.membershipExpiry - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
