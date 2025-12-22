const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Court name is required'],
    trim: true
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  sport: {
    type: String,
    required: [true, 'Sport type is required'],
    enum: ['tennis', 'basketball', 'volleyball', 'badminton', 'squash', 'football', 'soccer', 'cricket', 'swimming', 'gym', 'yoga', 'other']
  },
  courtType: {
    type: String,
    enum: ['indoor', 'outdoor', 'covered'],
    default: 'indoor'
  },
  surface: {
    type: String,
    enum: ['hard', 'clay', 'grass', 'synthetic', 'wood', 'concrete', 'turf', 'other'],
    default: 'hard'
  },
  capacity: {
    type: Number,
    default: 4
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required']
  },
  memberPrice: {
    type: Number
  },
  peakHourPrice: {
    type: Number
  },
  peakHours: {
    start: String,
    end: String
  },
  images: [String],
  amenities: [String],
  description: String,
  rules: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    day: String,
    startTime: String,
    endTime: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Court', courtSchema);
