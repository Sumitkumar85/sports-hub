import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { FiFilter, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';
import './Courts.css';

const Courts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    sport: searchParams.get('sport') || '',
    courtType: '',
  });

  const sports = ['tennis', 'basketball', 'volleyball', 'badminton', 'squash', 'football', 'soccer'];
  const courtTypes = ['indoor', 'outdoor', 'covered'];

  useEffect(() => {
    fetchCourts();
  }, [filters]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sport) params.append('sport', filters.sport);
      if (filters.courtType) params.append('courtType', filters.courtType);
      
      const response = await api.get(`/courts?${params}`);
      setCourts(response.data.data);
    } catch (error) {
      console.error('Error fetching courts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const sportImages = {
    tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
    squash: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    football: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400',
    soccer: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
  };

  return (
    <div className="courts-page">
      <div className="page-header">
        <div className="container">
          <h1>Book a Court</h1>
          <p>Find and book the perfect court for your game</p>
        </div>
      </div>

      <div className="container">
        <div className="courts-content">
          {/* Filters */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <FiFilter />
              <h3>Filters</h3>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Sport</label>
              <select 
                className="form-select"
                value={filters.sport}
                onChange={(e) => handleFilterChange('sport', e.target.value)}
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Court Type</label>
              <select 
                className="form-select"
                value={filters.courtType}
                onChange={(e) => handleFilterChange('courtType', e.target.value)}
              >
                <option value="">All Types</option>
                {courtTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button 
              className="btn btn-secondary btn-block"
              onClick={() => {
                setFilters({ sport: '', courtType: '' });
                setSearchParams({});
              }}
            >
              Clear Filters
            </button>
          </aside>

          {/* Courts List */}
          <div className="courts-list">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : courts.length === 0 ? (
              <div className="empty-state">
                <h3>No courts found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="courts-grid">
                {courts.map(court => (
                  <Link to={`/courts/${court._id}`} key={court._id} className="court-card">
                    <div className="court-image">
                      <img 
                        src={court.images?.[0] || sportImages[court.sport] || sportImages.tennis} 
                        alt={court.name} 
                      />
                      <span className={`court-type ${court.courtType}`}>
                        {court.courtType}
                      </span>
                    </div>
                    <div className="court-info">
                      <div className="court-sport">
                        {court.sport.charAt(0).toUpperCase() + court.sport.slice(1)}
                      </div>
                      <h3 className="court-name">{court.name}</h3>
                      {court.facility && (
                        <p className="court-facility">
                          <FiMapPin /> {court.facility.name}
                        </p>
                      )}
                      <div className="court-details">
                        <span className="court-surface">{court.surface} surface</span>
                        <span className="court-capacity">{court.capacity} players</span>
                      </div>
                      <div className="court-footer">
                        <span className="court-price">
                          <FiDollarSign />{court.pricePerHour}/hr
                        </span>
                        <span className="btn btn-primary btn-sm">Book Now</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courts;
