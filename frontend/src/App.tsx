// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom"; // Import Routes and Route
import StockTicker from "./components/StockTicker"; // Home page component

const App: React.FC = () => {
  // console.log("App component rendered");
  return (
    <Routes>
      <Route path="/" element={<StockTicker />} /> {/* Main homepage route */}
    </Routes>
  );
};

export default App;
