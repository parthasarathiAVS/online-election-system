const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Election = sequelize.define('Election', {
  ElectionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  CollegeID: { type: DataTypes.INTEGER, allowNull: false },
  Title:       { type: DataTypes.STRING(200), allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: true },
  StartTime:   { type: DataTypes.DATE, allowNull: true },
  EndTime:     { type: DataTypes.DATE, allowNull: true },
  Departments: { type: DataTypes.JSON, allowNull: true }, // array of department IDs
  Status: {
    type: DataTypes.ENUM('Upcoming', 'Live', 'Ended', 'Archived', 'Paused'),
    defaultValue: 'Upcoming'
  },
  IsKioskMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true: admin-only kiosk mode — no individual voter login needed'
  },
  ResultsPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { tableName: 'Elections', timestamps: true });

module.exports = Election;
