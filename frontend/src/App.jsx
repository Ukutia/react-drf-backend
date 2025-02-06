import React from "react";
import Inventory from "./components/Inventario";
import Pedidos from "./components/Pedidos";
import CrearPedido from "./components/CrearPedido";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<p>Bienvenido al Inventario</p>} />
        <Route path="/inventario" element={<Inventory />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/pedidos/crear" element={<CrearPedido />} />
      </Routes>
    </Router>
  );
}

export default App;
