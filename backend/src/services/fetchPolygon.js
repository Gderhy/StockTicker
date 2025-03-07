require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = "https://api.polygon.io/v2/aggs/ticker";

// Function to fetch historical data from Polygon.io
async function fetchPolygonData(stockSymbol, multiplier = 1, timespan = "day") {
  // Define date range for fetching historical data
  const startDate = "2023-01-01"; // Change to desired start date (YYYY-MM-DD)
  const endDate = "2024-01-01"; // Change to desired end date (YYYY-MM-DD)

  try {
    console.log(`Fetching historical data for ${stockSymbol} from Polygon...`);

    const url = `${POLYGON_BASE_URL}/${stockSymbol}/range/${multiplier}/${timespan}/${startDate}/${endDate}?adjusted=true&sort=asc&apiKey=${API_KEY}`;

    const response = await axios.get(url);
    const data = response.data;

    if (!data.results || data.results.length === 0) {
      console.warn(`No historical data found for ${stockSymbol}`);
      return [];
    }

    // Transform the response data to match MongoDB schema
    return data.results.map((entry) => ({
      date: new Date(entry.t), // Convert timestamp to Date
      open: entry.o,
      high: entry.h,
      low: entry.l,
      close: entry.c,
      volume: entry.v,
    }));
  } catch (error) {
    console.error(
      `Error fetching data for ${stockSymbol}:`,
      error.response?.data || error.message
    );
    return [];
  }
}

module.exports = { fetchPolygonData };
