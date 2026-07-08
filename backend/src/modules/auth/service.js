const jwt = require("jsonwebtoken");
const User = require("./model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "7307599@dwc-legazpi.edu",
    pass: "kkgjwnadzhujurwh",
  },
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const registerUser = async (userData) => {
  const { email, password, role, profile } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error("User already exists");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    email,
    password,
    role,
    profile,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    token: generateToken(user._id),
  };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "deactivated") {
    const error = new Error(
      "Your account has been deactivated. Please contact admin.",
    );
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    },
    token: generateToken(user._id),
  };
};

const updateProfile = async (userId, profileData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (profileData.name !== undefined) user.profile.name = profileData.name;
  if (profileData.phone !== undefined) user.profile.phone = profileData.phone;

  await user.save();
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    status: user.status,
  };
};

const deactivateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  user.status = "deactivated";
  await user.save();
  return {
    id: user._id,
    status: user.status,
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User with this email does not exist");
    error.statusCode = 404;
    throw error;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordCode = code;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const mailOptions = {
    from: '"Shopee Security" <7307599@dwc-legazpi.edu>',
    to: email,
    subject: "Reset Your Shopee Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 25px; border-radius: 8px;">
        <h2 style="color: #ee4d2d; margin-top: 0; text-align: center;">LazShopee Verification Code</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your LazShopee account. Use the 6-digit verification code below to set a new password:</p>
        <div style="background-color: #f9f9f9; border: 1px dashed #ee4d2d; font-size: 28px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 15px; margin: 20px 0; color: #ee4d2d; border-radius: 4px;">
          ${code}
        </div>
        <p style="color: #666; font-size: 13px;">This verification code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;"/>
        <p style="color: #999; font-size: 11px; text-align: center; margin: 0;">LazShopee Clone &copy; 2026. All Rights Reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  return { success: true };
};

const resetPassword = async (email, code, newPassword) => {
  const user = await User.findOne({
    email,
    resetPasswordCode: code,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset code");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordCode = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { success: true };
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  deactivateUser,
  forgotPassword,
  resetPassword,
};
