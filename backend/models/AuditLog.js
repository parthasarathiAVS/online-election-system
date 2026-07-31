const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  LogID:    { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  CollegeID:{ type: DataTypes.INTEGER, allowNull: true }, // null for super admin actions
  Action:   { type: DataTypes.STRING(100), allowNull: false },
  UserID:   { type: DataTypes.INTEGER, allowNull: true },
  UserRole: { type: DataTypes.STRING(20), allowNull: true },
  IPAddress:{ type: DataTypes.STRING(50), allowNull: true },
  Detail:   { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'AuditLogs', timestamps: true });

module.exports = AuditLog;
