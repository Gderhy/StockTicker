// ./src/routes/stocks.js

const express = require("express");
const { fetchSpecificStockData } = require("../DAO/services/fetchSpecificStockData");
const { filterDataByRange } = require("../utils/helperFunctions");

const router = express.Router();

// Route to fetch history of a specific stock
router.get("/:stockSymbol", async (req, res) => {
  const { stockSymbol } = req.params;
  const { range } = req.query; // Range query parameter (e.g., 1month, 3month, 6month)
  console.log("GET /api/stocks/:stockSymbol", stockSymbol, range);

  if (!stockSymbol) {
    return res.status(400).json({ message: "Stock symbol is required" });
  }

  try {
    // Fetch all stock data for the given symbol
    const stockData = await fetchSpecificStockData(stockSymbol);

    // Filter data based on the requested range
    const filteredData = filterDataByRange(stockData, range);

    res.json(filteredData);
  } catch (error) {
    console.error(`Error fetching stock data for ${stockSymbol}:`, error);
    res.status(500).json({ message: "Error fetching stock data" });
  }
});

module.exports = router;