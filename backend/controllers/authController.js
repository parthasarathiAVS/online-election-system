const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { Admin, Voter } = require('../models');
const { logAction }    = require('../utils/auditLogger');
require('dotenv').config();

// ── Admin Login ────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const admin = await Admin.findOne({ where: { Username: username } });
    if (!admin)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: admin.AdminID, role: 'admin', username: admin.Username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    await admin.update({ LastLogin: new Date() });
    await logAction('Admin Login', { user: { id: admin.AdminID, role: 'admin' }, ip: req.ip }, `Admin "${admin.Username}" authenticated`);

    res.json({
      token,
      user: { id: admin.AdminID, username: admin.Username, email: admin.Email, role: 'admin' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
};

// ── Voter Login ────────────────────────────────────────────────
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
    res.status(400).json({ message: 'Unknown role.' });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user.' });
  }
};
