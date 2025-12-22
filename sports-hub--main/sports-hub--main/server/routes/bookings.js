const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const User = require('../models/User');
const { protect, authorize, checkMembership } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Non-admin users can only see their own bookings
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    } else if (req.query.user) {
      query.user = req.query.user;
    }

    if (req.query.status) query.status = req.query.status;
    if (req.query.court) query.court = req.query.court;
    if (req.query.facility) query.facility = req.query.facility;
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: date, $lt: nextDate };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email')
      .populate('court', 'name sport pricePerHour')
      .populate('facility', 'name')
      .populate('equipment.item', 'name pricePerHour')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1, startTime: 1 });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = { $in: ['pending', 'confirmed'] };
    }

    const bookings = await Booking.find(query)
      .populate('court', 'name sport images')
      .populate('facility', 'name address')
      .sort({ date: 1, startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings (alias)
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('court', 'name sport images')
      .populate('facility', 'name address')
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('court')
      .populate('facility')
      .populate('equipment.item');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', protect, checkMembership, async (req, res) => {
  try {
    const { court: courtId, date, startTime, endTime, equipment, participants, notes } = req.body;

    // Validate required fields
    if (!courtId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide court, date, start time and end time'
      });
    }

    // Get court details
    const court = await Court.findById(courtId).populate('facility');
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    // Normalize date to start of day for consistent comparison
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check availability - find any overlapping bookings
    const startOfDay = new Date(bookingDate);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBooking = await Booking.findOne({
      court: courtId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Calculate duration and price
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const duration = end - start;

    let pricePerHour = court.pricePerHour;
    
    // Check for peak hours
    if (court.peakHours && court.peakHours.start && court.peakHours.end && court.peakHourPrice) {
      const peakStart = parseInt(court.peakHours.start.split(':')[0]);
      const peakEnd = parseInt(court.peakHours.end.split(':')[0]);
      if (start >= peakStart && start < peakEnd) {
        pricePerHour = court.peakHourPrice;
      }
    }

    // Apply member discount
    if (req.user.hasMembership && court.memberPrice) {
      pricePerHour = court.memberPrice;
    }

    let totalAmount = pricePerHour * duration;
    let discount = 0;

    // Apply membership discount
    if (req.user.hasMembership && req.user.membership) {
      const membership = await User.findById(req.user.id).populate('membership');
      if (membership.membership && membership.membership.courtDiscount) {
        discount = (totalAmount * membership.membership.courtDiscount) / 100;
      }
    }

    const finalAmount = totalAmount - discount;

    const booking = await Booking.create({
      user: req.user.id,
      court: courtId,
      facility: court.facility._id || court.facility,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalAmount,
      discount,
      finalAmount,
      equipment,
      participants,
      notes,
      status: 'confirmed'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('court', 'name sport')
      .populate('facility', 'name');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const allowedUpdates = ['participants', 'notes'];
    if (req.user.role === 'admin') {
      allowedUpdates.push('status', 'paymentStatus', 'paymentMethod');
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('court facility');

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancellationReason: req.body.reason,
        cancelledAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
