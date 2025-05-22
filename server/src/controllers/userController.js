import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate JWT
const generateToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    // Generate a unique UID
    const uid = User.generateUID();

    // Create user
    const user = await User.create({
      uid,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        uid: user.uid,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { uid, password } = req.body;

    if (!uid || !password) {
      return res.status(400).json({
        success: false,
        message: 'UID and password are required',
      });
    }

    // Check for admin user
    if (uid === 'admin' && password === '@123') {
      return res.json({
        success: true,
        uid: 'admin',
        isAdmin: true,
        token: generateToken('admin'),
      });
    }

    // Find user
    const user = await User.findOne({ uid });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        uid: user.uid,
        isAdmin: user.isAdmin,
        token: generateToken(user.uid),
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    if (user) {
      res.json({
        uid: user.uid,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Forgot password - send reset code
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'UID is required' });
    }

    // Don't allow password reset for admin user
    if (uid === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin password cannot be reset through this method' });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate code based on current time (HHmm)
    const now = new Date();
    const code = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Store the code and expiry (valid for 1 minute)
    user.resetCode = code;
    user.resetCodeExpiry = new Date(Date.now() + 60 * 1000); // 1 minute expiry
    await user.save();

    // In production, send code via email/SMS. For now, return in response
    res.json({ 
      success: true, 
      message: 'Reset code generated',
      code // Only for development, remove in production
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Reset password using code
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { uid, code, newPassword } = req.body;
    if (!uid || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Don't allow password reset for admin user
    if (uid === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin password cannot be reset through this method' });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ success: false, message: 'No reset request found' });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    if (user.resetCodeExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'Code expired' });
    }

    // Update password and clear reset code
    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};