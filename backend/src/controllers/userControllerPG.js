const { User } = require('../models/indexPG');
const validator = require('validator');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    console.log('Registration request received:', { 
      ...req.body,
      password: req.body.password ? '[MASKED]' : undefined
    });
    
    const { name, email, password } = req.body;

    // Validate required fields with detailed error messages
    if (!name) {
      res.status(400);
      throw new Error('Name is required');
    }
    
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }
    
    if (!password) {
      res.status(400);
      throw new Error('Password is required');
    }
    
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    
    // Use the validator library for email validation
    if (!validator.isEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create user with PostgreSQL
    const user = await User.create({
      name,
      email,
      password,
    });

    console.log('User created successfully:', { id: user.id, email: user.email });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: user.generateAuthToken(),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
      return;
    }

    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        message: 'User already exists with this email'
      });
      return;
    }

    next(error);
  }
};

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user and include password for comparison
    const user = await User.scope('withPassword').findOne({ where: { email } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        token: user.generateAuthToken(),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: ['profile', 'progress']
    });

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        collegeId: user.collegeId,
        interests: user.interests,
        skills: user.skills,
        role: user.role,
        profile: user.profile,
        progress: user.progress
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      const updateData = {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        profilePicture: req.body.profilePicture || user.profilePicture,
        collegeId: req.body.collegeId || user.collegeId,
        interests: req.body.interests || user.interests,
        skills: req.body.skills || user.skills,
      };

      // Update password if provided
      if (req.body.password) {
        updateData.password = req.body.password;
      }

      await user.update(updateData);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        collegeId: user.collegeId,
        interests: user.interests,
        skills: user.skills,
        role: user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (user) {
      await user.destroy();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
};