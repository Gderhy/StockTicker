// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // Import Routes and Route
import StockTicker from "./components/StockTickerList"; // Home page component
import StockDetail from "./components/StockChart"; // Stock detail page component

const App: React.FC = () => {
  // console.log("App component rendered");
  return (
    <Routes>
      <Route path="/" element={<StockTicker />} /> {/* Main homepage route */}
      <Route path="/stocks/:symbol" element={<StockDetail />} /> {/* Stock detail route */}
    </Routes>
  );
};

export default App;
