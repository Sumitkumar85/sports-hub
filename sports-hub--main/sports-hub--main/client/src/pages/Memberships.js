import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiStar } from 'react-icons/fi';
import './Memberships.css';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMemberships();
    if (isAuthenticated) {
      fetchCurrentMembership();
    }
  }, [isAuthenticated]);

  const fetchMemberships = async () => {
    try {
      const response = await api.get('/memberships');
      setMemberships(response.data.data);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentMembership = async () => {
    try {
      const response = await api.get('/memberships/status/me');
      setCurrentMembership(response.data.data);
    } catch (error) {
      console.error('Error fetching current membership:', error);
    }
  };

  const handleSubscribe = async (membershipId) => {
    if (!isAuthenticated) {
      toast.info('Please login to subscribe to a membership');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/memberships/${membershipId}/subscribe`);
      toast.success('Successfully subscribed!');
      fetchCurrentMembership();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      basic: '#6b7280',
      standard: '#3b82f6',
      premium: '#8b5cf6',
      vip: '#f59e0b'
    };
    return colors[tier] || colors.basic;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="memberships-page">
      <div className="page-header">
        <div className="container">
          <h1>Membership Plans</h1>
          <p>Choose the perfect plan for your sports journey</p>
        </div>
      </div>

      <div className="container">
        {currentMembership?.hasMembership && (
          <div className="current-membership-banner">
            <div className="banner-content">
              <h3>Your Current Plan: {currentMembership.membership?.name}</h3>
              <p>Expires on {new Date(currentMembership.expiryDate).toLocaleDateString()}</p>
              <p>{currentMembership.daysRemaining} days remaining</p>
            </div>
          </div>
        )}

        <div className="memberships-grid">
          {memberships.map(membership => (
            <div 
              key={membership._id} 
              className={`membership-card ${membership.isPopular ? 'popular' : ''}`}
              style={{ '--tier-color': getTierColor(membership.tier) }}
            >
              {membership.isPopular && (
                <div className="popular-badge">
                  <FiStar /> Most Popular
                </div>
              )}
              <div className="membership-header">
                <h3 className="membership-name">{membership.name}</h3>
                <div className="membership-price">
                  <span className="currency">$</span>
                  <span className="amount">{membership.price}</span>
                  <span className="period">/{membership.duration} mo</span>
                </div>
              </div>
              
              <p className="membership-description">{membership.description}</p>
              
              <ul className="membership-benefits">
                {membership.courtDiscount > 0 && (
                  <li><FiCheck /> {membership.courtDiscount}% off court bookings</li>
                )}
                {membership.equipmentDiscount > 0 && (
                  <li><FiCheck /> {membership.equipmentDiscount}% off equipment rental</li>
                )}
                {membership.freeCourtHours > 0 && (
                  <li><FiCheck /> {membership.freeCourtHours} free court hours/month</li>
                )}
                {membership.guestPasses > 0 && (
                  <li><FiCheck /> {membership.guestPasses} guest passes/month</li>
                )}
                {membership.priorityBooking && (
                  <li><FiCheck /> Priority booking access</li>
                )}
                {membership.accessToAllFacilities && (
                  <li><FiCheck /> Access to all facilities</li>
                )}
                <li><FiCheck /> {membership.advanceBookingDays} days advance booking</li>
                <li><FiCheck /> Up to {membership.maxBookingsPerDay} bookings/day</li>
                {membership.benefits?.map((benefit, index) => (
                  <li key={index}><FiCheck /> {benefit}</li>
                ))}
              </ul>
              
              <button 
                className={`btn ${membership.isPopular ? 'btn-primary' : 'btn-outline'} btn-lg btn-block`}
                onClick={() => handleSubscribe(membership._id)}
                disabled={currentMembership?.membership?._id === membership._id}
              >
                {currentMembership?.membership?._id === membership._id 
                  ? 'Current Plan' 
                  : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="membership-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I cancel my membership?</h4>
              <p>Yes, you can cancel your membership at any time. Your benefits will remain active until the end of your billing period.</p>
            </div>
            <div className="faq-item">
              <h4>How do I upgrade my plan?</h4>
              <p>You can upgrade your plan at any time. The price difference will be prorated based on your remaining subscription period.</p>
            </div>
            <div className="faq-item">
              <h4>Are there family plans available?</h4>
              <p>Yes! Contact our support team to learn about our family membership options with special discounts.</p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, debit cards, and popular digital payment methods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memberships;
