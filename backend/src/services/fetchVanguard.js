const process = require("dotenv").config();
// replace the "demo" apikey below with your own key from https://www.alphavantage.co/support/#api-key

/**
 * Fetches intraday stock data for a given symbol from Alpha Vantage.
 * @param {string} symbol - The stock symbol to fetch data for.
 * @returns {Promise<Object>} - A promise that resolves to the stock data.
 */

const fetchVanguard = async (symbol) => {
  const { ALPHA_VANTAGE_API_KEY } = process.env;
//   const TIME_SERIES_INTRADAY = 

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&datatype=json&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};
