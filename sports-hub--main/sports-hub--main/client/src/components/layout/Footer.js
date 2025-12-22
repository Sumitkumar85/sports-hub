import React from 'react';
import { Link } from 'react-router-dom';
import { IoTennisball } from 'react-icons/io5';
import {
  FiFacebook, FiTwitter, FiInstagram, FiYoutube,
  FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <IoTennisball className="brand-icon" />
              <span>SportHub</span>
            </Link>
            <p className="footer-description">
              Your premier destination for sports facility bookings.
              Reserve courts, rent equipment, and join tournaments all in one place.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><FiFacebook /></a>
              <a href="#" className="social-link"><FiTwitter /></a>
              <a href="https://instagram.com/aniketgupta_133" target="_blank" rel="noopener noreferrer" className="social-link"><FiInstagram /></a>
              <a href="#" className="social-link"><FiYoutube /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/courts">Book a Court</Link></li>
              <li><Link to="/equipment">Rent Equipment</Link></li>
              <li><Link to="/tournaments">Tournaments</Link></li>
              <li><Link to="/leagues">Leagues</Link></li>
              <li><Link to="/memberships">Memberships</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Sports</h4>
            <ul>
              <li><Link to="/courts?sport=tennis">Tennis</Link></li>
              <li><Link to="/courts?sport=basketball">Basketball</Link></li>
              <li><Link to="/courts?sport=badminton">Badminton</Link></li>
              <li><Link to="/courts?sport=volleyball">Volleyball</Link></li>
              <li><Link to="/courts?sport=squash">Squash</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <ul>
              <li>
                <FiMapPin />
                <span>LPU, Phagwara, Punjab</span>
              </li>
              <li>
                <FiPhone />
                <span>+91 8853059862</span>
              </li>
              <li>
                <FiMail />
                <span>guptaaniketgupta737@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SportHub. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
