const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  VoteID:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ElectionID:        { type: DataTypes.INTEGER, allowNull: false },
  CandidateID:       { type: DataTypes.INTEGER, allowNull: false },
  VoterID:           { type: DataTypes.INTEGER, allowNull: true, comment: 'NULL for kiosk-mode votes' },
  VoteTime:          { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  EncryptedVoteHash: { type: DataTypes.STRING(255), allowNull: false },
  IsKioskVote:       { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'Votes', timestamps: true });

module.exports = Vote;
