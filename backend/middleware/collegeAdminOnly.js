const collegeAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'CollegeAdmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. College Admin only.' });
};
module.exports = collegeAdminOnly;
