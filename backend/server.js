require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Stock Schema
const stockSchema = new mongoose.Schema({
  stock: String,
  price: Number,
  time: { type: Date, default: Date.now },
});
const Stock = mongoose.model("Stock", stockSchema);

const stocks = ["AAPL", "GOOGL", "MSFT"];

async function generateStockData() {
  return Promise.all(
    stocks.map(async (stock) => {
      const price = (Math.random() * 100 + 100).toFixed(2);
      const stockEntry = new Stock({ stock, price });
      await stockEntry.save();
      return { stock, price };
    })
  );
}

setInterval(async () => {
  const stockData = await generateStockData();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(stockData));
    }
  });
}, 1000);

app.get("/history", async (req, res) => {
  const history = await Stock.find().sort({ time: -1 }).limit(90);
  res.json(history);
});

server.listen(4000, () => console.log("🚀 Server running on port 4000"));
