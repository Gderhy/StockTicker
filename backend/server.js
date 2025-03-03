// ./server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const connectDB = require("./src/DAO/connectDB");

const stockRoutes = require("./src/routes/stocks");
const { fetchLatestStockData } = require("./src/DAO/services/fetchStockData");
const { fetchSpecificStockData } = require("./src/DAO/services/fetchSpecificStockData");

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server }); // Create WebSocket server

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable JSON parsing
app.use("/api/stocks", stockRoutes); // Use stock routes

connectDB(); // Call the function to establish database connection

wss.on("connection", (ws, req) => {
  // Create a unique client ID (optional)
  const clientId = `client-${Math.random().toString(36).substring(2, 11)}`;
  ws.clientId = clientId;
  console.log(`Client connected: ${clientId}`);

  ws.subscribedStock = "all"; // Initialize the subscribed stock for the client to "all"

  // Listen for incoming messages (e.g., subscribe to specific stock)
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Check if the message is a subscription request
      if (data.action === "subscribe" && data.stockSymbol) {
        // Add stock to client's subscribed stocks list
        ws.subscribedStock = data.stockSymbol;
        console.log(`${clientId} subscribed to ${data.stockSymbol}`);
      }

    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
    }
  });

  // Handle WebSocket closure
  ws.on("close", () => {
    console.log(`Client disconnected: ${clientId}`);
  });

  // Handle WebSocket errors
  ws.on("error", (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
  });
});

// Send stock updates periodically (e.g., every second)
setInterval(async () => {
  // console.log(`[${new Date().toISOString()}] Sending stock updates to clients...`);

  // Fetch the most recent stock data or calculate updates
  const allStockData = await fetchLatestStockData(); // Function to get the latest stock data
  wss.clients.forEach(async (client) => {
    if (client.readyState === WebSocket.OPEN) {

      if (client.subscribedStock === "all") {
        // If on homepage -- if client is subscribed to all stocks
        client.send(JSON.stringify(allStockData)); // Send the latest stock data to clients

      } else if (client.subscribedStock) {
        // If client is subscribed to a specific stock
        const specificStockData = await fetchSpecificStockData(client.subscribedStock); // Fetch the history stock data for the subscribed stock
      } else {
        console.log(`Client ${client.clientId} is not connected.`);
      }
    }
  });
}, 1000); // Must Modify this to 1 second

// Start the server on port 4000
server.listen(4000, () => console.log("🚀 Server running on port 4000"));
