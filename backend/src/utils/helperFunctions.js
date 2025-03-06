// Helper function to generate new stock values
const generateNewStockValues = (stock) => {
  const volatility = 0.05; // 5% fluctuation
  const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;

  const newOpen = stock.close * randomFactor;
  const newClose = newOpen * (1 + (Math.random() * 2 - 1) * volatility);
  const newHigh = Math.max(newOpen, newClose) * (1 + Math.random() * 0.03);
  const newLow = Math.min(newOpen, newClose) * (1 - Math.random() * 0.03);
  const newVolume = Math.floor(
    stock.volume * (1 + (Math.random() * 2 - 1) * 0.1)
  );

  return {
    open: parseFloat(newOpen.toFixed(2)),
    close: parseFloat(newClose.toFixed(2)),
    high: parseFloat(newHigh.toFixed(2)),
    low: parseFloat(newLow.toFixed(2)),
    volume: newVolume,
    date: new Date(), // Timestamp for the new entry
  };
}

// Helper function to filter data based on the time range
const filterDataByRange = (data, range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case "1hour":
      startDate = new Date(now.setHours(now.getHours() - 1));
      break;
    case "1day":
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case "1week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "1month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "3months":
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case "6months":
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case "1year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case "5years":
      startDate = new Date(now.setFullYear(now.getFullYear() - 5));
      break;
    case "10years":
      startDate = new Date(now.setFullYear(now.getFullYear() - 10));
      break;
    case "all":
    default:
      return data; // Return all data if range is "all" or invalid
  }

  // Filter data to include only entries after the start date
  return data.filter((entry) => new Date(entry.date) >= startDate);
};

module.exports = { generateNewStockValues, filterDataByRange };