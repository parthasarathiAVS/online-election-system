const voterOnly = (req, res, next) => {
  if (req.user && req.user.role === 'voter')
    return next();
  return res.status(403).json({ message: 'Access denied. Voter only.' });
};
module.exports = voterOnly;
