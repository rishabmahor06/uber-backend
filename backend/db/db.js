const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

// Track the connection state
let isConnected = false;

async function connectToDb() {
  // If we're already connected, reuse the existing connection
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  // If mongoose has an existing connection, reuse it
  if (mongoose.connections[0].readyState) {
    isConnected = true;
    console.log("Using existing Mongoose connection");
    return;
  }

  try {
    // Set strictQuery false for MongoDB 7+ compatibility
    mongoose.set("strictQuery", false);

    // Connect with options suitable for serverless
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    isConnected = true;
    console.log("Connected to MongoDB");

    // Handle disconnection
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB connection error:", err);
      isConnected = false;
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    throw error; // Re-throw to let the application handle connection failures
  }
}

module.exports = connectToDb;
