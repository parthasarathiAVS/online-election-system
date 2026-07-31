const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  CandidateID:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  CollegeID:    { type: DataTypes.INTEGER, allowNull: false },
  ElectionID:   { type: DataTypes.INTEGER, allowNull: false },
  DepartmentID: { type: DataTypes.INTEGER, allowNull: true },
  PositionID:   { type: DataTypes.INTEGER, allowNull: true },
  FullName:     { type: DataTypes.STRING(150), allowNull: false },
  Party:        { type: DataTypes.STRING(150), allowNull: true },
  Symbol:       { type: DataTypes.STRING(500), defaultValue: '🗳️' },
  PhotoURL:     { type: DataTypes.STRING(500), defaultValue: '' },
  Manifesto:    { type: DataTypes.TEXT, allowNull: true },
  Achievements: { type: DataTypes.TEXT, allowNull: true },
  CampaignVideoURL: { type: DataTypes.STRING(500), allowNull: true },
  Status:       { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
  DisplayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  Color:        { type: DataTypes.STRING(20), defaultValue: '#3b82f6' }
}, { tableName: 'Candidates', timestamps: true });

module.exports = Candidate;
