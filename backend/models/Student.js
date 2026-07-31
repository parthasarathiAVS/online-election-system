const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  StudentID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  CollegeID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  DepartmentID: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  RegistrationNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
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
  tableName: 'Students',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['CollegeID', 'RegistrationNumber']
    }
  ]
});

module.exports = Student;
