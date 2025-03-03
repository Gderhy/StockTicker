// Helper function to filter data based on the time range
export const filterDataByRange = (data, range) => {
  const now = new Date();
  let startDate;

  switch (range) {
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
  return data.filter((entry) => new Date(entry.time) >= startDate);
};
