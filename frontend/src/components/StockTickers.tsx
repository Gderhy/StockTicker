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

  // Use a ref to store the WebSocket connection
  const wsConnection = useRef<WebSocket | null>(null);

  useEffect(() => {
    const unsubscribe = connectToStockService((data: any) => {
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

    wsConnection.current = unsubscribe;

    return () => {
      if (wsConnection.current) {
        wsConnection.current.close(); // Close the WebSocket connection
        console.log("WebSocket connection closed.");
      }
    };
  }, []);

  const getPriceChangeColor = (currentPrice: number, previousPrice: number) => {
    if (currentPrice > previousPrice) return "green";
    if (currentPrice < previousPrice) return "red";
    return "grey";
  };

  return (
    <div className="stock-container">
      <h1>Stock Market Updates</h1>
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
              Array.from(stockData.values()).map((stock) => {
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
                    onClick={() => navigate(`/stock/${stock.symbol}`)}
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
