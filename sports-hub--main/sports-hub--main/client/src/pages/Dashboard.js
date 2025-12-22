import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaBasketballBall,
  FaDumbbell,
  FaCrown,
  FaTrophy,
  FaChartLine,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    upcomingBookings: [],
    recentBookings: [],
    activeRentals: [],
    membership: null,
    stats: {
      totalBookings: 0,
      totalRentals: 0,
      upcomingTournaments: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, rentalsRes, membershipsRes] = await Promise.all([
        api.get('/bookings/my'),
        api.get('/equipment/rentals/my'),
        api.get('/memberships/my')
      ]);

      const bookings = bookingsRes.data.data || [];
      const rentals = rentalsRes.data.data || [];
      const membership = membershipsRes.data.data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        return bookingDay >= today && b.status !== 'cancelled';
      }).slice(0, 5);

      const recent = bookings.filter(b =>
        new Date(b.date) < now || b.status === 'completed'
      ).slice(0, 5);

      const active = rentals.filter(r => r.status === 'reserved' || r.status === 'checked-out');

      setDashboardData({
        upcomingBookings: upcoming,
        recentBookings: recent,
        activeRentals: active,
        membership,
        stats: {
          totalBookings: bookings.length,
          totalRentals: rentals.length,
          upcomingTournaments: 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="container">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p>Here's what's happening with your sports activities</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bookings">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rentals">
              <FaDumbbell />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.totalRentals}</div>
              <div className="stat-label">Equipment Rentals</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon membership">
              <FaCrown />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {dashboardData.membership ? dashboardData.membership.membership?.name : 'None'}
              </div>
              <div className="stat-label">Membership</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tournaments">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardData.stats.upcomingTournaments}</div>
              <div className="stat-label">Tournaments</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Upcoming Bookings */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FaCalendarAlt /> Upcoming Bookings</h2>
              <Link to="/bookings" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {dashboardData.upcomingBookings.length === 0 ? (
                <div className="empty-state-mini">
                  <p>No upcoming bookings</p>
                  <Link to="/courts" className="btn btn-sm">Book a Court</Link>
                </div>
              ) : (
                <div className="booking-list">
                  {dashboardData.upcomingBookings.map((booking) => (
                    <div className="booking-item" key={booking._id}>
                      <div className="booking-icon">
                        <FaBasketballBall />
                      </div>
                      <div className="booking-info">
                        <div className="booking-title">
                          {booking.court?.name || 'Court Booking'}
                        </div>
                        <div className="booking-meta">
                          <span><FaClock /> {booking.startTime} - {booking.endTime}</span>
                          <span><FaCalendarAlt /> {formatDate(booking.date)}</span>
                        </div>
                      </div>
                      <div className={`booking-status ${booking.status}`}>
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Rentals */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2><FaDumbbell /> Active Rentals</h2>
              <Link to="/equipment" className="view-all">View All</Link>
            </div>
            <div className="card-content">
              {dashboardData.activeRentals.length === 0 ? (
                <div className="empty-state-mini">
                  <p>No active rentals</p>
                  <Link to="/equipment" className="btn btn-sm">Rent Equipment</Link>
                </div>
              ) : (
                <div className="rental-list">
                  {dashboardData.activeRentals.map((rental) => (
                    <div className="rental-item" key={rental._id}>
                      <div className="rental-icon">
                        <FaDumbbell />
                      </div>
                      <div className="rental-info">
                        <div className="rental-title">
                          {rental.equipment?.name || 'Equipment'}
                        </div>
                        <div className="rental-meta">
                          Return by: {formatDate(rental.endDate)}
                        </div>
                      </div>
                      <div className="rental-qty">
                        x{rental.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Membership Card */}
          <div className="dashboard-card membership-card-full">
            <div className="card-header">
              <h2><FaCrown /> Membership</h2>
              <Link to="/memberships" className="view-all">Manage</Link>
            </div>
            <div className="card-content">
              {dashboardData.membership ? (
                <div className="membership-info">
                  <div className="membership-tier">
                    <FaCrown />
                    <span>{dashboardData.membership.membership?.name}</span>
                  </div>
                  <div className="membership-details">
                    <div className="detail">
                      <span className="label">Status</span>
                      <span className={`value ${dashboardData.membership.status}`}>
                        {dashboardData.membership.status}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Expires</span>
                      <span className="value">
                        {formatDate(dashboardData.membership.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state-mini">
                  <p>No active membership</p>
                  <Link to="/memberships" className="btn btn-sm">View Plans</Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h2><FaChartLine /> Quick Actions</h2>
            </div>
            <div className="card-content">
              <div className="quick-actions">
                <Link to="/courts" className="quick-action">
                  <FaBasketballBall />
                  <span>Book Court</span>
                </Link>
                <Link to="/equipment" className="quick-action">
                  <FaDumbbell />
                  <span>Rent Equipment</span>
                </Link>
                <Link to="/tournaments" className="quick-action">
                  <FaTrophy />
                  <span>Tournaments</span>
                </Link>
                <Link to="/leagues" className="quick-action">
                  <FaUsers />
                  <span>Leagues</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card full-width">
          <div className="card-header">
            <h2><FaClock /> Recent Activity</h2>
          </div>
          <div className="card-content">
            {dashboardData.recentBookings.length === 0 ? (
              <div className="empty-state-mini">
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="activity-list">
                {dashboardData.recentBookings.map((booking) => (
                  <div className="activity-item" key={booking._id}>
                    <div className="activity-icon">
                      <FaBasketballBall />
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        Court booking at {booking.court?.name || 'Unknown'}
                      </div>
                      <div className="activity-date">{formatDate(booking.date)}</div>
                    </div>
                    <div className={`activity-status ${booking.status}`}>
                      {booking.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing FaUsers import
const FaUsers = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em">
    <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"></path>
  </svg>
);

export default Dashboard;
