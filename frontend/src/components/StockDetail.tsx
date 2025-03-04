import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import {
  fetchHistoricalData,
  connectToStockService,
} from "../services/stockService";
import "./StockDetail.css"; // Import styles
import { StockDataType } from "../types";

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
  const navigator = useNavigate();
  const { symbol } = useParams<{ symbol: string }>(); // Get symbol from URL
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6months"); // Default time range
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [livePrice, setLivePrice] = useState<number | null>(null); // Store live stock price
  const [previousLivePrice, setPreviousLivePrice] = useState<number | null>(null); // Store previous live stock price

  // Function to handle live stock price updates
  const handleLivePriceUpdate = (stockData: StockDataType[]) => {
    if (!stockData || stockData.length === 0) return;

    const latestEntry = stockData[0];
    const latestPrice = latestEntry.close;
    const latestTimestamp = new Date().toISOString(); // Get current timestamp

    setLivePrice((prevLivePrice) => {
      setPreviousLivePrice(prevLivePrice); // Store previous live price
      return latestPrice;
    });

    setHistoricalData((prevData) => {
      // Append the new data only if the timestamp is unique
      if (
        prevData.length > 0 &&
        prevData[prevData.length - 1].date === latestTimestamp
      ) {
        return prevData; // Avoid duplicate entries
      }

      const newHistoricalData = [...prevData, { date: latestTimestamp, close: latestPrice }];

      console.log("New historical data:", newHistoricalData);
      return newHistoricalData;
    });
  };

  useEffect(() => {
    const loadData = async () => {
      if (symbol) {
        setIsLoading(true);
        const data = await fetchHistoricalData(symbol, timeRange);
        setHistoricalData(data);
        setIsLoading(false);
      }
    };
    loadData();
  }, [symbol, timeRange]);

  useEffect(() => {
    const webSocketConnection = connectToStockService(
      handleLivePriceUpdate,
      symbol
    );

    return () => {
      if (webSocketConnection) webSocketConnection.close(); // Clean up connection
    };
  }, []);

  const getUnit = () => {
    switch (timeRange) {
      case "1hour":
        return "minute";
      case "1day":
        return "day";
      case "1week":
        return "week";
      case "1month":
        return "month";
      case "3months":
        return "month";
      case "6months":
        return "month";
      default:
        return "month";
    }
  }

  // Format data for Chart.js
  const chartData = {
    labels: historicalData.map((entry:StockDataType) => entry.date),
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
          unit: getUnit(), // Adjust unit based on range
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
      <div className="back-button-container">
        <button onClick={() => navigator("/")} className="back-button">
          Back
        </button>
      </div>
      <h1>{symbol} Historical Prices</h1>
      {livePrice !== null && (
        <div className="live-price">
          <h2
            style={{
              color:
                livePrice > (previousLivePrice ?? livePrice)
                  ? "green"
                  : livePrice < (previousLivePrice ?? livePrice)
                  ? "red"
                  : "white",
            }}
          >
            Live Price: ${livePrice.toFixed(2)}
          </h2>
          {/* Display live price */}
        </div>
      )}
      <div className="time-range-selector">
        <div className="time-range-options">
          <label>Time Range: </label>
          <div>
            <input
              type="radio"
              id="1hour"
              name="timeRange"
              value="1hour"
              checked={timeRange === "1hour"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="1hour">1 Hour</label>
          </div>
          <div>
            <input
              type="radio"
              id="1day"
              name="timeRange"
              value="1day"
              checked={timeRange === "1day"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="1day">1 Day</label>
          </div>
          <div>
            <input
              type="radio"
              id="1week"
              name="timeRange"
              value="1week"
              checked={timeRange === "1week"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="1week">1 Week</label>
          </div>
          <div>
            <input
              type="radio"
              id="1month"
              name="timeRange"
              value="1month"
              checked={timeRange === "1month"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="1month">1 Month</label>
          </div>
          <div>
            <input
              type="radio"
              id="3months"
              name="timeRange"
              value="3months"
              checked={timeRange === "3months"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="3months">3 Months</label>
          </div>
          <div>
            <input
              type="radio"
              id="6months"
              name="timeRange"
              value="6months"
              checked={timeRange === "6months"}
              onChange={(e) => setTimeRange(e.target.value)}
            />
            <label htmlFor="6months">6 Months</label>
          </div>
        </div>
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
