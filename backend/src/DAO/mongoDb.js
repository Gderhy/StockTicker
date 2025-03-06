const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

// Connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process on failure
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect(); // Disconnect from MongoDB
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ MongoDB disconnection error:", error);
    process.exit(1); // Exit process on failure
  }
}

module.exports = {connectDB, disconnectDB}; // Export the function to connect to MongoDB