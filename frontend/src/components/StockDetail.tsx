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
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns"; // For date formatting
import { fetchHistoricalData } from "../services/stockService";
import "./StockDetail.css"; // Import styles

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Add TimeScale for date formatting
);

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>(); // Get symbol from URL
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6months"); // Default time range
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (symbol) {
        setIsLoading(true);
        const data = await fetchHistoricalData(symbol, timeRange);
        console.log(data);
        setHistoricalData(data);
        setIsLoading(false);
      }
    };
    loadData();
  }, [timeRange]);

  // Format data for Chart.js
  const chartData = {
    labels: historicalData.map((entry) => entry.date),
    datasets: [
      {
        label: "Stock Price",
        data: historicalData.map((entry) => entry.close),
        borderColor: "#2962FF", // Blue line (like Yahoo Finance)
        backgroundColor: "rgba(41, 98, 255, 0.1)", // Light blue fill
        borderWidth: 2,
        pointRadius: 0, // Hide points for a cleaner look
        fill: true, // Fill area under the line
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time", // Use time scale for the x-axis
        time: {
          unit: timeRange === "1day" ? "hour" : "day", // Adjust unit based on range
          displayFormats: {
            day: "MMM d", // Format as "Jan 1", "Feb 2", etc.
            hour: "ha", // Format as "12PM", "1PM", etc.
          },
        },
        grid: {
          display: false, // Hide x-axis grid lines
        },
        ticks: {
          color: "#888", // Light gray color for ticks
        },
      },
      y: {
        grid: {
          color: "#444", // Dark gray grid lines for y-axis
        },
        ticks: {
          color: "#888", // Light gray color for ticks
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: true,
        text: `${symbol} Stock Price`,
        color: "#FFF", // White title text
        font: {
          size: 18,
        },
      },
      tooltip: {
        backgroundColor: "#333", // Dark tooltip background
        titleColor: "#FFF", // White tooltip title
        bodyColor: "#FFF", // White tooltip body
        borderColor: "#444", // Gray border
        borderWidth: 1,
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
          {/* <option value="all">All Time</option>
          <option value="10years">10 Years</option>
          <option value="5years">5 Years</option>
          <option value="1year">1 Year</option> */}
          <option value="6month">6 Month</option>
          <option value="3month">3 Month</option>
          <option value="1month">1 Month</option>
          <option value="1week">1 Week</option>
          <option value="1day">1 Day</option>
        </select>
      </div>
      <div className="chart-container">
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <Line
            data={chartData}
            options={options as any} // Cast options to any to bypass type checking
          />
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;
