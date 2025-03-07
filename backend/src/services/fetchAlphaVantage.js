require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_API = "https://www.alphavantage.co/query";

// Function to fetch historical data from Alpha Vantage
async function fetchAlphaVantageData(stockSymbol) {
  try {
    console.log(
      `Fetching historical data for ${stockSymbol} from Alpha Vantage...`
    );

    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: "TIME_SERIES_INTRADAY",
        symbol: stockSymbol,
        interval: "5min", // Adjust interval as needed (1min, 5min, 15min, etc.)
        outputsize: "full", // Fetch full 30 days of data
        datatype: "json",
        apikey: API_KEY,
      },
    });

    const timeSeries = response.data["Time Series (5min)"]; // Extract time series data
    if (!timeSeries) {
      console.error(`No data found for ${stockSymbol}`);
      return [];
    }

    // Transform data to match MongoDB schema
    return Object.entries(timeSeries).map(([timestamp, entry]) => ({
      date: new Date(timestamp),
      open: parseFloat(entry["1. open"]),
      high: parseFloat(entry["2. high"]),
      low: parseFloat(entry["3. low"]),
      close: parseFloat(entry["4. close"]),
      volume: parseInt(entry["5. volume"]),
    }));
  } catch (error) {
    console.error(`Error fetching data for ${stockSymbol}:`, error);
    return [];
  }
}

module.exports = { fetchAlphaVantageData };