const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CandidateVoteTotal = sequelize.define('CandidateVoteTotal', {
  CandidateID: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    allowNull: false 
  },
  CollegeID: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  ElectionID: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  VoteCount: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 0 
  }
}, { 
  tableName: 'CandidateVoteTotals', 
  timestamps: true 
});

module.exports = CandidateVoteTotal;
