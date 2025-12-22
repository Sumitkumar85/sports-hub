const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Membership name is required'],
    trim: true
  },
  description: String,
  tier: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'vip'],
    default: 'basic'
  },
  duration: {
    type: Number, // in months
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  benefits: [{
    type: String
  }],
  courtDiscount: {
    type: Number,
    default: 0 // percentage
  },
  equipmentDiscount: {
    type: Number,
    default: 0 // percentage
  },
  guestPasses: {
    type: Number,
    default: 0
  },
  priorityBooking: {
    type: Boolean,
    default: false
  },
  advanceBookingDays: {
    type: Number,
    default: 7
  },
  freeCourtHours: {
    type: Number,
    default: 0 // per month
  },
  accessToAllFacilities: {
    type: Boolean,
    default: false
  },
  includedSports: [{
    type: String
  }],
  maxBookingsPerDay: {
    type: Number,
    default: 2
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Membership', membershipSchema);
