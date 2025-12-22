import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaCalendarAlt, FaUsers, FaDollarSign, FaMapMarkerAlt, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import './Tournaments.css';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments');
      setTournaments(res.data.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'upcoming', text: 'Upcoming' },
      registration: { class: 'registration', text: 'Registration Open' },
      ongoing: { class: 'ongoing', text: 'In Progress' },
      completed: { class: 'completed', text: 'Completed' },
      cancelled: { class: 'cancelled', text: 'Cancelled' }
    };
    return badges[status] || badges.upcoming;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (filters.sport && tournament.sport !== filters.sport) return false;
    if (filters.status && tournament.status !== filters.status) return false;
    if (filters.search && !tournament.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sports = [...new Set(tournaments.map(t => t.sport))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading tournaments...</p>
      </div>
    );
  }

  return (
    <div className="tournaments-page">
      <div className="page-header-hero">
        <div className="container">
          <h1>Tournaments</h1>
          <p>Compete in exciting tournaments and showcase your skills</p>
        </div>
      </div>

      <div className="container">
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search tournaments..."
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
              <option value="registration">Registration Open</option>
              <option value="ongoing">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="empty-state">
            <FaTrophy />
            <h3>No tournaments found</h3>
            <p>Check back later for upcoming tournaments</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {filteredTournaments.map(tournament => {
              const badge = getStatusBadge(tournament.status);
              return (
                <Link to={`/tournaments/${tournament._id}`} className="tournament-card" key={tournament._id}>
                  <div className="tournament-card-header">
                    <span className={`status-badge ${badge.class}`}>{badge.text}</span>
                    <div className="tournament-sport">{tournament.sport}</div>
                  </div>

                  <div className="tournament-card-body">
                    <h3 className="tournament-name">{tournament.name}</h3>
                    
                    <p className="tournament-description">
                      {tournament.description?.substring(0, 100)}
                      {tournament.description?.length > 100 && '...'}
                    </p>

                    <div className="tournament-meta">
                      <div className="meta-item">
                        <FaCalendarAlt />
                        <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                      </div>
                      
                      {tournament.facility && (
                        <div className="meta-item">
                          <FaMapMarkerAlt />
                          <span>{tournament.facility.name}</span>
                        </div>
                      )}

                      <div className="meta-item">
                        <FaUsers />
                        <span>{tournament.participants?.length || 0} / {tournament.maxParticipants} Teams</span>
                      </div>

                      <div className="meta-item">
                        <FaDollarSign />
                        <span>${tournament.entryFee} Entry</span>
                      </div>
                    </div>
                  </div>

                  <div className="tournament-card-footer">
                    <div className="prize-pool">
                      <FaTrophy />
                      <span>${tournament.prizePool} Prize Pool</span>
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

export default Tournaments;
