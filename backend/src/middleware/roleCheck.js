const { sendError } = require("../utils/response");

const roleCheck = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role '${req.user.role}' is not authorized to access this resource`,
        403,
      );
    }

    next();
  };
};

module.exports = roleCheck;
