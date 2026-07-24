const sequelize = require('../config/database');
const Admin     = require('./Admin');
const Voter     = require('./Voter');
const Election  = require('./Election');
const Candidate = require('./Candidate');
const Vote      = require('./Vote');
const AuditLog  = require('./AuditLog');
const CandidateVoteTotal = require('./CandidateVoteTotal');

// ── Associations ──────────────────────────────
Election.hasMany(Candidate, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
Candidate.belongsTo(Election, { foreignKey: 'ElectionID' });

Election.hasMany(Vote, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
Vote.belongsTo(Election, { foreignKey: 'ElectionID' });

Candidate.hasMany(Vote, { foreignKey: 'CandidateID', onDelete: 'CASCADE' });
Vote.belongsTo(Candidate, { foreignKey: 'CandidateID' });

Voter.hasMany(Vote, { foreignKey: 'VoterID', onDelete: 'SET NULL' });
Vote.belongsTo(Voter, { foreignKey: 'VoterID' });

// CandidateVoteTotal Associations
Candidate.hasOne(CandidateVoteTotal, { foreignKey: 'CandidateID', onDelete: 'CASCADE' });
CandidateVoteTotal.belongsTo(Candidate, { foreignKey: 'CandidateID' });

Election.hasMany(CandidateVoteTotal, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
CandidateVoteTotal.belongsTo(Election, { foreignKey: 'ElectionID' });

module.exports = { sequelize, Admin, Voter, Election, Candidate, Vote, AuditLog, CandidateVoteTotal };
