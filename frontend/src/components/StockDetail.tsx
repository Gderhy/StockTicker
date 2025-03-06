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
  TimeScale
);

const StockDetailPage: React.FC = () => {
  const navigator = useNavigate();
  const { symbol } = useParams<{ symbol: string }>(); // Get stock symbol from URL

  const [historicalData, setHistoricalData] = useState<StockDataType[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6months"); // Default time range
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stockData, setStockData] = useState<StockDataType | null>(null); // ✅ Live stock data object
  const [previousStockData, setPreviousStockData] =
    useState<StockDataType | null>(null); // ✅ Store previous live stock data

  // Function to handle live stock price updates
  const handleLivePriceUpdate = (
    updatedStockData: Record<string, StockDataType>
  ) => {
    if (!updatedStockData || !symbol || !updatedStockData[symbol]) return;

    const latestStock = updatedStockData[symbol];

    setStockData((prevStock) => {
      setPreviousStockData(prevStock); // Store previous stock data
      return latestStock;
    });

    setHistoricalData((prevData) => {
      if (
        prevData.length > 0 &&
        prevData[prevData.length - 1].date === latestStock.date
      ) {
        return prevData; // Avoid duplicate timestamps
      }
      return [...prevData, latestStock]; // ✅ Append new stock data
    });
  };

  // Fetch historical stock data on mount or when timeRange changes
  useEffect(() => {
    const loadData = async () => {
      if (symbol) {
        setIsLoading(true);
        setHistoricalData([]); // ✅ Clear previous data before fetching new
        try {
          const data = await fetchHistoricalData(symbol, timeRange);
          setHistoricalData(data);
        } catch (error) {
          console.error("Error fetching historical data:", error);
        }
        setIsLoading(false);
      }
    };
    loadData();
  }, [symbol, timeRange]);

  // Establish WebSocket connection for live updates
  useEffect(() => {
    if (!symbol) return;

    const webSocketConnection = connectToStockService(
      handleLivePriceUpdate,
      symbol
    );

    return () => {
      if (webSocketConnection) webSocketConnection.close(); // ✅ Close WebSocket on component unmount
    };
  }, [symbol]);

  const getUnit = () => {
    switch (timeRange) {
      case "1hour":
        return "minute";
      case "1day":
        return "day";
      case "1week":
        return "week";
      case "1month":
      case "3months":
      case "6months":
      default:
        return "month";
    }
  };

  // Format data for Chart.js
  const chartData = {
    labels: historicalData.map((entry) => entry.date),
    datasets: [
      {
        label: "Stock Price",
        data: historicalData.map((entry) => entry.close),
        borderColor: "#2962FF",
        backgroundColor: "rgba(41, 98, 255, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          unit: getUnit(),
          displayFormats: {
            day: "MMM d",
            hour: "ha",
          },
        },
        grid: { display: false },
        ticks: { color: "#888" },
      },
      y: {
        grid: { color: "#444" },
        ticks: { color: "#888" },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `${symbol} Stock Price`,
        color: "#FFF",
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#FFF",
        bodyColor: "#FFF",
        borderColor: "#444",
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

      {stockData && (
        <div className="live-price">
          <h2
            style={{
              color:
                stockData.close > (previousStockData?.close ?? stockData.close)
                  ? "green"
                  : stockData.close <
                    (previousStockData?.close ?? stockData.close)
                  ? "red"
                  : "white",
            }}
          >
            Live Price: ${stockData.close.toFixed(2)}
          </h2>
        </div>
      )}

      <div className="time-range-selector">
        <div className="time-range-options">
          {["1hour", "1day", "1week", "1month", "3months", "6months"].map(
            (range) => (
              <div key={range}>
                <input
                  type="radio"
                  id={range}
                  name="timeRange"
                  value={range}
                  checked={timeRange === range}
                  onChange={(e) => setTimeRange(e.target.value)}
                />
                <label htmlFor={range}>
                  {range.replace(/(\d)([a-z]+)/, "$1 $2")}
                </label>
              </div>
            )
          )}
        </div>
      </div>

      <div className="chart-container">
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <Line data={chartData} options={options as any} />
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;
