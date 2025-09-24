const User = require('../models/userModel');
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
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // Create new user
    try {
      const user = await User.create({
        name,
        email,
        password,
      });

      if (user) {
        console.log(`User created successfully: ${user.name} (${user.email})`);
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          token: user.generateAuthToken(),
        });
      } else {
        res.status(400);
        throw new Error('Failed to create user');
      }
    } catch (dbError) {
      console.error('Database error during user creation:', dbError);
      
      // Check for mongoose validation errors
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map(val => val.message);
        res.status(400);
        throw new Error(messages.join(', '));
      }
      
      // If it's another kind of error, re-throw it
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(res.statusCode === 200 ? 400 : res.statusCode);
    return res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    console.log('Login request received:', { ...req.body, password: '[MASKED]' });
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      console.log('Login successful for user:', email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: user.generateAuthToken(),
      });
    } else {
      console.log('Login failed for user:', email);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        interests: user.interests,
        skills: user.skills,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
      user.interests = req.body.interests || user.interests;
      user.skills = req.body.skills || user.skills;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        interests: updatedUser.interests,
        skills: updatedUser.skills,
        token: updatedUser.generateAuthToken(),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
};
