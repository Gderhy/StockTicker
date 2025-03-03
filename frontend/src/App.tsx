import React, { useEffect, useState } from "react";
import { connectToStockService, fetchStockData } from "./services/stockService";

const App: React.FC = () => {
  const [stockData, setStockData] = useState<any>(null);

  // Fetch initial stock data from the API
  useEffect(() => {
    const getStockData = async () => {
      const data = await fetchStockData();
      setStockData(data);
    };

    getStockData();
  }, []); // Runs only once when the component mounts

  // Connect to the WebSocket server for real-time updates
  useEffect(() => {
    const onMessage = (data: any) => {
      setStockData(data); // Update state with the incoming stock data
    };

    connectToStockService(onMessage); // Pass callback to handle real-time updates
  }, []); // Runs only once when the component mounts

  return (
    <div className="App">
      <h1>Stock Data</h1>
      <div>
        {stockData ? (
          <pre>{JSON.stringify(stockData, null, 2)}</pre>
        ) : (
          <p>Loading stock data...</p>
        )}
      </div>
    </div>
  );
};

export default App;
