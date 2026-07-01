const authService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, "User registered successfully", 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, result, "Logged in successfully", 200);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      profile: req.user.profile,
      status: req.user.status,
      createdAt: req.user.createdAt,
    };
    return sendSuccess(res, user, "Current user profile fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await authService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, updatedUser, "Profile updated successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const result = await authService.deactivateUser(req.user._id);
    return sendSuccess(res, result, "Account deactivated successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  deactivateAccount
};
