// ./server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const connectDB = require("./src/DAO/connectDB");

const stockRoutes = require("./src/routes/stocks");
const { fetchLatestStockData } = require("./src/DAO/services/fetchStockData");

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
      console.log(`Received message from ${clientId}:`, data);

      // Check if the message is a subscription request
      if (data.action === "subscribe" && data.symbol) {
        // Add stock to client's subscribed stocks list
        ws.subscribedStock = data.symbol;
        console.log(`${clientId} subscribed to ${data.symbol}`);
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

const latestStockData = new Map(); // Store the latest stock data

// Send stock updates periodically (e.g., every second)
setInterval(async () => {

  // Fetch the latest stock data
  await fetchLatestStockData(latestStockData); 
  
  wss.clients.forEach(async (client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (client.subscribedStock === "all") {
        // If on homepage -- if client is subscribed to all stocks
        client.send(JSON.stringify(latestStockData)); // Send the latest stock data to clients
      } else if (client.subscribedStock !== null) {
        // If client is subscribed to a specific stock
        console.log(`Client ${client.clientId} is subscribed to ${client.subscribedStock}`);
        const specificStockData = latestStockData.filter(
          (stock) => stock.symbol === client.subscribedStock
        );
        client.send(JSON.stringify(specificStockData)); // Send the specific stock data to clients
      } else {
        console.log(`Client ${client.clientId} is not connected.`);
      }
    }
  });
}, 1000);

// Start the server on port 4000
server.listen(4000, () => console.log("🚀 Server running on port 4000"));
