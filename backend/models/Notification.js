const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  NotificationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CollegeID: { type: DataTypes.INTEGER, allowNull: false },
  UserID: { type: DataTypes.INTEGER }, // optional, for specific user
  UserRole: { type: DataTypes.STRING }, // 'Student', 'CollegeAdmin', etc
  Title: { type: DataTypes.STRING, allowNull: false },
  Message: { type: DataTypes.TEXT, allowNull: false },
  Type: { type: DataTypes.STRING }, // 'Email', 'System'
  Status: { type: DataTypes.ENUM('Pending', 'Sent', 'Failed'), defaultValue: 'Pending' }
}, {
  tableName: 'Notifications',
  timestamps: true
});

module.exports = Notification;
