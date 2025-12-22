const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['racket', 'ball', 'net', 'shoes', 'protective-gear', 'training-equipment', 'other']
  },
  sport: {
    type: String,
    enum: ['tennis', 'basketball', 'volleyball', 'badminton', 'squash', 'football', 'soccer', 'cricket', 'swimming', 'gym', 'yoga', 'general']
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  description: String,
  images: [String],
  brand: String,
  model: String,
  totalQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    default: 1
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  pricePerDay: Number,
  memberDiscount: {
    type: Number,
    default: 0 // percentage
  },
  deposit: {
    type: Number,
    default: 0
  },
  condition: {
    type: String,
    enum: ['new', 'excellent', 'good', 'fair', 'needs-repair'],
    default: 'good'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  size: String,
  color: String,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
