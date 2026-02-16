require('dotenv').config();
const express = require('express');
const app = require('./src/app');
const { connectDB, initializeDatabase } = require('./src/config/database');
const User = require('./src/models/User'); // Load User model

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and initialize database
connectDB()
  .then(async () => {
    // Initialize database and create collections automatically
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✓ Server started on port ${PORT}`);
      console.log(`✓ Database connected`);
    });
  })
  .catch((error) => {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  });