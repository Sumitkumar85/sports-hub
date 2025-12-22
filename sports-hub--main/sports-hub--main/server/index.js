const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_facility_booking')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const facilityRoutes = require('./routes/facilities');
const courtRoutes = require('./routes/courts');
const bookingRoutes = require('./routes/bookings');
const equipmentRoutes = require('./routes/equipment');
const membershipRoutes = require('./routes/memberships');
const leagueRoutes = require('./routes/leagues');
const tournamentRoutes = require('./routes/tournaments');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/tournaments', tournamentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Facility Booking API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
