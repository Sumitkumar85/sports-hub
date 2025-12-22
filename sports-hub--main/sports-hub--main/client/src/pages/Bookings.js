import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { 
  FiCalendar, FiClock, FiMapPin, FiX, 
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState({ show: false, booking: null });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.data);
    } catch (error) {
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, reason) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`, { reason });
      toast.success('Booking cancelled successfully');
      fetchBookings();
      setCancelModal({ show: false, booking: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return bookingDate >= today && ['pending', 'confirmed'].includes(booking.status);
    } else if (activeTab === 'past') {
      return bookingDate < today || ['completed', 'cancelled'].includes(booking.status);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', label: 'Pending' },
      confirmed: { class: 'badge-success', label: 'Confirmed' },
      cancelled: { class: 'badge-danger', label: 'Cancelled' },
      completed: { class: 'badge-primary', label: 'Completed' },
      'no-show': { class: 'badge-danger', label: 'No Show' }
    };
    const config = statusConfig[status] || { class: '', label: status };
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div className="container">
          <h1>My Bookings</h1>
          <p>Manage your court reservations</p>
        </div>
      </div>

      <div className="container">
        <div className="bookings-header">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}
            >
              Past Bookings
            </button>
          </div>
          <Link to="/courts" className="btn btn-primary">
            Book New Court
          </Link>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <FiCalendar className="empty-state-icon" />
            <h3>No {activeTab} bookings</h3>
            <p>
              {activeTab === 'upcoming' 
                ? "You don't have any upcoming bookings yet"
                : "No past bookings to show"}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/courts" className="btn btn-primary">
                Book a Court
              </Link>
            )}
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="booking-card">
                <div className="booking-image">
                  <img 
                    src={booking.court?.images?.[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=300'} 
                    alt={booking.court?.name} 
                  />
                </div>
                <div className="booking-details">
                  <div className="booking-header">
                    <div>
                      <h3>{booking.court?.name}</h3>
                      <span className="sport-tag">{booking.court?.sport}</span>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="booking-info">
                    <div className="info-item">
                      <FiCalendar />
                      <span>{format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="info-item">
                      <FiClock />
                      <span>{booking.startTime} - {booking.endTime}</span>
                    </div>
                    <div className="info-item">
                      <FiMapPin />
                      <span>{booking.facility?.name}</span>
                    </div>
                  </div>
                  <div className="booking-footer">
                    <div className="booking-price">
                      <span className="label">Total:</span>
                      <span className="amount">${booking.finalAmount}</span>
                    </div>
                    {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setCancelModal({ show: true, booking })}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelModal.show && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Cancel Booking</h2>
                <button 
                  className="modal-close"
                  onClick={() => setCancelModal({ show: false, booking: null })}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this booking?</p>
                <div className="cancel-details">
                  <strong>{cancelModal.booking.court?.name}</strong>
                  <span>{format(new Date(cancelModal.booking.date), 'MMMM d, yyyy')} at {cancelModal.booking.startTime}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCancelModal({ show: false, booking: null })}
                >
                  Keep Booking
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancel(cancelModal.booking._id, 'User cancelled')}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
