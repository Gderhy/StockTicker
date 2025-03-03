require("dotenv").config(); // Load environment variables
const express = require("express"); // Import Express framework
const http = require("http"); // Import HTTP module
const WebSocket = require("ws"); // Import WebSocket for real-time updates
const cors = require("cors"); // Import CORS to allow cross-origin requests
const mongoose = require("mongoose"); // Import Mongoose for MongoDB interaction

const stockRoutes = require("./src/routes/stocks"); // Import API routes
const { generateStockData, stocks } = require("./src/services/stockServices"); // Import stock service

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server }); // Create WebSocket server

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable JSON parsing
app.use("/api/stocks", stockRoutes); // Use stock routes

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
connectDB(); // Call the function to establish database connection

// Update stock prices every second and send updates via WebSocket
setInterval(async () => {
  const stockData = await generateStockData(); // Generate new stock data
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Check if WebSocket client is open
      client.send(JSON.stringify(stockData)); // Send stock data to clients
    }
  });
}, 1000);

// Start the server on port 4000
server.listen(4000, () => console.log("🚀 Server running on port 4000"));
