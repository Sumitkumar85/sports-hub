const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/tournaments
// @desc    Get all tournaments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const query = { isPublic: true };
    
    if (req.query.sport) query.sport = req.query.sport;
    if (req.query.facility) query.facility = req.query.facility;
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;
    if (req.query.featured === 'true') query.isFeatured = true;

    const tournaments = await Tournament.find(query)
      .populate('facility', 'name address')
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/tournaments/upcoming
// @desc    Get upcoming tournaments
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      isPublic: true,
      startDate: { $gte: new Date() },
      status: { $in: ['upcoming', 'registration-open'] }
    })
      .populate('facility', 'name address')
      .sort({ startDate: 1 })
      .limit(10);

    res.json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('facility')
      .populate('organizer', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName')
      .populate('officials.user', 'firstName lastName')
      .populate('results.champion', 'firstName lastName')
      .populate('results.runnerUp', 'firstName lastName')
      .populate('results.thirdPlace', 'firstName lastName');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({ success: true, data: tournament });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/tournaments/:id/brackets
// @desc    Get tournament brackets
// @access  Public
router.get('/:id/brackets', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participants.user', 'firstName lastName')
      .populate('brackets.rounds.matches.court', 'name');

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Map participant indices to names
    const brackets = tournament.brackets.rounds.map(round => ({
      name: round.name,
      matches: round.matches.map(match => ({
        ...match.toObject(),
        participant1Name: match.participant1 !== null && tournament.participants[match.participant1]
          ? tournament.participants[match.participant1].teamName || 
            `${tournament.participants[match.participant1].user?.firstName || ''} ${tournament.participants[match.participant1].user?.lastName || ''}`.trim()
          : 'TBD',
        participant2Name: match.participant2 !== null && tournament.participants[match.participant2]
          ? tournament.participants[match.participant2].teamName ||
            `${tournament.participants[match.participant2].user?.firstName || ''} ${tournament.participants[match.participant2].user?.lastName || ''}`.trim()
          : 'TBD'
      }))
    }));

    res.json({
      success: true,
      data: {
        format: tournament.format,
        brackets
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/tournaments
// @desc    Create a tournament
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    req.body.organizer = req.user.id;
    const tournament = await Tournament.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: tournament
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/tournaments/:id
// @desc    Update tournament
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      data: tournament
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/tournaments/:id/register
// @desc    Register for tournament
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    if (tournament.status !== 'registration-open') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not open for this tournament'
      });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Check if already registered
    const existingRegistration = tournament.participants.find(
      p => p.user.toString() === req.user.id
    );

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this tournament'
      });
    }

    const { teamName, teamMembers } = req.body;

    tournament.participants.push({
      user: req.user.id,
      teamName: teamName || '',
      teamMembers: teamMembers || [],
      status: 'registered',
      paymentStatus: tournament.entryFee > 0 ? 'pending' : 'paid'
    });

    await tournament.save();

    res.json({
      success: true,
      message: 'Successfully registered for tournament',
      data: tournament
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/tournaments/:id/withdraw
// @desc    Withdraw from tournament
// @access  Private
router.put('/:id/withdraw', protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const participantIndex = tournament.participants.findIndex(
      p => p.user.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this tournament'
      });
    }

    if (tournament.status === 'in-progress' || tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw from a tournament that has started'
      });
    }

    tournament.participants[participantIndex].status = 'withdrawn';
    await tournament.save();

    res.json({
      success: true,
      message: 'Successfully withdrawn from tournament'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/tournaments/:id/generate-brackets
// @desc    Generate tournament brackets
// @access  Private/Admin
router.post('/:id/generate-brackets', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const confirmedParticipants = tournament.participants.filter(
      p => p.status === 'confirmed' || p.status === 'registered'
    );

    if (confirmedParticipants.length < tournament.minParticipants) {
      return res.status(400).json({
        success: false,
        message: `Need at least ${tournament.minParticipants} participants to generate brackets`
      });
    }

    // Shuffle participants for seeding
    const shuffled = [...confirmedParticipants].sort(() => Math.random() - 0.5);

    // Update participant indices
    tournament.participants.forEach((p, index) => {
      if (p.status === 'confirmed' || p.status === 'registered') {
        p.seed = shuffled.findIndex(s => s.user.toString() === p.user.toString()) + 1;
      }
    });

    // Generate brackets based on format
    if (tournament.format === 'single-elimination') {
      tournament.generateSingleEliminationBracket();
    }

    tournament.status = 'registration-closed';
    await tournament.save();

    res.json({
      success: true,
      message: 'Brackets generated successfully',
      data: tournament.brackets
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/tournaments/:id/matches/:roundIndex/:matchIndex
// @desc    Update match result
// @access  Private/Admin
router.put('/:id/matches/:roundIndex/:matchIndex', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const roundIndex = parseInt(req.params.roundIndex);
    const matchIndex = parseInt(req.params.matchIndex);

    if (!tournament.brackets.rounds[roundIndex] || 
        !tournament.brackets.rounds[roundIndex].matches[matchIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid round or match index'
      });
    }

    const { score1, score2, sets, status } = req.body;
    const match = tournament.brackets.rounds[roundIndex].matches[matchIndex];

    match.score1 = score1;
    match.score2 = score2;
    match.status = status || 'completed';
    if (sets) match.sets = sets;

    // Determine winner
    if (status === 'completed') {
      match.winner = score1 > score2 ? match.participant1 : match.participant2;

      // Advance winner to next round
      if (roundIndex > 0) {
        const nextRound = tournament.brackets.rounds[roundIndex - 1];
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isFirstOfPair = matchIndex % 2 === 0;

        if (nextRound.matches[nextMatchIndex]) {
          if (isFirstOfPair) {
            nextRound.matches[nextMatchIndex].participant1 = match.winner;
          } else {
            nextRound.matches[nextMatchIndex].participant2 = match.winner;
          }
        }
      } else {
        // This was the final
        tournament.results = {
          champion: tournament.participants[match.winner]?.user,
          runnerUp: tournament.participants[match.winner === match.participant1 ? match.participant2 : match.participant1]?.user
        };
        tournament.status = 'completed';
      }
    }

    await tournament.save();

    res.json({
      success: true,
      message: 'Match result updated successfully',
      data: tournament
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/tournaments/:id
// @desc    Delete tournament
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
