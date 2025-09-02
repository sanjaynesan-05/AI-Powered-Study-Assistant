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

// Function to inspect collection indexes
async function inspectIndexes() {
  try {
    await connectDB();
    
    // Get the User model's collection
    const User = mongoose.model('User');
    const collection = User.collection;
    
    // Get indexes
    const indexes = await collection.indexes();
    console.log('\nIndexes on User collection:');
    console.log(JSON.stringify(indexes, null, 2));
    
    // List all collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAll collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
inspectIndexes();
