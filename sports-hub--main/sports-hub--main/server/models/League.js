const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'League name is required'],
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['tennis', 'basketball', 'volleyball', 'badminton', 'squash', 'football', 'soccer', 'cricket', 'other']
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  description: String,
  image: String,
  season: {
    name: String,
    year: Number
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: Date,
  format: {
    type: String,
    enum: ['round-robin', 'single-elimination', 'double-elimination', 'swiss', 'league'],
    default: 'league'
  },
  teamBased: {
    type: Boolean,
    default: true
  },
  maxTeams: {
    type: Number,
    default: 16
  },
  minPlayers: {
    type: Number,
    default: 5
  },
  maxPlayers: {
    type: Number,
    default: 15
  },
  teams: [{
    name: String,
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    players: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      jerseyNumber: Number,
      position: String
    }],
    logo: String,
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 }
  }],
  matches: [{
    homeTeam: Number, // index in teams array
    awayTeam: Number,
    date: Date,
    time: String,
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court'
    },
    homeScore: Number,
    awayScore: Number,
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'postponed', 'cancelled'],
      default: 'scheduled'
    },
    week: Number
  }],
  registrationFee: {
    type: Number,
    default: 0
  },
  prizes: [{
    position: Number,
    prize: String,
    amount: Number
  }],
  rules: [String],
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['upcoming', 'registration-open', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('League', leagueSchema);
