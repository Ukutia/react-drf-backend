import React from "react";
import Inventory from "./components/Inventario";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<p>Bienvenido al Inventario</p>} />
        <Route path="/inventario" element={<Inventory />} />
      </Routes>
    </Router>
  );
}

export default App;
