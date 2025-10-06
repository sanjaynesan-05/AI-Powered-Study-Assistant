const jwt = require('jsonwebtoken');
const { User } = require('../models/indexPG');

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
      req.user = await User.findByPk(decoded.id);

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
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

// Middleware to check if user owns the resource
const checkOwnership = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (req.user.id === userId || req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied - you can only access your own resources');
  }
};

module.exports = {
  protect,
  admin,
  checkOwnership,
};