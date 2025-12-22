const mongoose = require('mongoose');

const equipmentRentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'hourly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  startTime: String,
  endTime: String,
  status: {
    type: String,
    enum: ['reserved', 'checked-out', 'returned', 'overdue', 'cancelled'],
    default: 'reserved'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  depositAmount: {
    type: Number,
    default: 0
  },
  depositStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'forfeited'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  checkedOutAt: Date,
  returnedAt: Date,
  returnCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'damaged'],
  },
  damageNotes: String,
  damageCharge: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('EquipmentRental', equipmentRentalSchema);
