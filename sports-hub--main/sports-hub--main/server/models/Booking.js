const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number,
    required: true // in hours
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'wallet', 'membership'],
    default: 'card'
  },
  equipment: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    quantity: Number,
    price: Number
  }],
  participants: [{
    name: String,
    email: String,
    phone: String
  }],
  notes: String,
  cancellationReason: String,
  cancelledAt: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    endDate: Date,
    daysOfWeek: [Number]
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ court: 1, date: 1, startTime: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
