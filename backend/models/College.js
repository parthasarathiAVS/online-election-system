const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const College = sequelize.define('College', {
  CollegeID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Code: { type: DataTypes.STRING, unique: true, allowNull: false },
  Address: { type: DataTypes.STRING },
  Website: { type: DataTypes.STRING },
  Email: { type: DataTypes.STRING, allowNull: false },
  PhoneNumber: { type: DataTypes.STRING },
  PrincipalName: { type: DataTypes.STRING },
  ElectionOfficerName: { type: DataTypes.STRING },
  LogoUrl: { type: DataTypes.STRING },
  ThemeColor: { type: DataTypes.STRING, defaultValue: '#0F766E' },
  Status: { type: DataTypes.ENUM('Pending', 'Active', 'Suspended'), defaultValue: 'Pending' },
  SubscriptionPlan: { type: DataTypes.STRING, defaultValue: 'Free' }
}, {
  tableName: 'Colleges',
  timestamps: true
});

module.exports = College;
