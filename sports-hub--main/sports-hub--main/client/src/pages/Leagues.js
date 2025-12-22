import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import './Leagues.css';

const Leagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const res = await api.get('/leagues');
      setLeagues(res.data.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'upcoming': { class: 'upcoming', text: 'Upcoming' },
      'registration-open': { class: 'registration', text: 'Registration Open' },
      'in-progress': { class: 'active', text: 'In Season' },
      'completed': { class: 'completed', text: 'Season Ended' },
      'cancelled': { class: 'cancelled', text: 'Cancelled' }
    };
    return badges[status] || badges.upcoming;
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'TBD';
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredLeagues = leagues.filter(league => {
    if (filters.sport && league.sport !== filters.sport) return false;
    if (filters.status && league.status !== filters.status) return false;
    if (filters.search && !league.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sports = [...new Set(leagues.map(l => l.sport))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading leagues...</p>
      </div>
    );
  }

  return (
    <div className="leagues-page">
      <div className="page-header-hero">
        <div className="container">
          <h1>Leagues</h1>
          <p>Join competitive leagues and climb the standings</p>
        </div>
      </div>

      <div className="container">
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search leagues..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <FaFilter />
            <select
              value={filters.sport}
              onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="registration-open">Registration Open</option>
              <option value="in-progress">In Season</option>
              <option value="completed">Season Ended</option>
            </select>
          </div>
        </div>

        {filteredLeagues.length === 0 ? (
          <div className="empty-state">
            <FaTrophy />
            <h3>No leagues found</h3>
            <p>Check back later for upcoming leagues</p>
          </div>
        ) : (
          <div className="leagues-grid">
            {filteredLeagues.map(league => {
              const badge = getStatusBadge(league.status);
              return (
                <Link to={`/leagues/${league._id}`} className="league-card" key={league._id}>
                  <div className="league-card-header">
                    <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                    <div className="league-sport">{league.sport}</div>
                  </div>

                  <div className="league-card-body">
                    <h3 className="league-name">{league.name}</h3>

                    <p className="league-description">
                      {league.description?.substring(0, 100)}
                      {league.description?.length > 100 && '...'}
                    </p>

                    <div className="league-meta">
                      <div className="meta-item">
                        <FaCalendarAlt />
                        <span>Season: {formatDate(league.startDate)} - {formatDate(league.endDate)}</span>
                      </div>

                      {league.facility && (
                        <div className="meta-item">
                          <FaMapMarkerAlt />
                          <span>{league.facility.name}</span>
                        </div>
                      )}

                      <div className="meta-item">
                        <FaUsers />
                        <span>{league.teams?.length || 0} / {league.maxTeams} Teams</span>
                      </div>
                    </div>
                  </div>

                  <div className="league-card-footer">
                    <div className="league-stats">
                      <div className="stat">
                        <span className="stat-value">${league.registrationFee}</span>
                        <span className="stat-label">Entry Fee</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{league.matches?.length || 0}</span>
                        <span className="stat-label">Matches</span>
                      </div>
                    </div>
                    <span className="view-details">View Details →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leagues;
