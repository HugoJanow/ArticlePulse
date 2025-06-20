const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error(' MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });

    // Fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log(' MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error(' MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
