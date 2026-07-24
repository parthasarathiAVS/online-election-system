const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  AdminID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  PasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Email: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true
  },
  Role: {
    type: DataTypes.ENUM('admin', 'superadmin'),
    defaultValue: 'admin'
  },
  LastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Admins',
  timestamps: true
});

module.exports = Admin;
