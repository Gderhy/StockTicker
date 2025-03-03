import React, { useEffect, useRef, useState } from "react";
import { connectToStockService } from "../services/stockService";
import "./StockTickers.css"; // Import styles
import { StockDataType } from "../types";
import { useNavigate } from "react-router-dom";

const StockTicker: React.FC = () => {
  const navigate = useNavigate();

  const [stockData, setStockData] = useState<Map<string, StockDataType>>(
    new Map()
  );
  const [previousStockData, setPreviousStockData] = useState<
    Map<string, StockDataType>
  >(new Map());
  const [isLoadingStockData, setIsLoadingStockData] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Track the search term

  // Use a ref to store the WebSocket connection
  const wsConnectionRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const webSocketConnection = connectToStockService((data: any) => {
      setStockData((prevStockData) => {
        const updatedStockData = new Map(prevStockData);

        // Save previous stock data before updating
        setPreviousStockData((prev) => {
          const updatedPrev = new Map(prev);
          prevStockData.forEach((value, key) => {
            updatedPrev.set(key, value);
          });
          return updatedPrev;
        });

        // Update stock data
        data.forEach((stock: any) => {
          const lastUpdate = new Date().toLocaleTimeString();
          updatedStockData.set(stock.symbol, { ...stock, lastUpdate });
        });

        return updatedStockData;
      });

      setIsLoadingStockData(false);
    });

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
  const filteredStockData = Array.from(stockData.values()).filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <th>Close</th>
              <th>High</th>
              <th>Low</th>
              <th>Volume</th>
              <th>Price Change</th>
            </tr>
          </thead>
          <tbody>
            {!isLoadingStockData ? (
              filteredStockData.map((stock) => {
                const previousStock = previousStockData.get(stock.symbol);
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
                    <td>{stock.lastUpdate}</td>
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
