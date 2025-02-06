import React, { useEffect, useState } from "react";
import axios from "axios";

const Inventory = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/inventario/");
        setProductos(response.data);
      } catch (err) {
        setError("Error al cargar el inventario.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="inventory-container">
      <h1>Inventario de Productos</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Costo por Kilo</th>
            <th>Precio por Kilo</th>
            <th>Stock (Kilos)</th>
            <th>Unidad Mínima de Venta</th>
            <th>Categoría</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion}</td>
              <td>{producto.costo_por_kilo}</td>
              <td>{producto.precio_por_kilo}</td>
              <td>{producto.stock_kilos}</td>
              <td>{producto.categoria}</td>
              <td>{producto.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
