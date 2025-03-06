import React, { useEffect, useRef, useState } from "react";
import { connectToStockService } from "../services/stockService";
import "./StockTickerList.css"; // Import styles
import { StockDataType } from "../types";
import { useNavigate } from "react-router-dom";

const StockTicker: React.FC = () => {
  const navigate = useNavigate();

  const [stockData, setStockData] = useState<Record<string, StockDataType>>({});
  const [previousStockData, setPreviousStockData] = useState<Record<string, StockDataType>>({}); // Track previous stock data
  const [isLoadingStockData, setIsLoadingStockData] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Track the search term

  // Use a ref to store the WebSocket connection
  const wsConnectionRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const webSocketConnection = connectToStockService(
      (data: Record<string, StockDataType>) => {
        console.log("Received stock data:", data);

        setStockData((prevStockData) => {
          const updatedStockData = { ...prevStockData }; // ✅ Use a plain object instead of a Map

          // Save previous stock data before updating
          setPreviousStockData({ ...prevStockData });

          // Update stock data with new values from WebSocket
          Object.entries(data).forEach(([symbol, stock]) => {
            updatedStockData[symbol] = {...stock, date: new Date(stock.date) }; // ✅ Convert date string to Date object
          });

          return updatedStockData; // ✅ Return an updated object
        });

        setIsLoadingStockData(false);
      }
    );

    wsConnectionRef.current = webSocketConnection;

    return () => {
      if (wsConnectionRef.current) {
        wsConnectionRef.current.close(); // Close the WebSocket connection
        console.log("WebSocket connection closed.");
      }
    };
  }, []);

  const getPriceChangeColor = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) return "green";
    if (currentPrice < previousPrice) return "red";
    return "grey";
  };

  // Filter stock data based on the search term
  const filteredStockData = Object.values(stockData).filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  };

  return (
    <div className="stock-container">
      <div className="header-container">
        <h1>Stock Market Updates</h1>
        <input
          type="text"
          placeholder="Search stocks..."
          className="search-bar"
          value={searchTerm} // Set the value to the search term
          onChange={(e) => setSearchTerm(e.target.value)} // Update the search term
        />
      </div>
      <div className="stock-table">
        <table>
          <thead>
            <tr>
              <th>Last Update</th>
              <th>Symbol</th>
              <th>Company</th>
              <th>Open</th>
              <th>Price</th>
              <th>High</th>
              <th>Low</th>
              <th>Volume</th>
              <th>Price Change</th>
            </tr>
          </thead>
          <tbody>
            {!isLoadingStockData ? (
              filteredStockData.map((stock) => {
                const previousStock = previousStockData[stock.symbol];
                const previousPrice = previousStock
                  ? previousStock.close
                  : stock.close;
                const changeColor = getPriceChangeColor(
                  stock.close,
                  previousPrice
                );

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{formatDate(stock.date)}</td>
                    <td>{stock.symbol}</td>
                    <td>{stock.companyName}</td>
                    <td>${stock.open.toFixed(2)}</td>
                    <td className={`price ${changeColor}`}>
                      ${stock.close.toFixed(2)}
                    </td>
                    <td>${stock.high.toFixed(2)}</td>
                    <td>${stock.low.toFixed(2)}</td>
                    <td>{stock.volume.toLocaleString()}</td>
                    <td className={`change ${changeColor}`}>
                      {stock.close > previousPrice
                        ? "▲"
                        : stock.close < previousPrice
                        ? "▼"
                        : "—"}{" "}
                      ${Math.abs(stock.close - previousPrice).toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>Loading stock data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTicker;
