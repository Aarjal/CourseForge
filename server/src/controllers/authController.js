const User = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "Conflict",
        message: "Email is already registered",
      });
    }

    const user = await User.create({ name, email, password, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie (browser clients)
    res.cookie("refreshToken", refreshToken, getCookieOptions());

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken, // Also in body for mobile/API clients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user & return tokens
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, getCookieOptions());

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh the access token using the refresh token
 * @access  Public (but requires valid refresh token)
 */
const refresh = async (req, res, next) => {
  try {
    // Accept refresh token from cookie or body
    const token =
      (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No refresh token provided",
      });
    }

    const decoded = verifyToken(token);

    // Re-read user from DB (role may have changed)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User belonging to this token no longer exists",
      });
    }

    const accessToken = generateAccessToken(user);

    res.status(200).json({ accessToken });
  } catch (err) {
    if (
      err.name === "TokenExpiredError" ||
      err.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or expired refresh token — please log in again",
      });
    }
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Clear the refresh token cookie
 * @access  Public
 */
const logout = (req, res) => {
  res.cookie("refreshToken", "", {
    ...getCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });

  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
