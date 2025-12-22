const express = require('express');
const router = express.Router();
const League = require('../models/League');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leagues
// @desc    Get all leagues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isPublic: true };
    
    if (req.query.sport) query.sport = req.query.sport;
    if (req.query.facility) query.facility = req.query.facility;
    if (req.query.status) query.status = req.query.status;

    const leagues = await League.find(query)
      .populate('facility', 'name address')
      .populate('coordinator', 'firstName lastName')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: leagues.length,
      data: leagues
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/leagues/:id
// @desc    Get league by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .populate('facility')
      .populate('coordinator', 'firstName lastName email')
      .populate('teams.captain', 'firstName lastName')
      .populate('teams.players.user', 'firstName lastName')
      .populate('matches.court', 'name');

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    res.json({ success: true, data: league });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/leagues/:id/standings
// @desc    Get league standings
// @access  Public
router.get('/:id/standings', async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    // Sort teams by points, then goal difference
    const standings = league.teams
      .map((team, index) => ({
        position: 0,
        teamIndex: index,
        name: team.name,
        played: team.wins + team.losses + team.draws,
        wins: team.wins,
        draws: team.draws,
        losses: team.losses,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalsFor - team.goalsAgainst,
        points: team.points
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      })
      .map((team, index) => ({ ...team, position: index + 1 }));

    res.json({
      success: true,
      data: standings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/leagues
// @desc    Create a league
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    req.body.coordinator = req.user.id;
    const league = await League.create(req.body);

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: league
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/leagues/:id
// @desc    Update league
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const league = await League.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    res.json({
      success: true,
      message: 'League updated successfully',
      data: league
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/leagues/:id/register-team
// @desc    Register a team for the league
// @access  Private
router.post('/:id/register-team', protect, async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    if (league.status !== 'registration-open') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not open for this league'
      });
    }

    if (league.teams.length >= league.maxTeams) {
      return res.status(400).json({
        success: false,
        message: 'League is full'
      });
    }

    const { teamName, players } = req.body;

    // Check if user is already captain of a team in this league
    const existingTeam = league.teams.find(
      team => team.captain.toString() === req.user.id
    );

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as captain for this league'
      });
    }

    league.teams.push({
      name: teamName,
      captain: req.user.id,
      players: players || []
    });

    await league.save();

    res.json({
      success: true,
      message: 'Team registered successfully',
      data: league
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/leagues/:id/matches/:matchIndex
// @desc    Update match result
// @access  Private/Admin
router.put('/:id/matches/:matchIndex', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    const matchIndex = parseInt(req.params.matchIndex);
    if (matchIndex < 0 || matchIndex >= league.matches.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid match index'
      });
    }

    const { homeScore, awayScore, status } = req.body;
    const match = league.matches[matchIndex];

    // Update match
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.status = status || 'completed';

    // Update team standings
    if (status === 'completed') {
      const homeTeam = league.teams[match.homeTeam];
      const awayTeam = league.teams[match.awayTeam];

      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;
      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeTeam.wins += 1;
        homeTeam.points += 3;
        awayTeam.losses += 1;
      } else if (homeScore < awayScore) {
        awayTeam.wins += 1;
        awayTeam.points += 3;
        homeTeam.losses += 1;
      } else {
        homeTeam.draws += 1;
        awayTeam.draws += 1;
        homeTeam.points += 1;
        awayTeam.points += 1;
      }
    }

    await league.save();

    res.json({
      success: true,
      message: 'Match result updated successfully',
      data: league
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/leagues/:id/generate-schedule
// @desc    Generate match schedule
// @access  Private/Admin
router.post('/:id/generate-schedule', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    if (league.teams.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 2 teams to generate schedule'
      });
    }

    const numTeams = league.teams.length;
    const matches = [];

    // Round-robin schedule
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matches.push({
          homeTeam: i,
          awayTeam: j,
          status: 'scheduled',
          week: Math.floor(matches.length / Math.floor(numTeams / 2)) + 1
        });
      }
    }

    league.matches = matches;
    await league.save();

    res.json({
      success: true,
      message: 'Schedule generated successfully',
      data: league
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/leagues/:id
// @desc    Delete league
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const league = await League.findByIdAndDelete(req.params.id);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: 'League not found'
      });
    }

    res.json({
      success: true,
      message: 'League deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
