const StockCollection = require("../DAO/models/Stock");

// Helper function to generate new stock values
function generateNewStockValues(stock) {
  const volatility = 0.05; // 5% fluctuation
  const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;

  const newOpen = stock.latestClose * randomFactor;
  const newClose = newOpen * (1 + (Math.random() * 2 - 1) * volatility);
  const newHigh = Math.max(newOpen, newClose) * (1 + Math.random() * 0.03);
  const newLow = Math.min(newOpen, newClose) * (1 - Math.random() * 0.03);
  const newVolume = Math.floor(
    stock.latestVolume * (1 + (Math.random() * 2 - 1) * 0.1)
  );

  return {
    symbol: stock._id,
    companyName: stock.companyName,
    open: parseFloat(newOpen.toFixed(2)),
    close: parseFloat(newClose.toFixed(2)),
    high: parseFloat(newHigh.toFixed(2)),
    low: parseFloat(newLow.toFixed(2)),
    volume: newVolume,
    date: new Date(), // Timestamp for the new entry
  };
}

// Function to fetch the latest stock data with 1 in 5 chance of update
async function fetchLatestStockData() {
  try {
    const latestStockData = await StockCollection.aggregate([
      { $sort: { date: -1 } }, // Sort by date in descending order
      {
        $group: {
          _id: "$symbol",
          companyName: { $first: "$companyName" },
          latestClose: { $first: "$close" },
          latestOpen: { $first: "$open" },
          latestHigh: { $first: "$high" },
          latestLow: { $first: "$low" },
          latestVolume: { $first: "$volume" },
          latestDate: { $first: "$date" },
        },
      },
    ]);

    // Loop through stocks and decide whether to update
    const updatedStockData = await Promise.all(
      latestStockData.map(async (stock) => {
        if (Math.random() < 0.2) {
          // 20% chance to update
          console.log(`Updating stock data for ${stock._id}...`);
          const newStock = generateNewStockValues(stock);
          await StockCollection.create(newStock); // Save new stock data to DB
          return newStock;
        } else {
          // Return the existing latest stock data
          return {
            symbol: stock._id,
            companyName: stock.companyName,
            open: stock.latestOpen,
            close: stock.latestClose,
            high: stock.latestHigh,
            low: stock.latestLow,
            volume: stock.latestVolume,
            date: stock.latestDate,
          };
        }
      })
    );

    return updatedStockData;
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
    return [];
  }
}

module.exports = { fetchLatestStockData };
