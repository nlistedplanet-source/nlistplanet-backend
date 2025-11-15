const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(403).json({ error: 'Forbidden' });

    if (user.userType === 'admin' || (user.roles && user.roles.includes('admin'))) {
      return next();
    }

    return res.status(403).json({ error: 'Admin access required' });
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
