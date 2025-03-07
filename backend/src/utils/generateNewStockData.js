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

module.exports = { generateNewStockValues };