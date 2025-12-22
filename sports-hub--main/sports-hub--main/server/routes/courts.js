const express = require('express');
const router = express.Router();
const Court = require('../models/Court');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/courts
// @desc    Get all courts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.facility) query.facility = req.query.facility;
    if (req.query.sport) query.sport = req.query.sport;
    if (req.query.courtType) query.courtType = req.query.courtType;

    const courts = await Court.find(query)
      .populate('facility', 'name address')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: courts.length,
      data: courts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courts/:id
// @desc    Get court by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('facility');
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    res.json({ success: true, data: court });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courts/:id/availability
// @desc    Get court availability for a date
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      court: req.params.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime');

    // Generate time slots (6 AM to 10 PM)
    const timeSlots = [];
    for (let hour = 6; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const isBooked = bookings.some(booking => {
        return booking.startTime <= startTime && booking.endTime > startTime;
      });

      const isPeakHour = court.peakHours && 
        startTime >= court.peakHours.start && 
        startTime < court.peakHours.end;

      timeSlots.push({
        startTime,
        endTime,
        available: !isBooked,
        price: isPeakHour ? (court.peakHourPrice || court.pricePerHour) : court.pricePerHour
      });
    }

    res.json({
      success: true,
      data: {
        court: court.name,
        date,
        slots: timeSlots
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/courts
// @desc    Create a court
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const court = await Court.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Court created successfully',
      data: court
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/courts/:id
// @desc    Update court
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    res.json({
      success: true,
      message: 'Court updated successfully',
      data: court
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/courts/:id
// @desc    Delete court
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const court = await Court.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Court not found'
      });
    }

    res.json({
      success: true,
      message: 'Court deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
