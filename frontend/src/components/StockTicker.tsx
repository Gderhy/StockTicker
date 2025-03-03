import React, { useEffect, useState, useRef } from "react";
import { connectToStockService } from "../services/stockService";
import "./StockTicker.css"; // Import styles

const StockTicker: React.FC = () => {
  const [stockData, setStockData] = useState<any[]>([]);
  const [isLoadingStockData, setIsLoadingStockData] = useState<boolean>(true);
  const previousPricesRef = useRef<
    Record<string, { price: number; lastUpdate: string }>
  >({});

  useEffect(() => {
    const unsubscribe = connectToStockService((data: any) => {
      setStockData((prevData) => {
        return data.map((stock: any) => {
          const previousEntry = previousPricesRef.current[stock.symbol] || {
            price: stock.close,
            lastUpdate: "N/A",
          };

          const lastUpdate = new Date().toLocaleTimeString(); // Store update time

          previousPricesRef.current[stock.symbol] = {
            price: stock.close,
            lastUpdate,
          };

          return { ...stock, previousPrice: previousEntry.price, lastUpdate };
        });
      });

      setIsLoadingStockData(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
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
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {!isLoadingStockData && Array.isArray(stockData) ? (
              stockData.map((stock) => {
                const changeColor = getPriceChangeColor(
                  stock.close,
                  stock.previousPrice
                );
                return (
                  <tr key={stock.symbol}>
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
                      {stock.close > stock.previousPrice
                        ? "▲"
                        : stock.close < stock.previousPrice
                        ? "▼"
                        : "—"}
                      ${Math.abs(stock.close - stock.previousPrice).toFixed(2)}
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
