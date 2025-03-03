const express = require("express");
const Stock = require("../DAO/models/Stock");

const router = express.Router();

// API route to fetch historical stock data
router.get("/history", async (req, res) => {
  try {
    const history = await Stock.find().sort({ time: -1 }).limit(90); // Fetch last 90 stock entries
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});

module.exports = router;
