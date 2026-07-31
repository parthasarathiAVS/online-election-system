const tenantIsolation = (req, res, next) => {
  if (req.user && req.user.collegeId) {
    req.collegeId = req.user.collegeId;
    return next();
  }
  return res.status(403).json({ message: 'Tenant context missing.' });
};
module.exports = tenantIsolation;
