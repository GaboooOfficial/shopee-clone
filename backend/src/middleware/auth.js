const jwt = require('jsonwebtoken');
const User = require('../modules/auth/model');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.status === 'deactivated') {
      return sendError(res, 'Your account has been deactivated. Please contact admin.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Not authorized to access this route', 401);
  }
};

module.exports = { protect };
