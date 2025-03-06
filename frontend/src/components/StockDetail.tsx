import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
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
import "chartjs-adapter-date-fns";
import {
  fetchHistoricalData,
  connectToStockService,
} from "../services/stockService";
import "./StockDetail.css";
import { StockDataType } from "../types";
import { format } from "date-fns";

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
  const { symbol } = useParams<{ symbol: string }>();

  const [historicalData, setHistoricalData] = useState<StockDataType[]>([]);
  const [timeRange, setTimeRange] = useState<string>("6months");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stockData, setStockData] = useState<StockDataType | null>(null);
  const [previousStockData, setPreviousStockData] = useState<StockDataType | null>(null);

  // Handle live stock price updates
  const handleLivePriceUpdate = (
    updatedStockData: Record<string, StockDataType>
  ) => {
    if (!updatedStockData || !symbol || !updatedStockData[symbol]) return;

    const latestStock = updatedStockData[symbol];

    setStockData((prevStock) => {
      setPreviousStockData(prevStock);
      return latestStock;
    });

    setHistoricalData((prevData) => {
      if (prevData.length === 0) return [latestStock]; // Initialize if empty

      if (prevData[prevData.length - 1].date === latestStock.date) {
        return prevData; // Avoid duplicate timestamps
      }

      // ✅ Replace the oldest record with the latest, this will not make the chart grow indefinitely
      return [...prevData.slice(1), latestStock];
    });
  };

  // Fetch historical data when symbol or timeRange changes
  useEffect(() => {
    const loadData = async () => {
      if (symbol) {
        setIsLoading(true);
        setHistoricalData([]);
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

  // WebSocket for live updates
  useEffect(() => {
    if (!symbol) return;

    const webSocketConnection = connectToStockService(
      handleLivePriceUpdate,
      symbol
    );

    return () => {
      if (webSocketConnection) webSocketConnection.close();
    };
  }, [symbol]);

  // Format date for Chart.js
 const formatDate = (date: Date) => {
   switch (timeRange) {
     case "1hour":
     case "1day":
       return format(date, "HH:mm"); // 24-hour format, e.g., "14:30"
     case "1week":
       return format(date, "MMM d"); // e.g., "Oct 5"
     case "1month":
     case "3months":
     case "6months":
     default:
       return format(date, "MMM d, yyyy"); // e.g., "Oct 5, 2023"
   }
 };
  // Format data for Chart.js
  const chartData = {
    labels: historicalData.map((entry) => formatDate(entry.date)),
    datasets: [
      {
        label: "Stock Price",
        data: historicalData.map((entry) => entry.close),
        borderColor: "#2962FF",
        backgroundColor: "rgba(41, 98, 255, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.3,
      },
    ],
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
            className={
              stockData.close > (previousStockData?.close ?? stockData.close)
                ? "price-green"
                : stockData.close <
                  (previousStockData?.close ?? stockData.close)
                ? "price-red"
                : "price-neutral"
            }
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
          <Line
            data={chartData}
            // options={getOptions()}
          />
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;
