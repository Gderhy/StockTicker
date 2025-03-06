// ./server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { connectDB, disconnectDB } = require("./src/db/mongoDb");

const stockRoutes = require("./src/routes/stocks");
const { fetchLatestStockData } = require("./src/services/fetchLatestStockData");

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create HTTP server
const wss = new WebSocket.Server({ server }); // Create WebSocket server

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable JSON parsing

// Routes
app.use("/api/stocks", stockRoutes); // Use stock routes

connectDB(); // Call the function to establish database connection

wss.on("connection", (ws, req) => {
  // Create a unique client ID (optional)
  const clientId = `client-${Math.random().toString(36).substring(2, 11)}`;
  ws.clientId = clientId;
  console.log(`Client connected: ${clientId}`);

  ws.subscribedStocks = ["all"]; // Array of subscribed stocks (default: all)

  // Listen for incoming messages (e.g., subscribe to specific stock)
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message from ${clientId}:`, data);

      // Check if the message is a subscription request
      if (data.action === "subscribe" && data.symbol) {
        // Add stock to client's subscribed stocks list
        ws.subscribedStocks.push(data.symbol);
        console.log(`${clientId} subscribed to ${data.symbol}`);
      } else if (data.action === "unsubscribe" && data.symbol) {
        // Remove stock from client's subscribed stocks list
        ws.subscribedStocks.remove(data.symbol);
        console.log(`${clientId} unsubscribed from ${data.symbol}`);
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

// Send stock updates to WebSocket clients every second
setInterval(async () => {
  // Fetch the latest stock data and update the map
  await fetchLatestStockData(latestStockData);

  // Iterate through all connected WebSocket clients
  wss.clients.forEach(async (client) => {
    if (client.readyState !== WebSocket.OPEN) return; // Skip disconnected clients

    // Determine which stock data to send based on the client's subscription
    let stockDataToSend;

    if (client.subscribedStocks.includes("all")) {
      // Client is subscribed to all stocks (e.g., homepage view)
      stockDataToSend = latestStockData
    } else if (client.subscribedStocks.length > 0) {
      // Client is subscribed to specific stocks
      console.log(`Client ${client.clientId} is subscribed to: ${client.subscribedStocks}`);

      stockDataToSend = client.subscribedStocks.reduce(
        (filtered, symbol) => {
          if (latestStockData.has(symbol)) {
            filtered[symbol] = latestStockData.get(symbol);
          }
          return filtered;
        },
        {}
      );

    } else {
      console.log(`Client ${client.clientId} is connected but not subscribed to any stocks.`);
      return; // Skip sending data to unsubscribed clients
    }

    // Send the stock data to the client
    client.send(JSON.stringify(stockDataToSend));
    console.log(stockDataToSend);
  });
}, 1000);


// Start the server on port 4000
server.listen(4000, () => console.log("🚀 Server running on port 4000"));

server.on("error", (error) => {
  disconnectDB(); // Disconnect from MongoDB on server
  wss.close(); // Close WebSocket server
  console.error("Server error:", error);
});

server.on("close", () => {
  disconnectDB(); // Disconnect from MongoDB on server close
  wss.close(); // Close WebSocket server
  console.log("Server closed.");
});
