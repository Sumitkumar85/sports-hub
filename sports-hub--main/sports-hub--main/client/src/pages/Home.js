import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiUsers, FiAward, FiShoppingBag,
  FiArrowRight, FiStar, FiClock, FiMapPin, FiCheck
} from 'react-icons/fi';
import { IoTennisball, IoBasketball, IoFootball } from 'react-icons/io5';
import { MdSportsTennis, MdSportsVolleyball } from 'react-icons/md';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <FiCalendar />,
      title: 'Easy Court Booking',
      description: 'Book your favorite courts in seconds with our intuitive booking system.'
    },
    {
      icon: <FiShoppingBag />,
      title: 'Equipment Rental',
      description: 'Rent high-quality sports equipment at affordable rates.'
    },
    {
      icon: <FiUsers />,
      title: 'Membership Benefits',
      description: 'Join our membership program for exclusive discounts and priority booking.'
    },
    {
      icon: <FiAward />,
      title: 'Tournaments & Leagues',
      description: 'Participate in exciting tournaments and join competitive leagues.'
    }
  ];

  const sports = [
    { icon: <IoTennisball />, name: 'Tennis', courts: 12 },
    { icon: <IoBasketball />, name: 'Basketball', courts: 8 },
    { icon: <MdSportsVolleyball />, name: 'Volleyball', courts: 6 },
    { icon: <MdSportsTennis />, name: 'Badminton', courts: 10 },
    { icon: <IoFootball />, name: 'Football', courts: 4 },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Tennis Player',
      content: 'The booking process is so smooth! I can reserve my favorite court in just a few clicks.',
      rating: 5
    },
    {
      name: 'Mike Thompson',
      role: 'Basketball Coach',
      content: 'Great facilities and excellent equipment rental service. Highly recommended!',
      rating: 5
    },
    {
      name: 'Emily Chen',
      role: 'League Organizer',
      content: 'The tournament management feature is fantastic. Made organizing our league so much easier.',
      rating: 5
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Book Your Perfect<br />Sports Experience</h1>
          <p>
            Reserve courts, rent equipment, and join tournaments at the best 
            sports facilities in your area.
          </p>
          <div className="hero-actions">
            <Link to="/courts" className="btn btn-primary btn-lg">
              Book a Court <FiArrowRight />
            </Link>
            <Link to="/memberships" className="btn btn-outline btn-lg hero-btn-outline">
              View Memberships
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Courts</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Events</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose SportHub?</h2>
            <p className="section-subtitle">
              Everything you need for your sports activities in one place
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className="section sports-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Available Sports</h2>
            <p className="section-subtitle">
              Choose from a wide variety of sports facilities
            </p>
          </div>
          <div className="sports-grid">
            {sports.map((sport, index) => (
              <Link 
                to={`/courts?sport=${sport.name.toLowerCase()}`} 
                key={index} 
                className="sport-card"
              >
                <div className="sport-icon">{sport.icon}</div>
                <h3>{sport.name}</h3>
                <span className="court-count">{sport.courts} courts available</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get started in just 3 simple steps
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Choose Your Sport</h3>
              <p>Browse through our available courts and facilities</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Select Time & Date</h3>
              <p>Pick a convenient time slot that works for you</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Book & Play</h3>
              <p>Confirm your booking and enjoy your game!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="section membership-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Become a Member Today</h2>
              <p>Get exclusive access to premium courts, discounts on equipment rental, and priority booking.</p>
              <ul className="cta-benefits">
                <li><FiCheck /> Up to 30% off on court bookings</li>
                <li><FiCheck /> Free equipment rental</li>
                <li><FiCheck /> Priority tournament registration</li>
                <li><FiCheck /> Exclusive member events</li>
              </ul>
              <Link to="/memberships" className="btn btn-primary btn-lg">
                View Membership Plans <FiArrowRight />
              </Link>
            </div>
            <div className="cta-image">
              <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600" alt="Sports membership" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Members Say</h2>
            <p className="section-subtitle">
              Join thousands of satisfied sports enthusiasts
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="star filled" />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-role">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join SportHub today and elevate your sports experience</p>
          <div className="final-cta-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
            <Link to="/courts" className="btn btn-outline btn-lg final-btn-outline">
              Browse Courts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
