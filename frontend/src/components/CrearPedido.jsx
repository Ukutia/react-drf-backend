import React, { useState, useEffect, useMemo } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
} from "@mui/material";

const CrearPedido = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [estado] = useState("pendiente");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState("");

  useEffect(() => {
    // Fetch los productos disponibles
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/inventario/");
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error fetching productos:", error);
      }
    };

    // Fetch los clientes disponibles
    const fetchClientes = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/clientes/");
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    };

    fetchProductos();
    fetchClientes();
  }, []);

  // Optimización de la búsqueda de vendedor con useMemo
  const vendedorSeleccionado = useMemo(() => {
    return clientes.find((cl) => cl.id === cliente)?.vendedor_nombre || "";
  }, [cliente, clientes]);

  useEffect(() => {
    setVendedor(vendedorSeleccionado);
  }, [vendedorSeleccionado]);

  const handleAddProducto = () => {
    if (productoSeleccionado && cantidadSeleccionada > 0) {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { producto: productoSeleccionado, cantidad: cantidadSeleccionada },
      ]);
      setProductoSeleccionado(null);
      setCantidadSeleccionada("");
    }
  };

  const handleCreatePedido = async () => {
    const detalles = productosSeleccionados.map((detalle) => {
      const precioTotal =
        detalle.producto.precio_por_kilo !== undefined
          ? detalle.cantidad * detalle.producto.precio_por_kilo
          : 0; // Asegura que siempre haya un valor válido

      return {
        producto: detalle.producto.id,
        cantidad_kilos: detalle.cantidad,
        cantidad_unidades: 1, // Ajustar según necesidad
        precio_total: precioTotal, // Asumimos precio por kilo
      };
    });

    const newPedido = {
      cliente,
      vendedor,
      estado,
      detalles,
    };

    try {
      const response = await fetch("http://localhost:8000/api/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPedido),
      });

      if (response.ok) {
        alert("Pedido creado con éxito!");
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert("Error al crear el pedido.");
      }
    } catch (error) {
      console.error("Error creating pedido:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Crear nuevo Pedido
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Cliente</InputLabel>
        <Select
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          label="Cliente"
        >
          {clientes.map((cliente) => (
            <MenuItem key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Vendedor"
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
          disabled
        />
      </FormControl>

      <Box marginBottom={2}>
        <Typography variant="h6">Agregar Productos al Pedido</Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel>Producto</InputLabel>
          <Select
            value={productoSeleccionado ? productoSeleccionado.id : ""}
            onChange={(e) =>
              setProductoSeleccionado(
                productos.find((prod) => prod.id === e.target.value)
              )
            }
            label="Producto"
          >
            {productos.map((producto) => (
              <MenuItem key={producto.id} value={producto.id}>
                {producto.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Cantidad (kg)"
          type="number"
          value={cantidadSeleccionada}
          onChange={(e) => setCantidadSeleccionada(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddProducto}
        >
          Agregar Producto
        </Button>
      </Box>

      <Typography variant="h6">Productos Seleccionados:</Typography>
      <Box marginBottom={2}>
        {productosSeleccionados.map((item) => (
          <Box key={item.producto.id} display="flex" justifyContent="space-between">
            <Typography>{item.producto.nombre}</Typography>
            <Typography>{item.cantidad} kg</Typography>
          </Box>
        ))}
      </Box>

      <Button variant="contained" color="primary" onClick={handleCreatePedido}>
        Crear Pedido
      </Button>
    </div>
  );
};

export default CrearPedido;
