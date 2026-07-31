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
    allowNull: true   // null for self-registered students not yet linked
  },
  DepartmentID: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  RegistrationNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  FullName: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  CollegeName: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  Department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Year: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(120),
    allowNull: true,
    unique: true
  },
  Phone: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  PasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ProfilePhoto: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  Role: {
    type: DataTypes.STRING(20),
    defaultValue: 'student'
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
  timestamps: true
});

module.exports = Student;

