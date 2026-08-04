const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const path     = require('path');
const { Op }   = require('sequelize');
const { Election, Candidate, Voter, Vote, AuditLog, CandidateVoteTotal, sequelize, Student, College, Department, Position } = require('../models');
const { logAction }     = require('../utils/auditLogger');
const { generateExcel, updateLiveExcelFile } = require('../utils/excelExporter');

// ── Helpers ────────────────────────────────────────────────────
const autoUpdateStatus = async (election) => {
  // Time-based auto updates are disabled per user request.
  // Status is purely manual now.
  return election;
};

// ══════════════════════════════════════════════
//  ELECTION MANAGEMENT
// ══════════════════════════════════════════════

exports.createElection = async (req, res) => {
  try {
    const { title, description, isKioskMode } = req.body;
    if (!title)
      return res.status(400).json({ message: 'Title is required.' });

    const election = await Election.create({
      Title:       title,
      Description: description || '',
      StartTime:   null,
      EndTime:     null,
      Status:      'Upcoming',
      IsKioskMode: isKioskMode === true || isKioskMode === 'true'
    });

    await autoUpdateStatus(election);
    await logAction('Election Created', req, `"${title}" | Kiosk: ${election.IsKioskMode}`);
    res.status(201).json(election);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating election.' });
  }
};

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.findAll({ order: [['createdAt', 'DESC']] });
    for (const e of elections) await autoUpdateStatus(e);
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching elections.' });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, isKioskMode } = req.body;
    const election = await Election.findByPk(id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    if (title)                  election.Title       = title;
    if (description !== undefined) election.Description = description;
    if (status)                 election.Status      = status;
    if (isKioskMode !== undefined) election.IsKioskMode = isKioskMode;

    await election.save();
    await autoUpdateStatus(election);
    await logAction('Election Updated', req, `ID:${id}`);
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error updating election.' });
  }
};

exports.archiveElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findByPk(id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });
    if (election.Status !== 'Ended')
      return res.status(400).json({ message: 'Only ended elections can be archived.' });

    election.Status = 'Archived';
    await election.save();
    await logAction('Election Archived', req, `"${election.Title}"`);
    res.json({ message: 'Election archived.', election });
  } catch (err) {
    res.status(500).json({ message: 'Error archiving election.' });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findByPk(id);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    const title = election.Title;
    await election.destroy(); // Due to CASCADE, candidates and votes will also be deleted
    await logAction('Election Deleted', req, `"${title}"`);
    res.json({ message: 'Election deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting election.' });
  }
};

exports.resetElection = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const election = await Election.findByPk(id);
    if (!election) { await t.rollback(); return res.status(404).json({ message: 'Election not found.' }); }

    await Vote.destroy({ where: { ElectionID: id }, transaction: t });
    await CandidateVoteTotal.update({ VoteCount: 0 }, { where: { ElectionID: id }, transaction: t });
    await Voter.update({ HasVoted: false }, { where: {}, transaction: t });

    await t.commit();
    await logAction('Election Reset', req, `All votes deleted for "${election.Title}"`);
    res.json({ message: 'Election reset. All votes deleted.' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error resetting election.' });
  }
};

// ══════════════════════════════════════════════
//  CANDIDATE MANAGEMENT
// ══════════════════════════════════════════════

exports.addCandidate = async (req, res) => {
  try {
    const { electionId, fullName, party, symbol, manifesto, displayOrder, color } = req.body;
    if (!electionId || !fullName || !party)
      return res.status(400).json({ message: 'ElectionId, fullName, and party are required.' });

    const photoURL = req.file ? `/uploads/${req.file.filename}` : '';

    const candidate = await Candidate.create({
      ElectionID:   electionId,
      FullName:     fullName,
      Party:        party,
      Symbol:       symbol || '🗳️',
      PhotoURL:     photoURL,
      Manifesto:    manifesto || '',
      DisplayOrder: parseInt(displayOrder) || 0,
      Color:        color || '#3b82f6'
    });

    await CandidateVoteTotal.create({
      CandidateID: candidate.CandidateID,
      ElectionID: candidate.ElectionID,
      VoteCount: 0
    });

    await logAction('Candidate Added', req, `"${fullName}" (${party}) → Election ${electionId}`);
    res.status(201).json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding candidate.' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { electionId } = req.query;
    const where = electionId ? { ElectionID: electionId } : {};
    const candidates = await Candidate.findAll({
      where,
      include: [
        { model: Department, as: 'Department', attributes: ['Name'] },
        { model: Position, as: 'Position', attributes: ['Title'] }
      ],
      order: [['DisplayOrder', 'ASC'], ['createdAt', 'ASC']]
    });
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching candidates.' });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, party, symbol, manifesto, displayOrder, color } = req.body;
    const candidate = await Candidate.findByPk(id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });

    if (fullName)               candidate.FullName     = fullName;
    if (party)                  candidate.Party        = party;
    if (symbol)                 candidate.Symbol       = symbol;
    if (manifesto !== undefined) candidate.Manifesto   = manifesto;
    if (displayOrder !== undefined) candidate.DisplayOrder = parseInt(displayOrder);
    if (color)                  candidate.Color        = color;
    if (req.file)               candidate.PhotoURL     = `/uploads/${req.file.filename}`;

    await candidate.save();
    await logAction('Candidate Updated', req, `ID:${id} "${candidate.FullName}"`);
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Error updating candidate.' });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found.' });
    const name = candidate.FullName;
    await candidate.destroy();
    await logAction('Candidate Deleted', req, `"${name}"`);
    res.json({ message: 'Candidate deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting candidate.' });
  }
};

// ══════════════════════════════════════════════
//  VOTER MANAGEMENT
// ══════════════════════════════════════════════

exports.registerVoter = async (req, res) => {
  try {
    const { voterRegistrationNumber, fullName, email, phone, password } = req.body;
    if (!voterRegistrationNumber || !fullName || !password)
      return res.status(400).json({ message: 'VoterID, fullName and password are required.' });

    const exists = await Voter.findOne({ where: { VoterRegistrationNumber: voterRegistrationNumber } });
    if (exists) return res.status(409).json({ message: 'Voter Registration Number already exists.' });

    const hash = await bcrypt.hash(password, 12);
    const voter = await Voter.create({
      VoterRegistrationNumber: voterRegistrationNumber,
      FullName:  fullName,
      Email:     email || null,
      Phone:     phone || null,
      PasswordHash: hash
    });

    await logAction('Voter Registered', req, `"${fullName}" (${voterRegistrationNumber})`);
    res.status(201).json({ id: voter.VoterID, fullName: voter.FullName, voterRegistrationNumber: voter.VoterRegistrationNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering voter.' });
  }
};

exports.getVoters = async (req, res) => {
  try {
    const voters = await Voter.findAll({
      attributes: { exclude: ['PasswordHash'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching voters.' });
  }
};

exports.toggleVoterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const voter = await Voter.findByPk(id);
    if (!voter) return res.status(404).json({ message: 'Voter not found.' });

    voter.Status = voter.Status === 'active' ? 'disabled' : 'active';
    await voter.save();
    await logAction('Voter Status Changed', req, `Voter ${id} → ${voter.Status}`);
    res.json({ id: voter.VoterID, status: voter.Status });
  } catch (err) {
    res.status(500).json({ message: 'Error updating voter status.' });
  }
};

// ══════════════════════════════════════════════
//  DASHBOARD STATS
// ══════════════════════════════════════════════

exports.getDashboardStats = async (req, res) => {
  try {
    const { electionId } = req.query;
    if (!electionId) return res.status(400).json({ message: 'electionId is required.' });

    const election = await Election.findByPk(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found.' });
    await autoUpdateStatus(election);

    const totalVoters    = await Voter.count({ where: { Status: 'active' } });
    const votesCast      = await Vote.count({ where: { ElectionID: electionId } });
    const candidateCount = await Candidate.count({ where: { ElectionID: electionId } });
    const pendingVotes   = Math.max(0, totalVoters - votesCast);
    const turnoutPct     = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : '0.0';

    res.json({
      totalVoters, votesCast, pendingVotes, candidateCount,
      turnoutPercentage: parseFloat(turnoutPct),
      electionStatus:    election.Status,
      isKioskMode:       election.IsKioskMode,
      title:             election.Title,
      startTime:         election.StartTime,
      endTime:           election.EndTime
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};

// ══════════════════════════════════════════════
//  KIOSK-MODE VOTING (No voter login needed)
// ══════════════════════════════════════════════

exports.verifyStudentForKiosk = async (req, res) => {
  try {
    const { electionId, registrationNumber } = req.body;
    if (!electionId || !registrationNumber) {
      return res.status(400).json({ message: 'Election ID and Registration Number are required.' });
    }

    const election = await Election.findByPk(electionId, {
      include: [{ model: College }]
    });

    if (!election) {
      return res.status(404).json({ message: 'Election not found.' });
    }

    if (!election.IsKioskMode) {
      return res.status(400).json({ message: 'This election does not support kiosk mode.' });
    }

    if (election.Status !== 'Live') {
      return res.status(400).json({ message: 'Election is not Live.' });
    }

    const student = await Student.findOne({
      where: {
        RegistrationNumber: registrationNumber.trim().toUpperCase()
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found with this Registration Number.' });
    }

    if (student.Status === 'disabled') {
      return res.status(403).json({ message: 'Student account is disabled.' });
    }

    let collegeMatches = false;
    if (student.CollegeID && student.CollegeID === election.CollegeID) {
      collegeMatches = true;
    } else if (student.CollegeName && election.College && student.CollegeName.trim().toLowerCase() === election.College.Name.trim().toLowerCase()) {
      collegeMatches = true;
    }

    if (!collegeMatches) {
      return res.status(403).json({ message: 'Student is not registered for this college election.' });
    }

    if (student.HasVoted) {
      return res.status(400).json({ message: 'Student has already voted in this election.' });
    }

    res.json({
      message: 'Student verified successfully. Voting terminal unlocked.',
      student: {
        id: student.StudentID,
        fullName: student.FullName,
        registrationNumber: student.RegistrationNumber,
        department: student.Department,
        profilePhoto: student.ProfilePhoto
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying student.' });
  }
};

exports.kioskCastVote = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { electionId, candidateId, studentId } = req.body;
    if (!electionId || !candidateId || !studentId) {
      await t.rollback();
      return res.status(400).json({ message: 'electionId, candidateId and studentId are required.' });
    }

    const election = await Election.findByPk(electionId, { transaction: t });
    if (!election) { await t.rollback(); return res.status(404).json({ message: 'Election not found.' }); }

    await autoUpdateStatus(election);
    if (!election.IsKioskMode) {
      await t.rollback();
      return res.status(403).json({ message: 'This election does not support kiosk mode.' });
    }
    if (election.Status !== 'Live') {
      await t.rollback();
      return res.status(400).json({ message: 'Election is not Live.' });
    }

    const candidate = await Candidate.findOne({ where: { CandidateID: candidateId, ElectionID: electionId }, transaction: t });
    if (!candidate) { await t.rollback(); return res.status(404).json({ message: 'Candidate not found in this election.' }); }

    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) { await t.rollback(); return res.status(404).json({ message: 'Student not found.' }); }
    if (student.HasVoted) { await t.rollback(); return res.status(403).json({ message: 'Student has already voted.' }); }

    const hashData = `KIOSK-${electionId}-${candidateId}-${Date.now()}-${Math.random()}`;
    const voteHash = crypto.createHmac('sha256', process.env.JWT_SECRET).update(hashData).digest('hex');

    const vote = await Vote.create({
      ElectionID:        electionId,
      CandidateID:       candidateId,
      StudentID:         studentId,
      VoteTime:          new Date(),
      EncryptedVoteHash: voteHash,
      IsKioskVote:       true
    }, { transaction: t });

    await CandidateVoteTotal.increment('VoteCount', {
      by: 1,
      where: { CandidateID: candidateId },
      transaction: t
    });

    // Mark student as having voted
    await student.update({ HasVoted: true }, { transaction: t });

    await t.commit();
    updateLiveExcelFile(electionId); // Trigger real-time Excel sync in background
    await logAction('Kiosk Vote Cast', req, `Student ${student.RegistrationNumber} voted for "${candidate.FullName}" | Election: "${election.Title}" | Hash: ${voteHash.slice(0, 16)}…`);

    res.json({ message: 'Kiosk vote recorded successfully.', receipt: voteHash, voteId: vote.VoteID });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error casting kiosk vote.' });
  }
};

// ══════════════════════════════════════════════
//  RESULTS (Admin only, only after Ended)
// ══════════════════════════════════════════════

exports.getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found.' });
    await autoUpdateStatus(election);

    if (election.Status !== 'Live' && election.Status !== 'Ended' && election.Status !== 'Archived')
      return res.status(403).json({ message: 'Results are only available for Live, Ended, or Archived elections.' });

    const candidates = await Candidate.findAll({
      where:   { ElectionID: electionId },
      include: [{ model: CandidateVoteTotal, attributes: ['VoteCount'] }],
      attributes: [
        'CandidateID', 'FullName', 'Party', 'Symbol', 'PhotoURL', 'Color'
      ],
      order: [[CandidateVoteTotal, 'VoteCount', 'DESC']]
    });

    const results = candidates.map(c => {
      const raw = c.get({ plain: true });
      const voteCount = raw.CandidateVoteTotal ? raw.CandidateVoteTotal.VoteCount : 0;
      delete raw.CandidateVoteTotal;
      return { ...raw, VoteCount: voteCount };
    });

    const total = await Vote.count({ where: { ElectionID: electionId } });

    res.json({ electionTitle: election.Title, electionStatus: election.Status, totalVotes: total, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching results.' });
  }
};

// ══════════════════════════════════════════════
//  EXPORTS (PDF / Excel)
// ══════════════════════════════════════════════

exports.exportExcel = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found.' });

    if (election.Status !== 'Live' && election.Status !== 'Ended' && election.Status !== 'Archived')
      return res.status(403).json({ message: 'Results only available for Live, Ended, or Archived elections.' });

    const candidates = await Candidate.findAll({
      where:   { ElectionID: electionId },
      include: [{ model: CandidateVoteTotal, attributes: ['VoteCount'] }],
      attributes: ['CandidateID', 'FullName', 'Party', 'Symbol', 'Manifesto'],
      order: [[CandidateVoteTotal, 'VoteCount', 'DESC']]
    });

    const results = candidates.map(c => {
      const raw = c.get({ plain: true });
      const voteCount = raw.CandidateVoteTotal ? raw.CandidateVoteTotal.VoteCount : 0;
      delete raw.CandidateVoteTotal;
      return { ...raw, VoteCount: voteCount };
    });

    const total  = await Vote.count({ where: { ElectionID: electionId } });
    const buffer = await generateExcel(election, results, total);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=results_${election.Title.replace(/\s+/g,'_')}.xlsx`);
    await logAction('Results Exported (Excel)', req, `Election: "${election.Title}"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating Excel export.' });
  }
};

// ══════════════════════════════════════════════
//  AUDIT LOGS
// ══════════════════════════════════════════════

exports.getAuditLogs = async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit) || 200;
    const offset = parseInt(req.query.offset) || 0;
    const logs   = await AuditLog.findAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit logs.' });
  }
};
