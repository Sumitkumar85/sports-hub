import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiCalendar, 
  FiSettings, FiHome, FiGrid 
} from 'react-icons/fi';
import { IoTennisball } from 'react-icons/io5';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/courts', label: 'Courts' },
    { path: '/equipment', label: 'Equipment' },
    { path: '/tournaments', label: 'Tournaments' },
    { path: '/leagues', label: 'Leagues' },
    { path: '/memberships', label: 'Memberships' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <IoTennisball className="brand-icon" />
          <span>SportHub</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav">
            {navLinks.map(({ path, label }) => (
              <li key={path}>
                <Link 
                  to={path} 
                  className={`nav-link ${isActive(path) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-avatar">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <span className="user-name">{user?.firstName}</span>
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <span className="user-full-name">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link 
                    to="/dashboard" 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiGrid /> Dashboard
                  </Link>
                  <Link 
                    to="/bookings" 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiCalendar /> My Bookings
                  </Link>
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiSettings /> Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
