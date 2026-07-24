const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  CandidateID:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  ElectionID:   { type: DataTypes.INTEGER, allowNull: false },
  FullName:     { type: DataTypes.STRING(150), allowNull: false },
  Party:        { type: DataTypes.STRING(150), allowNull: false },
  Symbol:       { type: DataTypes.STRING(10), defaultValue: '🗳️' },
  PhotoURL:     { type: DataTypes.STRING(500), defaultValue: '' },
  Manifesto:    { type: DataTypes.TEXT, allowNull: true },
  DisplayOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
  Color:        { type: DataTypes.STRING(20), defaultValue: '#3b82f6' }
}, { tableName: 'Candidates', timestamps: true });

module.exports = Candidate;
