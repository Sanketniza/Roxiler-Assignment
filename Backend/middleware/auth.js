const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access based on role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

// Middleware to validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  // Get all potential ID parameters
  const idParams = ['id', 'userId', 'storeId', 'ownerId'].filter(param => req.params[param]);
  
  // If no ID parameters found, continue
  if (idParams.length === 0) {
    return next();
  }
  
  // Check each ID parameter
  for (const paramName of idParams) {
    const paramValue = req.params[paramName];
    
    // Skip validation for special routes like 'new', 'dashboard', etc.
    if (paramValue === 'new' || paramValue === 'dashboard' || paramValue === 'stats') {
      continue;
    }
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(paramValue)) {
      return res.status(400).json({ 
        message: 'Invalid ID format', 
        details: `'${paramValue}' is not a valid MongoDB ObjectId`
      });
    }
  }
  
  next();
};

module.exports = { protect, authorize, validateObjectId };