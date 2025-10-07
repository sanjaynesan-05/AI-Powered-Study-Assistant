const express = require('express');
const passport = require('../config/passport');
const User = require('../models/userModel');

const router = express.Router();

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      console.log('Google auth successful for user:', req.user.name);

      // Generate JWT token
      const token = req.user.generateAuthToken();

      // Store token in session for client-side retrieval
      req.session.token = token;
      req.session.user = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        authProvider: req.user.authProvider
      };

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:3001';
      res.redirect(`${frontendUrl}/auth/google/success?token=${token}`);

    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect('/login?error=auth_failed');
    }
  }
);

// @desc    Get current session info
// @route   GET /api/auth/session
// @access  Public
router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user,
      token: req.session.token
    });
  } else {
    res.json({
      authenticated: false,
      user: null,
      token: null
    });
  }
});

// @desc    Logout and clear session
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// @desc    Verify Google token (for mobile/SPA clients)
// @route   POST /api/auth/google/verify
// @access  Public
router.post('/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google token using google-auth-library
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    console.log('Verified Google token for:', payload.email);

    // Create a profile object similar to passport-google-oauth20
    const profile = {
      id: payload.sub,
      displayName: payload.name,
      emails: [{ value: payload.email }],
      photos: payload.picture ? [{ value: payload.picture }] : []
    };

    // Find or create user
    const user = await User.findOrCreateGoogleUser(profile);

    // Generate JWT token
    const token = user.generateAuthToken();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      token: token
    });

  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(401).json({
      message: 'Google authentication failed',
      error: error.message
    });
  }
});

module.exports = router;