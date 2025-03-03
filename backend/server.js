require("dotenv").config(); // Load environment variables
const express = require("express"); // Import Express framework
const http = require("http"); // Import HTTP module
const WebSocket = require("ws"); // Import WebSocket for real-time updates
const cors = require("cors"); // Import CORS to allow cross-origin requests
const connectDB = require("./src/DAO/connectDB"); // Import database connection

const stockRoutes = require("./src/routes/stocks"); // Import API routes
const {
  generateStockData,
  stocks,
} = require("./src/services/generateStockData"); // Import stock service
const { fetchLatestStockData } = require("./src/services/fetchStockData"); // Import fetch stock data service

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server }); // Create WebSocket server

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable JSON parsing
app.use("/api/stocks", stockRoutes); // Use stock routes

connectDB(); // Call the function to establish database connection

// Generate stock data once when the server starts

if (process.env.generateStockData) {
  generateStockData().then(() => {
    console.log("Initial stock data for 6 months generated.");
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket server.");
  ws.on("close", () =>
    console.log("Client disconnected from WebSocket server.")
  );
  ws.on("error", (error) => console.error("WebSocket error:", error));
});

// Send stock updates periodically (e.g., every second)
setInterval(async () => {
  console.log(
    `[${new Date().toISOString()}] Sending stock updates to clients...`
  );
  // Fetch the most recent stock data or calculate updates
  const stockData = await fetchLatestStockData(); // Function to get the latest stock data
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // console.log("Sending stock data to client...", client.url);
      client.send(JSON.stringify(stockData)); // Send the latest stock data to clients
    }
  });
}, 5000);

// Start the server on port 4000
server.listen(4000, () => console.log("🚀 Server running on port 4000"));
