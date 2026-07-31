const sequelize = require('../config/database');
const College = require('./College');
const SuperAdmin = require('./SuperAdmin');
const CollegeAdmin = require('./CollegeAdmin');
const Admin = CollegeAdmin;  // backward-compat alias
const Department = require('./Department');
const Position = require('./Position');
const Student = require('./Student');
const Voter = require('./Voter');  // legacy voter model
const Election = require('./Election');
const Candidate = require('./Candidate');
const Vote = require('./Vote');
const AuditLog = require('./AuditLog');
const CandidateVoteTotal = require('./CandidateVoteTotal');
const Notification = require('./Notification');

// ── Associations ──────────────────────────────
College.hasMany(CollegeAdmin, { foreignKey: 'CollegeID', onDelete: 'CASCADE' });
CollegeAdmin.belongsTo(College, { foreignKey: 'CollegeID' });

College.hasMany(Department, { foreignKey: 'CollegeID', onDelete: 'CASCADE' });
Department.belongsTo(College, { foreignKey: 'CollegeID' });

College.hasMany(Position, { foreignKey: 'CollegeID', onDelete: 'CASCADE' });
Position.belongsTo(College, { foreignKey: 'CollegeID' });

College.hasMany(Student, { foreignKey: 'CollegeID', onDelete: 'CASCADE' });
Student.belongsTo(College, { foreignKey: 'CollegeID' });

College.hasMany(Election, { foreignKey: 'CollegeID', onDelete: 'CASCADE' });
Election.belongsTo(College, { foreignKey: 'CollegeID' });

Election.hasMany(Candidate, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
Candidate.belongsTo(Election, { foreignKey: 'ElectionID' });

Election.hasMany(Vote, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
Vote.belongsTo(Election, { foreignKey: 'ElectionID' });

Candidate.hasMany(Vote, { foreignKey: 'CandidateID', onDelete: 'CASCADE' });
Vote.belongsTo(Candidate, { foreignKey: 'CandidateID' });

Student.hasMany(Vote, { foreignKey: 'StudentID', onDelete: 'SET NULL' });
Vote.belongsTo(Student, { foreignKey: 'StudentID' });

Candidate.hasOne(CandidateVoteTotal, { foreignKey: 'CandidateID', onDelete: 'CASCADE' });
CandidateVoteTotal.belongsTo(Candidate, { foreignKey: 'CandidateID' });

Election.hasMany(CandidateVoteTotal, { foreignKey: 'ElectionID', onDelete: 'CASCADE' });
CandidateVoteTotal.belongsTo(Election, { foreignKey: 'ElectionID' });

module.exports = { 
  sequelize, College, SuperAdmin, CollegeAdmin, Admin, Department, Position, 
  Student, Voter, Election, Candidate, Vote, AuditLog, CandidateVoteTotal, Notification 
};
