const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Student') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Student only.' });
};
module.exports = studentOnly;
