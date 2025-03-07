require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = "https://api.polygon.io/v2/aggs/ticker";

// Function to fetch historical data from Polygon.io
async function fetchPolygonData(stockSymbol, multiplier = 1, timespan = "day") {
  // Define date range for fetching historical data
  // Get today's date
  const endDate = new Date();
  const startDate = new Date();

  // Subtract 6 months from today's date
  startDate.setMonth(startDate.getMonth() - 6);

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split("T")[0];

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  try {
    console.log(`Fetching historical data for ${stockSymbol} from Polygon...`);

    const url = `${POLYGON_BASE_URL}/${stockSymbol}/range/${multiplier}/${timespan}/${formattedStartDate}/${formattedEndDate}?adjusted=true&sort=asc&apiKey=${API_KEY}`;

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
