// Legacy Voter model — kept for backward compatibility with existing voter login
// New students should use the Student model instead
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voter = sequelize.define('Voter', {
  VoterID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  VoterRegistrationNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  FullName: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(120),
    allowNull: true
  },
  Phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  PasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Status: {
    type: DataTypes.ENUM('active', 'disabled'),
    defaultValue: 'active'
  },
  HasVoted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'Voters',
  timestamps: true
});

module.exports = Voter;
