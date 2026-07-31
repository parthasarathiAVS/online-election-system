const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CollegeAdmin = sequelize.define('CollegeAdmin', {
  AdminID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  CollegeID: {
    type: DataTypes.INTEGER,
    allowNull: false
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
    type: DataTypes.STRING,
    defaultValue: 'CollegeAdmin'
  },
  LastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'CollegeAdmins',
  timestamps: true
});

module.exports = CollegeAdmin;
