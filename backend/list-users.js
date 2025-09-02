const mongoose = require('mongoose');
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

// Main function to list all users
async function listAllUsers() {
  try {
    await connectDB();
    
    console.log('\nListing all users in the database:');
    const users = await User.find({}).select('name email');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach(user => {
        console.log(`- ${user.name} (${user.email})`);
      });
      console.log(`Total users: ${users.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
listAllUsers();
