const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
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
  banner: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationStartDate: Date,
  registrationEndDate: Date,
  format: {
    type: String,
    enum: ['single-elimination', 'double-elimination', 'round-robin', 'swiss', 'group-stage-knockout'],
    default: 'single-elimination'
  },
  category: {
    type: String,
    enum: ['open', 'amateur', 'professional', 'junior', 'senior', 'women', 'men', 'mixed'],
    default: 'open'
  },
  teamBased: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 32
  },
  minParticipants: {
    type: Number,
    default: 4
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamName: String,
    teamMembers: [{
      name: String,
      email: String,
      phone: String
    }],
    seed: Number,
    registeredAt: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'withdrawn', 'disqualified'],
      default: 'registered'
    }
  }],
  brackets: {
    rounds: [{
      name: String, // e.g., "Round of 16", "Quarter Finals"
      matches: [{
        matchNumber: Number,
        participant1: Number, // index in participants
        participant2: Number,
        score1: Number,
        score2: Number,
        winner: Number,
        court: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Court'
        },
        scheduledDate: Date,
        scheduledTime: String,
        status: {
          type: String,
          enum: ['scheduled', 'in-progress', 'completed', 'walkover', 'cancelled'],
          default: 'scheduled'
        },
        sets: [{
          score1: Number,
          score2: Number
        }]
      }]
    }]
  },
  groups: [{
    name: String,
    participants: [Number], // indices in participants array
    standings: [{
      participant: Number,
      played: Number,
      won: Number,
      lost: Number,
      drawn: Number,
      points: Number,
      setsWon: Number,
      setsLost: Number
    }],
    matches: [{
      participant1: Number,
      participant2: Number,
      score1: Number,
      score2: Number,
      scheduledDate: Date,
      scheduledTime: String,
      status: String
    }]
  }],
  entryFee: {
    type: Number,
    default: 0
  },
  memberDiscount: {
    type: Number,
    default: 0
  },
  prizes: [{
    position: Number,
    title: String,
    prize: String,
    amount: Number
  }],
  totalPrizePool: {
    type: Number,
    default: 0
  },
  rules: [String],
  equipment: {
    provided: Boolean,
    requirements: [String]
  },
  schedule: [{
    date: Date,
    events: [{
      time: String,
      description: String,
      court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court'
      }
    }]
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    tier: {
      type: String,
      enum: ['title', 'gold', 'silver', 'bronze']
    }
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  officials: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['referee', 'umpire', 'line-judge', 'coordinator']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'registration-open', 'registration-closed', 'in-progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  results: {
    champion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    thirdPlace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Generate brackets for single elimination
tournamentSchema.methods.generateSingleEliminationBracket = function() {
  const numParticipants = this.participants.length;
  const rounds = Math.ceil(Math.log2(numParticipants));
  const totalSlots = Math.pow(2, rounds);
  
  const roundNames = {
    1: 'Final',
    2: 'Semi Finals',
    3: 'Quarter Finals',
    4: 'Round of 16',
    5: 'Round of 32',
    6: 'Round of 64'
  };

  this.brackets = { rounds: [] };
  
  let matchNumber = 1;
  for (let round = rounds; round >= 1; round--) {
    const matchesInRound = Math.pow(2, round - 1);
    const roundMatches = [];
    
    for (let i = 0; i < matchesInRound; i++) {
      roundMatches.push({
        matchNumber: matchNumber++,
        participant1: round === rounds ? i * 2 : null,
        participant2: round === rounds ? i * 2 + 1 : null,
        status: 'scheduled'
      });
    }
    
    this.brackets.rounds.push({
      name: roundNames[round] || `Round ${rounds - round + 1}`,
      matches: roundMatches
    });
  }
  
  return this.brackets;
};

module.exports = mongoose.model('Tournament', tournamentSchema);
