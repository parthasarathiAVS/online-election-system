const { Election, Candidate, Vote, Voter, CandidateVoteTotal, sequelize } = require('../models');
const { logAction } = require('../utils/auditLogger');
const { updateLiveExcelFile } = require('../utils/excelExporter');
const crypto = require('crypto');

// ── Helpers ────────────────────────────────────────────────────
const autoUpdateStatus = async (election) => {
  const now   = new Date();
  const start = new Date(election.StartTime);
  const end   = new Date(election.EndTime);
  let status  = election.Status;

  if (election.Status === 'Archived') return election;

  if      (now < start)               status = 'Upcoming';
  else if (now >= start && now <= end) status = 'Live';
  else                                 status = 'Ended';

  if (status !== election.Status) {
    election.Status = status;
    await election.save();
    await logAction('Auto Status Update', null, `Election "${election.Title}" → ${status}`);
  }
  return election;
};

// ══════════════════════════════════════════════
//  VOTER VIEWS
// ══════════════════════════════════════════════

exports.getActiveElections = async (req, res) => {
  try {
    const elections = await Election.findAll({
      where: { Status: ['Upcoming', 'Live'] },
      order: [['StartTime', 'ASC']]
    });
    for (const e of elections) await autoUpdateStatus(e);
    res.json(elections.filter(e => !e.IsKioskMode)); // Hide kiosk elections from remote voters
  } catch (err) {
    res.status(500).json({ message: 'Error fetching elections.' });
  }
};

exports.getElectionDetails = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId);
    if (!election || election.IsKioskMode) return res.status(404).json({ message: 'Election not found or unavailable for remote voting.' });
    await autoUpdateStatus(election);

    // Get candidates WITHOUT vote counts
    const candidates = await Candidate.findAll({
      where: { ElectionID: electionId },
      attributes: ['CandidateID', 'FullName', 'Party', 'Symbol', 'PhotoURL', 'Manifesto', 'Color'],
      order: [['DisplayOrder', 'ASC']]
    });

    res.json({ election, candidates });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching election details.' });
  }
};

// ══════════════════════════════════════════════
//  REMOTE VOTING (Requires Voter Login)
// ══════════════════════════════════════════════

exports.castVote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { electionId, candidateId } = req.body;
    const voterId = req.user.id;

    if (!electionId || !candidateId) {
      await t.rollback();
      return res.status(400).json({ message: 'Election ID and Candidate ID are required.' });
    }

    // 1. Verify Voter
    const voter = await Voter.findByPk(voterId, { transaction: t });
    if (!voter) { await t.rollback(); return res.status(404).json({ message: 'Voter not found.' }); }
    if (voter.Status === 'disabled') { await t.rollback(); return res.status(403).json({ message: 'Account disabled.' }); }
    if (voter.HasVoted) { await t.rollback(); return res.status(400).json({ message: 'You have already cast your vote.' }); }

    // 2. Verify Election
    const election = await Election.findByPk(electionId, { transaction: t });
    if (!election) { await t.rollback(); return res.status(404).json({ message: 'Election not found.' }); }
    await autoUpdateStatus(election);
    if (election.Status !== 'Live') { await t.rollback(); return res.status(400).json({ message: 'Voting is not active for this election.' }); }
    if (election.IsKioskMode) { await t.rollback(); return res.status(403).json({ message: 'This election requires in-person kiosk voting.' }); }

    // 3. Verify Candidate
    const candidate = await Candidate.findOne({ where: { CandidateID: candidateId, ElectionID: electionId }, transaction: t });
    if (!candidate) { await t.rollback(); return res.status(404).json({ message: 'Candidate not found.' }); }

    // 4. Record Vote
    const hashData = `REMOTE-${voterId}-${electionId}-${candidateId}-${Date.now()}`;
    const voteHash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(hashData).digest('hex');

    await Vote.create({
      ElectionID:        electionId,
      CandidateID:       candidateId,
      VoterID:           voterId,
      VoteTime:          new Date(),
      EncryptedVoteHash: voteHash,
      IsKioskVote:       false
    }, { transaction: t });

    await CandidateVoteTotal.increment('VoteCount', {
      by: 1,
      where: { CandidateID: candidateId },
      transaction: t
    });

    // 5. Update Voter
    voter.HasVoted = true;
    await voter.save({ transaction: t });

    await t.commit();
    updateLiveExcelFile(electionId); // Trigger real-time Excel sync in background
    await logAction('Remote Vote Cast', req, `Voter "${voter.FullName}" voted in "${election.Title}"`);

    res.json({ message: 'Vote cast successfully. Thank you for voting!', receipt: voteHash });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error casting vote.' });
  }
};
