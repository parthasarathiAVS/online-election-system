const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Admin, Voter, Student } = require('../models');
const { logAction } = require('../utils/auditLogger');
require('dotenv').config();

// ── Admin Login (UNCHANGED) ────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("========== ADMIN LOGIN ==========");
    console.log("Login Request:", username);

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required."
      });
    }

    const admin = await Admin.findOne({
      where: { Username: username }
    });

    console.log("Admin Found:", admin ? admin.Username : "NOT FOUND");

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const isMatch = await bcrypt.compare(password, admin.PasswordHash);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const token = jwt.sign(
      {
        id: admin.AdminID,
        role: "admin",
        username: admin.Username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE
      }
    );

    await admin.update({
      LastLogin: new Date()
    });

    await logAction(
      "Admin Login",
      {
        user: {
          id: admin.AdminID,
          role: "admin"
        },
        ip: req.ip
      },
      `Admin "${admin.Username}" authenticated`
    );

    console.log("Login Successful!");

    return res.json({
      token,
      user: {
        id: admin.AdminID,
        username: admin.Username,
        email: admin.Email,
        role: "admin"
      }
    });

  } catch (err) {
    console.error("Admin Login Error:", err);

    return res.status(500).json({
      message: "Server error during admin login."
    });
  }
};

// ── Voter Login (UNCHANGED — legacy) ──────────────────────────
exports.voterLogin = async (req, res) => {
  try {
    const { voterId, password } = req.body;
    if (!voterId || !password)
      return res.status(400).json({ message: 'Voter ID and password are required.' });

    const voter = await Voter.findOne({ where: { VoterRegistrationNumber: voterId } });
    if (!voter)
      return res.status(401).json({ message: 'Invalid credentials.' });

    if (voter.Status === 'disabled')
      return res.status(403).json({ message: 'Your account has been disabled. Please contact the Election Officer.' });

    const isMatch = await bcrypt.compare(password, voter.PasswordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: voter.VoterID, role: 'voter', voterRegistrationNumber: voter.VoterRegistrationNumber },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await logAction('Voter Login', { user: { id: voter.VoterID, role: 'voter' }, ip: req.ip }, `Voter "${voter.FullName}" (${voter.VoterRegistrationNumber}) authenticated`);

    res.json({
      token,
      user: {
        id: voter.VoterID,
        fullName: voter.FullName,
        voterRegistrationNumber: voter.VoterRegistrationNumber,
        email: voter.Email,
        hasVoted: voter.HasVoted,
        role: 'voter'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during voter login.' });
  }
};

// ── Student Registration ───────────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const {
      fullName, collegeName, department, year,
      registerNumber, email, mobile, password, confirmPassword
    } = req.body;

    // ── Validation ────────────────────────────────────────────
    const errors = [];

    if (!fullName || fullName.trim().length < 2)
      errors.push('Full name must be at least 2 characters.');

    if (!collegeName || collegeName.trim().length < 2)
      errors.push('College name is required.');

    if (!department || department.trim().length < 2)
      errors.push('Department is required.');

    if (!year) errors.push('Year of study is required.');

    if (!registerNumber || registerNumber.trim().length < 3)
      errors.push('Register number must be at least 3 characters.');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push('A valid email address is required.');

    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, '')))
      errors.push('A valid 10-digit Indian mobile number is required.');

    if (!password || password.length < 8)
      errors.push('Password must be at least 8 characters.');

    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password))
      errors.push('Password must contain an uppercase letter, a number, and a special character.');

    if (password !== confirmPassword)
      errors.push('Passwords do not match.');

    if (errors.length > 0)
      return res.status(400).json({ message: errors[0], errors });

    // ── Uniqueness Checks ─────────────────────────────────────
    const existingByReg = await Student.findOne({
      where: { RegistrationNumber: registerNumber.trim().toUpperCase() }
    });
    if (existingByReg)
      return res.status(409).json({ message: 'This Register Number is already registered. Please log in.' });

    const existingByEmail = await Student.findOne({
      where: { Email: email.toLowerCase().trim() }
    });
    if (existingByEmail)
      return res.status(409).json({ message: 'This email is already registered. Please log in.' });

    // ── Hash Password & Create Student ────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    let profilePhotoPath = null;
    if (req.file) {
      profilePhotoPath = `/uploads/${req.file.filename}`;
    }

    const student = await Student.create({
      FullName:           fullName.trim(),
      CollegeName:        collegeName.trim(),
      Department:         department.trim(),
      Year:               year,
      RegistrationNumber: registerNumber.trim().toUpperCase(),
      Email:              email.toLowerCase().trim(),
      Phone:              mobile.trim(),
      PasswordHash:       passwordHash,
      ProfilePhoto:       profilePhotoPath,
      Role:               'student',
      Status:             'active',
      HasVoted:           false
    });

    await logAction('Student Registration', { user: { id: student.StudentID, role: 'student' }, ip: req.ip },
      `Student "${student.FullName}" (${student.RegistrationNumber}) registered`);

    return res.status(201).json({
      message: 'Account created successfully! Please log in.',
      studentId: student.StudentID
    });

  } catch (err) {
    console.error('Registration Error:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Register Number or Email is already taken.' });
    }
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ── Unified Student/Voter Login ────────────────────────────────
// Accepts email OR register number + password
exports.studentLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ message: 'Please provide your email/register number and password.' });

    // Find student by email OR registration number
    const student = await Student.findOne({
      where: {
        [Op.or]: [
          { Email: identifier.toLowerCase().trim() },
          { RegistrationNumber: identifier.trim().toUpperCase() }
        ]
      }
    });

    if (!student)
      return res.status(401).json({ message: 'No account found with that email or register number.' });

    if (student.Status === 'disabled')
      return res.status(403).json({ message: 'Your account has been disabled. Contact the Election Officer.' });

    const isMatch = await bcrypt.compare(password, student.PasswordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });

    const token = jwt.sign(
      {
        id: student.StudentID,
        role: 'student',
        registrationNumber: student.RegistrationNumber,
        collegeId: student.CollegeID
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '8h' }
    );

    await logAction('Student Login', { user: { id: student.StudentID, role: 'student' }, ip: req.ip },
      `Student "${student.FullName}" (${student.RegistrationNumber}) authenticated`);

    return res.json({
      token,
      user: {
        id:                 student.StudentID,
        fullName:           student.FullName,
        email:              student.Email,
        registrationNumber: student.RegistrationNumber,
        collegeName:        student.CollegeName,
        department:         student.Department,
        year:               student.Year,
        phone:              student.Phone,
        profilePhoto:       student.ProfilePhoto,
        hasVoted:           student.HasVoted,
        role:               'student'
      }
    });

  } catch (err) {
    console.error('Student Login Error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

// ── Get Current User ───────────────────────────────────────────
exports.getCurrentUser = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findByPk(req.user.id, { attributes: { exclude: ['PasswordHash'] } });
      if (!admin) return res.status(404).json({ message: 'Admin not found.' });
      return res.json({ ...admin.toJSON(), role: 'admin' });
    }
    if (req.user.role === 'voter') {
      const voter = await Voter.findByPk(req.user.id, { attributes: { exclude: ['PasswordHash'] } });
      if (!voter) return res.status(404).json({ message: 'Voter not found.' });
      return res.json({ ...voter.toJSON(), role: 'voter' });
    }
    if (req.user.role === 'student') {
      const student = await Student.findByPk(req.user.id, { attributes: { exclude: ['PasswordHash'] } });
      if (!student) return res.status(404).json({ message: 'Student not found.' });
      return res.json({ ...student.toJSON(), role: 'student' });
    }
    res.status(400).json({ message: 'Unknown role.' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user.' });
  }
};




