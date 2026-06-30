const jwt = require('jsonwebtoken');
const User = require('./model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const registerUser = async (userData) => {
  const { email, password, role, profile } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('User already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    email,
    password,
    role,
    profile
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile
    },
    token: generateToken(user._id)
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'deactivated') {
    const error = new Error('Your account has been deactivated. Please contact admin.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile
    },
    token: generateToken(user._id)
  };
};

module.exports = {
  registerUser,
  loginUser
};
