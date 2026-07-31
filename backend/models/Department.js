const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  DepartmentID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CollegeID: { type: DataTypes.INTEGER, allowNull: false },
  Name: { type: DataTypes.STRING, allowNull: false },
  Code: { type: DataTypes.STRING }
}, {
  tableName: 'Departments',
  timestamps: true
});

module.exports = Department;
