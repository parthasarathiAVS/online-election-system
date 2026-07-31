const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Position = sequelize.define('Position', {
  PositionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CollegeID: { type: DataTypes.INTEGER, allowNull: false },
  Title: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.TEXT }
}, {
  tableName: 'Positions',
  timestamps: true
});

module.exports = Position;
