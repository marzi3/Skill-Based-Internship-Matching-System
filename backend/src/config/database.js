const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    return conn;
  } catch (error) {
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Initialize database and create collections
const initializeDatabase = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Check if 'users' collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length === 0) {
      // Create the users collection (forces database creation)
      await db.createCollection('users');
    }
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    throw error;
  }
};

module.exports = { connectDB, initializeDatabase };
