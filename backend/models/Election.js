const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Election = sequelize.define('Election', {
  ElectionID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Title:       { type: DataTypes.STRING(200), allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: true },
  StartTime:   { type: DataTypes.DATE, allowNull: true },
  EndTime:     { type: DataTypes.DATE, allowNull: true },
  Status: {
    type: DataTypes.ENUM('Upcoming', 'Live', 'Ended', 'Archived'),
    defaultValue: 'Upcoming'
  },
  IsKioskMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true: admin-only kiosk mode — no individual voter login needed'
  }
}, { tableName: 'Elections', timestamps: true });

module.exports = Election;
