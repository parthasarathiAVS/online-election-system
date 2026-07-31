const studentOnly = (req, res, next) => {
  if (req.user && req.user.role.toLowerCase() === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Student only.' });
};
module.exports = studentOnly;
