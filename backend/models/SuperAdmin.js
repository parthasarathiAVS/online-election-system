const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuperAdmin = sequelize.define('SuperAdmin', {
  AdminID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Username: { type: DataTypes.STRING, unique: true, allowNull: false },
  PasswordHash: { type: DataTypes.STRING, allowNull: false },
  Email: { type: DataTypes.STRING, unique: true, allowNull: false },
  Role: { type: DataTypes.STRING, defaultValue: 'SuperAdmin' }
}, {
  tableName: 'SuperAdmins',
  timestamps: true
});

module.exports = SuperAdmin;
