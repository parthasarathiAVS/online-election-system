const bcrypt = require('bcryptjs');
const { Student, Election } = require('../models');

// ── GET /api/student/profile ────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: { exclude: ['PasswordHash'] }
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

// ── PUT /api/student/profile ────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const { fullName, collegeName, department, year, phone } = req.body;

    if (fullName) student.FullName = fullName.trim();
    if (collegeName) student.CollegeName = collegeName.trim();
    if (department) student.Department = department.trim();
    if (year) student.Year = year;
    if (phone) student.Phone = phone.trim();

    if (req.file) {
      student.ProfilePhoto = `/uploads/${req.file.filename}`;
    }

    await student.save();

    const updated = student.toJSON();
    delete updated.PasswordHash;
    res.json({ message: 'Profile updated successfully.', student: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

// ── GET /api/student/elections ────────────────────────────────────
exports.getElections = async (req, res) => {
  try {
    const where = { Status: ['Upcoming', 'Live'] };
    // If student is linked to a college, filter by college
    if (req.user.collegeId) {
      where.CollegeID = req.user.collegeId;
    }

    const elections = await Election.findAll({
      where,
      order: [['StartTime', 'ASC']]
    });

    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching elections.' });
  }
};
