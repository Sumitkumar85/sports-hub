import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Leagues.css';

const LeagueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('standings');
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchLeague();
  }, [id]);

  const fetchLeague = async () => {
    try {
      const res = await api.get(`/leagues/${id}`);
      setLeague(res.data.data);
    } catch (error) {
      console.error('Error fetching league:', error);
      toast.error('League not found');
      navigate('/leagues');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to register for the league');
      navigate('/login');
      return;
    }

    const teamName = prompt('Enter your team name:');
    if (!teamName) {
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/leagues/${id}/register-team`, { teamName });
      toast.success('Successfully registered for the league!');
      fetchLeague();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const isRegistered = league?.teams?.some(
    t => t.captain?._id === user?._id || t.captain === user?._id
  );

  const canRegister = league?.status === 'registration-open' &&
    !isRegistered &&
    league?.teams?.length < league?.maxTeams;

  // Sort standings by points - teams array contains the standings data
  const sortedStandings = league?.teams?.slice().sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
    const bGD = (b.goalsFor || 0) - (b.goalsAgainst || 0);
    const aGD = (a.goalsFor || 0) - (a.goalsAgainst || 0);
    return bGD - aGD;
  }) || [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading league details...</p>
      </div>
    );
  }

  if (!league) return null;

  const badge = getStatusBadge(league.status);

  return (
    <div className="league-detail-page">
      <div className="league-hero">
        <div className="container">
          <button className="btn-back" onClick={() => navigate('/leagues')}>
            <FaArrowLeft /> Back to Leagues
          </button>

          <div className="league-hero-content">
            <div className="league-hero-info">
              <span className={`status-badge ${badge.class}`}>{badge.text}</span>
              <h1>{league.name}</h1>
              <div className="league-hero-meta">
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(league.startDate)} - {formatDate(league.endDate)}</span>
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

            <div className="league-hero-actions">
              {canRegister && (
                <button
                  className="btn btn-lg"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : `Register Team - $${league.registrationFee}`}
                </button>
              )}

              {isRegistered && (
                <div className="registered-badge">
                  ✓ Your team is registered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="league-content">
        <div className="container">
          <div className="league-tabs">
            <button
              className={`league-tab ${activeTab === 'standings' ? 'active' : ''}`}
              onClick={() => setActiveTab('standings')}
            >
              Standings
            </button>
            <button
              className={`league-tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              Schedule
            </button>
            <button
              className={`league-tab ${activeTab === 'teams' ? 'active' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              Teams
            </button>
            <button
              className={`league-tab ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>

          {/* Standings Tab */}
          {activeTab === 'standings' && (
            <div className="standings-content">
              {sortedStandings.length === 0 ? (
                <div className="empty-state">
                  <FaTrophy />
                  <h3>No standings yet</h3>
                  {league.status === 'registration-open' ? (
                    <>
                      <p>Standings will be available once the season begins and matches are played</p>
                      {canRegister && (
                        <button
                          className="btn"
                          onClick={handleRegister}
                          style={{ marginTop: '1rem' }}
                          disabled={registering}
                        >
                          {registering ? 'Registering...' : 'Register Your Team Now'}
                        </button>
                      )}
                    </>
                  ) : league.status === 'upcoming' ? (
                    <p>The league hasn't started yet. Check back when the season begins!</p>
                  ) : league.status === 'in-progress' ? (
                    <p>Standings will appear once matches have been played</p>
                  ) : league.status === 'completed' ? (
                    <p>This season has ended. No final standings were recorded.</p>
                  ) : (
                    <p>Standings will appear once the season begins</p>
                  )}
                </div>
              ) : (
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Team</th>
                      <th>P</th>
                      <th>W</th>
                      <th>D</th>
                      <th>L</th>
                      <th>GF</th>
                      <th>GA</th>
                      <th>GD</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((team, index) => (
                      <tr key={team._id || index}>
                        <td className={`rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                          {index + 1}
                        </td>
                        <td className="team-name">{team.name || 'Unknown Team'}</td>
                        <td>{(team.wins || 0) + (team.losses || 0) + (team.draws || 0)}</td>
                        <td>{team.wins || 0}</td>
                        <td>{team.draws || 0}</td>
                        <td>{team.losses || 0}</td>
                        <td>{team.goalsFor || 0}</td>
                        <td>{team.goalsAgainst || 0}</td>
                        <td>{(team.goalsFor || 0) - (team.goalsAgainst || 0)}</td>
                        <td className="points">{team.points || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="schedule-content">
              {!league.matches || league.matches.length === 0 ? (
                <div className="empty-state">
                  <FaCalendarAlt />
                  <h3>No matches scheduled</h3>
                  <p>Match schedule will be available soon</p>
                </div>
              ) : (
                <div className="schedule-list">
                  {league.matches.map((match, index) => {
                    const homeTeam = league.teams[match.homeTeam];
                    const awayTeam = league.teams[match.awayTeam];
                    return (
                      <div className="schedule-item" key={index}>
                        <div className="schedule-date">
                          {match.date ? (
                            <>
                              <div className="day">{new Date(match.date).getDate()}</div>
                              <div className="month">
                                {new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </>
                          ) : (
                            <div className="week">Week {match.week || index + 1}</div>
                          )}
                        </div>

                        <div className="schedule-matchup">
                          <div className="schedule-team">
                            {homeTeam?.name || 'TBD'}
                          </div>

                          {match.homeScore !== undefined && match.awayScore !== undefined ? (
                            <div className="schedule-score">
                              <span>{match.homeScore}</span>
                              <span className="divider">-</span>
                              <span>{match.awayScore}</span>
                            </div>
                          ) : (
                            <span className="schedule-vs">VS</span>
                          )}

                          <div className="schedule-team">
                            {awayTeam?.name || 'TBD'}
                          </div>
                        </div>

                        <div className="schedule-info">
                          <div className="schedule-time">{match.time || 'Time TBD'}</div>
                          <div className={`match-status ${match.status}`}>{match.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="teams-content">
              {!league.teams || league.teams.length === 0 ? (
                <div className="empty-state">
                  <FaUsers />
                  <h3>No teams registered</h3>
                  <p>Be the first to register your team!</p>
                </div>
              ) : (
                <div className="teams-grid">
                  {league.teams.map((team, index) => {
                    const captainName = team.captain
                      ? `${team.captain.firstName || ''} ${team.captain.lastName || ''}`.trim() || 'Unknown'
                      : 'Unknown';
                    const played = (team.wins || 0) + (team.losses || 0) + (team.draws || 0);

                    return (
                      <div className="team-card" key={team._id || index}>
                        <div className="team-card-header">
                          <div className="team-avatar">
                            {(team.name || 'T')[0].toUpperCase()}
                          </div>
                          <div className="team-info">
                            <div className="team-name">{team.name}</div>
                            <div className="team-captain">
                              Captain: {captainName}
                            </div>
                          </div>
                        </div>

                        <div className="team-stats">
                          <div className="stat">
                            <div className="stat-value">{played}</div>
                            <div className="stat-label">Played</div>
                          </div>
                          <div className="stat">
                            <div className="stat-value">{team.wins || 0}</div>
                            <div className="stat-label">Won</div>
                          </div>
                          <div className="stat">
                            <div className="stat-value">{team.points || 0}</div>
                            <div className="stat-label">Points</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-content">
              <div className="league-grid">
                <div className="league-main">
                  <h2>About This League</h2>
                  <p className="league-description-full">
                    {league.description || 'No description available.'}
                  </p>

                  {league.rules && league.rules.length > 0 && (
                    <div className="league-rules">
                      <h3>League Rules</h3>
                      <ul>
                        {league.rules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="league-sidebar">
                  <div className="sidebar-card">
                    <h3>League Details</h3>
                    <div className="info-row">
                      <span className="label">Sport</span>
                      <span className="value">{league.sport}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Season Start</span>
                      <span className="value">{formatDate(league.startDate)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Season End</span>
                      <span className="value">{formatDate(league.endDate)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Registration Fee</span>
                      <span className="value">${league.registrationFee}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Max Teams</span>
                      <span className="value">{league.maxTeams}</span>
                    </div>
                  </div>

                  {league.facility && (
                    <div className="sidebar-card">
                      <h3>Venue</h3>
                      <div className="info-row">
                        <span className="label">Location</span>
                        <span className="value">{league.facility.name}</span>
                      </div>
                      {league.facility.address && (
                        <div className="info-row">
                          <span className="label">Address</span>
                          <span className="value">{league.facility.address.city}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetail;
