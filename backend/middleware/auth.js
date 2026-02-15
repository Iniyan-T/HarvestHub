import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Verify JWT Token and authenticate user
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login first'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    req.user.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Optional authentication - continues even if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_this');
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        req.user.role = decoded.role;
      }
    }
    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Optional role check - skips if no user but validates role if authenticated
export const optionalAuthorize = (...roles) => {
  return (req, res, next) => {
    // If no user, continue (will use farmerId from form data)
    if (!req.user) {
      return next();
    }

    // If user exists, check role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};
