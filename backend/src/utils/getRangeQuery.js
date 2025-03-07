// Helper function to generate MongoDB query based on time range
const getRangeQuery = (range) => {
  const now = new Date();
  let startDate = null;

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
    case "all":
    default:
      return {}; // No filtering, return all data
  }

  // If a valid startDate exists, return the MongoDB query
  return { date: { $gte: startDate } };
};

module.exports = { getRangeQuery };
