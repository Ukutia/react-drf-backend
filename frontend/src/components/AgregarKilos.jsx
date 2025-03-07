import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";

const IngresarKilos = ({ pedidoId }) => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    if (pedidoId) {
      const fetchPedidoDetalles = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/pedidos/${pedidoId}/`);
          const data = await response.json();
          setProductos(data.detalles.map(detalle => ({
            ...detalle,
            cantidad_kilos: detalle.cantidad_kilos || 0,
          })));
        } catch (error) {
          console.error("Error fetching pedido detalles:", error);
        }
      };

      fetchPedidoDetalles();
    }
  }, [pedidoId]);

  const handleUpdateKilos = (productoId, kilos) => {
    const producto = productos.find(producto => producto.producto.id === productoId);
    if (producto.cantidad_kilos === kilos) {
      alert("La cantidad de kilos no ha cambiado.");
      return;
    }
    setProductos(productos.map(producto =>
      producto.producto.id === productoId ? { ...producto, cantidad_kilos: kilos } : producto
    ));
  };

  const handleSaveKilos = async () => {
    const detalles = productos.map(producto => ({
      producto: producto.producto.id,
      cantidad_kilos: producto.cantidad_kilos,
    }));

    const updatedPedido = {
      id: pedidoId,
      detalles,
    };

    try {
      const response = await fetch(`http://localhost:8000/api/pedidos/${pedidoId}/actualizar_kilos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPedido),
      });

      if (response.ok) {
        alert("Kilos actualizados con éxito!");
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert("Error al actualizar los kilos.");
      }
    } catch (error) {
      console.error("Error updating kilos:", error);
    }
  };

  return (
    <div>
      <Typography variant="h6">Productos del Pedido</Typography>
      {productos.map((producto) => (
        <Box key={producto.producto.id} display="flex" justifyContent="space-between" alignItems="center" marginBottom={1}>
          <Typography>{producto.producto.nombre}</Typography>
          <TextField
            label="Cantidad (kg)"
            type="number"
            value={producto.cantidad_kilos}
            onChange={(e) => handleUpdateKilos(producto.producto.id, parseFloat(e.target.value))}
          />
        </Box>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveKilos}
      >
        Guardar Kilos
      </Button>
    </div>
  );
};

export default IngresarKilos;