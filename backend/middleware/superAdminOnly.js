const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Super Admin only.' });
};
module.exports = superAdminOnly;
