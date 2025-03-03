import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2"; // Using react-chartjs-2 for charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>(); // Get symbol from URL
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6months"); // Default time range

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchHistoricalData(symbol, timeRange);
      setHistoricalData(data);
    };
    loadData();
  }, [symbol, timeRange]);

  // Format data for Chart.js
  const chartData = {
    labels: historicalData.map((entry) => entry.date),
    datasets: [
      {
        label: "Stock Price",
        data: historicalData.map((entry) => entry.close),
        borderColor: "#4caf50", // Green line
        backgroundColor: "rgba(76, 175, 80, 0.1)", // Light green fill
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${symbol} Stock Price`,
      },
    },
  };

  return (
    <div className="stock-detail-container">
      <h1>{symbol} Historical Prices</h1>
      <div className="time-range-selector">
        <label>Time Range: </label>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="10years">10 Years</option>
          <option value="5years">5 Years</option>
          <option value="1year">1 Year</option>
          <option value="6months">6 Months</option>
          <option value="3months">3 Months</option>
          <option value="1month">1 Month</option>
          <option value="1week">1 Week</option>
          <option value="1day">1 Day</option>
        </select>
      </div>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StockDetailPage;
