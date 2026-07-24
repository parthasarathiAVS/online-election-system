const { AuditLog } = require('../models');

/**
 * Log an audit event to the database.
 * @param {string} action  - Short event name
 * @param {object|null} req - Express request (optional)
 * @param {string} detail  - Extra detail string
 */
const logAction = async (action, req = null, detail = '') => {
  try {
    await AuditLog.create({
      Action:    action,
      UserID:    req?.user?.id    || null,
      UserRole:  req?.user?.role  || null,
      IPAddress: req?.ip          || null,
      Detail:    detail
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

module.exports = { logAction };
