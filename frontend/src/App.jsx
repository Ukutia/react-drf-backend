import React from "react";
import Inventory from "./components/Inventario";
import Pedidos from "./components/Pedidos";
import CrearPedido from "./components/CrearPedido";
import AgregarFactura from "./components/CrearFactura";
import Facturas from "./components/Facturas";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<p>Bienvenido al Inventario</p>} />
        <Route path="/productos" element={<Inventory />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/pedidos/crear" element={<CrearPedido />} />
        <Route path="/facturas/crear" element={<AgregarFactura />} />
        <Route path="/facturas" element={<Facturas />} />
      </Routes>
    </Router>
  );
}

export default App;
