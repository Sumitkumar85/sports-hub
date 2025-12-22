import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';
import { 
  FiMapPin, FiUsers, FiDollarSign, FiClock, 
  FiArrowLeft, FiCheck, FiCalendar 
} from 'react-icons/fi';
import './CourtDetail.css';

const CourtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [court, setCourt] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchCourtDetails();
  }, [id]);

  useEffect(() => {
    if (court) {
      fetchAvailability();
    }
  }, [selectedDate, court]);

  const fetchCourtDetails = async () => {
    try {
      const response = await api.get(`/courts/${id}`);
      setCourt(response.data.data);
    } catch (error) {
      toast.error('Error loading court details');
      navigate('/courts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await api.get(`/courts/${id}/availability?date=${selectedDate}`);
      setAvailability(response.data.data.slots);
      setSelectedSlots([]);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    
    const slotIndex = selectedSlots.findIndex(s => s.startTime === slot.startTime);
    if (slotIndex > -1) {
      setSelectedSlots(selectedSlots.filter(s => s.startTime !== slot.startTime));
    } else {
      // Allow selecting consecutive slots only
      if (selectedSlots.length === 0) {
        setSelectedSlots([slot]);
      } else {
        const lastSlot = selectedSlots[selectedSlots.length - 1];
        const firstSlot = selectedSlots[0];
        
        if (slot.startTime === lastSlot.endTime) {
          setSelectedSlots([...selectedSlots, slot]);
        } else if (slot.endTime === firstSlot.startTime) {
          setSelectedSlots([slot, ...selectedSlots]);
        } else {
          setSelectedSlots([slot]);
        }
      }
    }
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to make a booking');
      navigate('/login', { state: { from: `/courts/${id}` } });
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    setBooking(true);
    try {
      const startTime = selectedSlots[0].startTime;
      const endTime = selectedSlots[selectedSlots.length - 1].endTime;

      await api.post('/bookings', {
        court: id,
        date: selectedDate,
        startTime,
        endTime
      });

      toast.success('Booking confirmed!');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!court) {
    return null;
  }

  const sportImages = {
    tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
  };

  return (
    <div className="court-detail-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Courts
        </button>

        <div className="court-detail-grid">
          <div className="court-main">
            <div className="court-gallery">
              <img 
                src={court.images?.[0] || sportImages[court.sport] || sportImages.tennis} 
                alt={court.name} 
              />
            </div>

            <div className="court-header">
              <div className="court-badge">{court.sport}</div>
              <h1>{court.name}</h1>
              {court.facility && (
                <p className="court-location">
                  <FiMapPin /> {court.facility.name}
                </p>
              )}
            </div>

            <div className="court-features">
              <div className="feature">
                <span className="feature-label">Court Type</span>
                <span className="feature-value">{court.courtType}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Surface</span>
                <span className="feature-value">{court.surface}</span>
              </div>
              <div className="feature">
                <span className="feature-label">Capacity</span>
                <span className="feature-value">{court.capacity} players</span>
              </div>
              <div className="feature">
                <span className="feature-label">Price</span>
                <span className="feature-value">${court.pricePerHour}/hr</span>
              </div>
            </div>

            {court.description && (
              <div className="court-description">
                <h3>About this Court</h3>
                <p>{court.description}</p>
              </div>
            )}

            {court.amenities && court.amenities.length > 0 && (
              <div className="court-amenities">
                <h3>Amenities</h3>
                <div className="amenities-list">
                  {court.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      <FiCheck /> {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="booking-sidebar">
            <div className="booking-card">
              <h3>Book This Court</h3>
              
              <div className="date-selector">
                <label className="form-label">
                  <FiCalendar /> Select Date
                </label>
                <div className="date-options">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
                    const date = addDays(new Date(), dayOffset);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dayOffset}
                        className={`date-option ${selectedDate === dateStr ? 'active' : ''}`}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <span className="day">{format(date, 'EEE')}</span>
                        <span className="date">{format(date, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="time-slots">
                <label className="form-label">
                  <FiClock /> Available Time Slots
                </label>
                <div className="slots-grid">
                  {availability.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot ${!slot.available ? 'unavailable' : ''} 
                        ${selectedSlots.find(s => s.startTime === slot.startTime) ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.available}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSlots.length > 0 && (
                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Duration</span>
                    <span>{selectedSlots.length} hour(s)</span>
                  </div>
                  <div className="summary-row">
                    <span>Time</span>
                    <span>
                      {selectedSlots[0].startTime} - {selectedSlots[selectedSlots.length - 1].endTime}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary btn-lg btn-block"
                onClick={handleBooking}
                disabled={selectedSlots.length === 0 || booking}
              >
                {booking ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetail;
