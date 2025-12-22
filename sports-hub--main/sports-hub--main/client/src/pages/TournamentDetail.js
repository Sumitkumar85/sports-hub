import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrophy, FaCalendarAlt, FaUsers, FaDollarSign, FaMapMarkerAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Tournaments.css';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Tournament not found');
      navigate('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to register for the tournament');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/tournaments/${id}/register`);
      toast.success('Successfully registered for the tournament!');
      fetchTournament();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
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

  const isRegistered = tournament?.participants?.some(
    p => p.user?._id === user?._id || p.user === user?._id
  );

  const canRegister = tournament?.status === 'registration' && 
    !isRegistered && 
    tournament?.participants?.length < tournament?.maxParticipants;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) return null;

  const badge = getStatusBadge(tournament.status);

  return (
    <div className="tournament-detail-page">
      <div className="tournament-hero">
        <div className="container">
          <button className="btn-back" onClick={() => navigate('/tournaments')}>
            <FaArrowLeft /> Back to Tournaments
          </button>

          <div className="tournament-hero-content">
            <div className="tournament-hero-info">
              <span className={`status-badge ${badge.class}`}>{badge.text}</span>
              <h1>{tournament.name}</h1>
              <div className="tournament-hero-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(tournament.startDate)}</span>
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
              </div>
            </div>

            <div className="tournament-hero-actions">
              <div className="prize-highlight">
                <div className="prize-label">Prize Pool</div>
                <div className="prize-amount">
                  <FaTrophy /> ${tournament.prizePool}
                </div>
              </div>

              {canRegister && (
                <button 
                  className="btn btn-lg" 
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : `Register Now - $${tournament.entryFee}`}
                </button>
              )}

              {isRegistered && (
                <div className="registered-badge">
                  ✓ You are registered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tournament-content">
        <div className="container">
          <div className="tournament-grid">
            <div className="tournament-main">
              <h2>About This Tournament</h2>
              <p className="tournament-description-full">{tournament.description}</p>

              {tournament.rules && tournament.rules.length > 0 && (
                <div className="tournament-rules">
                  <h3>Tournament Rules</h3>
                  <ul>
                    {tournament.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bracket Section */}
              {tournament.bracket && tournament.bracket.length > 0 && (
                <div className="bracket-section">
                  <h2>Tournament Bracket</h2>
                  <div className="bracket-container">
                    <div className="bracket">
                      {tournament.bracket.map((round, roundIndex) => (
                        <div className="bracket-round" key={roundIndex}>
                          <div className="round-title">
                            {roundIndex === tournament.bracket.length - 1 
                              ? 'Finals' 
                              : roundIndex === tournament.bracket.length - 2 
                                ? 'Semi-Finals' 
                                : `Round ${roundIndex + 1}`}
                          </div>
                          {round.matches?.map((match, matchIndex) => (
                            <div className="bracket-match" key={matchIndex}>
                              <div className={`match-team ${match.winner === match.team1 ? 'winner' : ''}`}>
                                <span>{match.team1?.name || 'TBD'}</span>
                                <span className="score">{match.team1Score ?? '-'}</span>
                              </div>
                              <div className={`match-team ${match.winner === match.team2 ? 'winner' : ''}`}>
                                <span>{match.team2?.name || 'TBD'}</span>
                                <span className="score">{match.team2Score ?? '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Participants */}
              {tournament.participants && tournament.participants.length > 0 && (
                <div className="participants-section">
                  <h2>Registered Teams ({tournament.participants.length})</h2>
                  <div className="participants-grid">
                    {tournament.participants.map((participant, index) => (
                      <div className="participant-card" key={index}>
                        <div className="participant-avatar">
                          {(participant.teamName || participant.user?.name || 'T')[0].toUpperCase()}
                        </div>
                        <div className="participant-info">
                          <div className="name">{participant.teamName || participant.user?.name}</div>
                          <div className="team">
                            {participant.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="tournament-sidebar">
              <div className="sidebar-card">
                <h3>Tournament Details</h3>
                <div className="info-row">
                  <span className="label">Sport</span>
                  <span className="value">{tournament.sport}</span>
                </div>
                <div className="info-row">
                  <span className="label">Format</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>
                    {tournament.format?.replace('-', ' ')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Start Date</span>
                  <span className="value">{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">End Date</span>
                  <span className="value">{new Date(tournament.endDate).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <span className="label">Entry Fee</span>
                  <span className="value">${tournament.entryFee}</span>
                </div>
                <div className="info-row">
                  <span className="label">Prize Pool</span>
                  <span className="value">${tournament.prizePool}</span>
                </div>
              </div>

              <div className="sidebar-card">
                <h3>Registration</h3>
                <div className="info-row">
                  <span className="label">Max Teams</span>
                  <span className="value">{tournament.maxParticipants}</span>
                </div>
                <div className="info-row">
                  <span className="label">Registered</span>
                  <span className="value">{tournament.participants?.length || 0}</span>
                </div>
                <div className="info-row">
                  <span className="label">Spots Left</span>
                  <span className="value">
                    {tournament.maxParticipants - (tournament.participants?.length || 0)}
                  </span>
                </div>
                {tournament.registrationDeadline && (
                  <div className="info-row">
                    <span className="label">Deadline</span>
                    <span className="value">
                      {new Date(tournament.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {tournament.facility && (
                <div className="sidebar-card">
                  <h3>Venue</h3>
                  <div className="info-row">
                    <span className="label">Location</span>
                    <span className="value">{tournament.facility.name}</span>
                  </div>
                  {tournament.facility.address && (
                    <div className="info-row">
                      <span className="label">Address</span>
                      <span className="value">{tournament.facility.address.city}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
