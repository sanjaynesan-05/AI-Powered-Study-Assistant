const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware to protect routes that require authentication
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found with this token');
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else {
        throw new Error('Not authorized, token failed');
      }
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
};

// Middleware to restrict access to admin roles
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Middleware to ensure a user can only access their own data
const ownerOnly = (req, res, next) => {
  // The userId could be in params, query, or body
  const resourceUserId = req.params.userId || req.query.userId || req.body.userId;

  // If no userId is provided in the request, continue (other middlewares will handle it)
  if (!resourceUserId) {
    return next();
  }

  // Check if the authenticated user is accessing their own data
  if (req.user._id.toString() === resourceUserId.toString()) {
    next();
  } else if (req.user.role === 'admin') {
    // Admins can access any user's data
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this data');
  }
};

module.exports = { protect, admin, ownerOnly };
