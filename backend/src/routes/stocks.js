const express = require("express");
const {
  fetchHistoricalStockData,
} = require("../services/fetchSpecificStockData");

const router = express.Router();

// Route to fetch historical stock data with filtering in MongoDB
router.get("/:stockSymbol", async (req, res) => {
  const { stockSymbol } = req.params;
  const { range } = req.query; // Range query parameter (e.g., 1month, 3month, 6month)

  console.log("GET /api/stocks/:stockSymbol", stockSymbol, range);

  if (!stockSymbol) {
    return res.status(400).json({ message: "Stock symbol is required" });
  }

  try {
    // Fetch filtered stock data based on range
    const stockData = await fetchHistoricalStockData(stockSymbol, range);

    res.json(stockData);
  } catch (error) {
    console.error(`Error fetching stock data for ${stockSymbol}:`, error);
    res.status(500).json({ message: "Error fetching stock data" });
  }
});

module.exports = router;
