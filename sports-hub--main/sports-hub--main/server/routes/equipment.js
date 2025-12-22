const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const EquipmentRental = require('../models/EquipmentRental');
const { protect, authorize, checkMembership } = require('../middleware/auth');

// @route   GET /api/equipment
// @desc    Get all equipment
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };

    if (req.query.facility) query.facility = req.query.facility;
    if (req.query.sport) query.sport = req.query.sport;
    if (req.query.category) query.category = req.query.category;
    if (req.query.available === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    const equipment = await Equipment.find(query)
      .populate('facility', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// @route   GET /api/equipment/rentals/my
// @desc    Get user's equipment rentals (alias for dashboard)
// @access  Private
router.get('/rentals/my', protect, async (req, res) => {
  try {
    const rentals = await EquipmentRental.find({ user: req.user.id })
      .populate('equipment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/equipment/rentals/my-rentals
// @desc    Get user's equipment rentals
// @access  Private
router.get('/rentals/my-rentals', protect, async (req, res) => {
  try {
    const rentals = await EquipmentRental.find({ user: req.user.id })
      .populate('equipment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// @route   GET /api/equipment/:id
// @desc    Get equipment by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('facility');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({ success: true, data: equipment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/equipment
// @desc    Create equipment
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/equipment/:id
// @desc    Update equipment
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/equipment/:id
// @desc    Delete equipment
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/equipment/:id/rent
// @desc    Rent equipment
// @access  Private
router.post('/:id/rent', protect, checkMembership, async (req, res) => {
  try {
    const { quantity, startDate, endDate, startTime, endTime, rentalType, booking } = req.body;

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${equipment.availableQuantity} items available`
      });
    }

    // Calculate rental cost
    // Validate input fields based on rental type
    if (!rentalType || (rentalType !== 'hourly' && rentalType !== 'daily')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rental type. Must be "hourly" or "daily"'
      });
    }

    // Calculate rental cost
    let totalAmount = 0;
    if (rentalType === 'hourly') {
      if (!startTime || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time and end time are required for hourly rentals'
        });
      }

      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let startMinutes = startH * 60 + startM;
      let endMinutes = endH * 60 + endM;

      if (isNaN(startMinutes) || isNaN(endMinutes)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid time format'
        });
      }

      // Handle overnight rentals (e.g., 10 PM to 2 AM next day)
      if (endMinutes <= startMinutes) {
        endMinutes += 1440; // Add 24 hours in minutes
      }

      const durationHours = (endMinutes - startMinutes) / 60;
      const chargedHours = Math.ceil(durationHours);
      totalAmount = equipment.pricePerHour * quantity * chargedHours;
    } else if (rentalType === 'daily') {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required for daily rentals'
        });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      totalAmount = (equipment.pricePerDay || equipment.pricePerHour * 8) * quantity * days;
    }

    // Apply member discount
    if (req.user.hasMembership && equipment.memberDiscount) {
      totalAmount = totalAmount - (totalAmount * equipment.memberDiscount / 100);
    }

    const rental = await EquipmentRental.create({
      user: req.user.id,
      equipment: req.params.id,
      booking,
      quantity,
      rentalType,
      startDate,
      endDate,
      startTime,
      endTime,
      totalAmount,
      depositAmount: equipment.deposit * quantity
    });

    // Update available quantity
    await Equipment.findByIdAndUpdate(req.params.id, {
      $inc: { availableQuantity: -quantity }
    });

    res.status(201).json({
      success: true,
      message: 'Equipment rental created successfully',
      data: rental
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/equipment/rentals/:id/return
// @desc    Return rented equipment
// @access  Private
router.put('/rentals/:id/return', protect, async (req, res) => {
  try {
    const rental = await EquipmentRental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    if (rental.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    rental.status = 'returned';
    rental.returnedAt = new Date();
    rental.returnCondition = req.body.condition || 'good';
    rental.damageNotes = req.body.damageNotes;
    rental.damageCharge = req.body.damageCharge || 0;
    await rental.save();

    // Update available quantity
    await Equipment.findByIdAndUpdate(rental.equipment, {
      $inc: { availableQuantity: rental.quantity }
    });

    res.json({
      success: true,
      message: 'Equipment returned successfully',
      data: rental
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
