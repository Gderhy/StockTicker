// src/services/stockService.ts

const STOCK_SERVER_URL = "ws://localhost:4000"; // Your backend WebSocket URL

// Function to initialize WebSocket connection
export const connectToStockService = (onMessage: (data: any) => void, subscribedStockSymbol="all") => {
  // Function to send a message to the WebSocket server (if needed)
  const sendMessage = (message: string) => {
    if (socket !== null && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.error("WebSocket connection is closed");
    }
  };

  const socket = new WebSocket(STOCK_SERVER_URL);

  socket.onopen = () => {
    console.log("Connected to the WebSocket server");    
    sendMessage(JSON.stringify({ action: "subscribe", symbol: subscribedStockSymbol }));
  };

  socket.onmessage = (event) => {
    const stockData = JSON.parse(event.data);
    console.log("Received stock data:", stockData);
    onMessage(stockData); // Pass data to the callback
  };

  socket.onclose = () => {
    console.log("Disconnected from the WebSocket server");
    // socket = null; // Reset socket to allow reconnection
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  // Return an unsubscribe function to close the connection
  return socket;
};

// Function to send a message to the WebSocket server (if needed)

// Function to fetch initial stock data from the API
export const fetchStockData = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/stocks");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    throw error;
  }
};

export const fetchHistoricalData = async (symbol: string, range: string) => {
  try {
    if(!symbol) {
      throw new Error("Symbol is required");
    }
    if(!range) {
      range = "6months"; // Default range
    }
    const response = await fetch(`http://localhost:4000/api/stocks/${symbol}?range=${range}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    throw error;
  }
}
