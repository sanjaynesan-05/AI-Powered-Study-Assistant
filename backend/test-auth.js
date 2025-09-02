const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

// Import User model
const User = require('./src/models/userModel');

// Function to create a test user
async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      return existingUser;
    }
    
    // Create a new test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });
    
    console.log('Test user created:', user.email);
    return user;
  } catch (error) {
    console.error('Error creating test user:', error.message);
    throw error;
  }
}

// Function to test login
async function testLogin(email, password) {
  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found');
      return null;
    }
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (isMatch) {
      console.log('Login successful!');
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
      };
    } else {
      console.log('Password does not match');
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await connectDB();
    
    // Create a test user
    const user = await createTestUser();
    
    // Test login with correct credentials
    console.log('\nTesting login with correct credentials:');
    await testLogin('test@example.com', 'password123');
    
    // Test login with incorrect password
    console.log('\nTesting login with incorrect password:');
    await testLogin('test@example.com', 'wrongpassword');
    
    // Test login with non-existent user
    console.log('\nTesting login with non-existent user:');
    await testLogin('nonexistent@example.com', 'password123');
    
    // Test listing all users
    console.log('\nListing all users:');
    const users = await User.find({}).select('name email');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    console.log('\nTests completed');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the tests
main();
