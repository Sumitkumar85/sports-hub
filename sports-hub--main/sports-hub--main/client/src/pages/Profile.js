import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaCamera, FaSave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/auth/updatedetails', profileData);
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="container">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <span>{getInitials(user?.name)}</span>
              <button className="avatar-edit">
                <FaCamera />
              </button>
            </div>
            <div className="profile-header-info">
              <h1>{user?.name || 'User'}</h1>
              <p>{user?.email}</p>
              <span className="role-badge">{user?.role || 'Member'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile Information
          </button>
          <button 
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaLock /> Security
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <FaUser /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaEnvelope /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Enter your email"
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <FaPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      <FaMapMarkerAlt /> Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={profileData.address.street}
                      onChange={handleProfileChange}
                      placeholder="Enter your street address"
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={profileData.address.city}
                      onChange={handleProfileChange}
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="address.state"
                      value={profileData.address.state}
                      onChange={handleProfileChange}
                      placeholder="Enter your state"
                    />
                  </div>

                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={profileData.address.zipCode}
                      onChange={handleProfileChange}
                      placeholder="Enter your ZIP code"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form className="profile-form" onSubmit={handlePasswordSubmit}>
              <div className="form-section">
                <h3>Change Password</h3>
                <div className="form-grid single-column">
                  <div className="form-group">
                    <label>
                      <FaLock /> Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaLock /> New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaLock /> Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li>At least 6 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>Include at least one number</li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <FaLock /> {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
