const { College, SuperAdmin } = require('../models');

exports.dashboardStats = async (req, res) => {
  try {
    const totalColleges = await College.count();
    // Add other stats as required (Total Students across colleges, etc.)
    res.json({ totalColleges });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.findAll();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching colleges' });
  }
};

exports.approveCollege = async (req, res) => {
  try {
    const college = await College.findByPk(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    college.Status = 'Active';
    await college.save();
    res.json({ message: 'College approved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving college' });
  }
};
