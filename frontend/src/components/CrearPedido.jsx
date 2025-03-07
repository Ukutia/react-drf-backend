import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

const CrearPedido = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [estado] = useState("pendiente");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad_KSeleccionada, setCantidadKSeleccionada] = useState("");
  const [cantidad_USeleccionada, setCantidadUSeleccionada] = useState("");

  useEffect(() => {
    // Fetch los productos disponibles
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/productos/");
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

  const handleClienteChange = (e) => {
    const selectedClienteId = e.target.value;
    setCliente(selectedClienteId);
    const selectedCliente = clientes.find((cl) => cl.id === selectedClienteId);
    setVendedor(selectedCliente?.vendedor || "");
  };

  const handleAddProducto = () => {
    if (productoSeleccionado && cantidad_USeleccionada > 0) {
      setProductosSeleccionados([
        ...productosSeleccionados,
        { 
          producto: productoSeleccionado, 
          cantidad_K: cantidad_KSeleccionada ? parseFloat(cantidad_KSeleccionada) : null,
          cantidad_U: cantidad_USeleccionada ? parseFloat(cantidad_USeleccionada) : null 
        },
      ]);
      setProductoSeleccionado(null);
      setCantidadKSeleccionada("");
      setCantidadUSeleccionada("");
    }
  };

  const handleRemoveProducto = (productoId) => {
    setProductosSeleccionados(productosSeleccionados.filter(item => item.producto.id !== productoId));
  };

  const handleCreatePedido = async () => {
    const detalles = productosSeleccionados.map((detalle) => {
      return {
        producto: detalle.producto.id,
        cantidad_kilos: detalle.cantidad_K,
        cantidad_unidades: detalle.cantidad_U,
      };
    });

    const newPedido = {
      cliente,
      vendedor: vendedor.id,
      estado,
      detalles,
    };

    try {
      const response = await fetch("http://localhost:8000/api/pedidos/crear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPedido),
      });

      if (response.ok) {
        const data = await response.json();
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
          onChange={handleClienteChange}
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
          value={vendedor.sigla}
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
          label="Cantidad (Unidades)"
          type="number"
          value={cantidad_USeleccionada}
          onChange={(e) => setCantidadUSeleccionada(e.target.value)}
        />
        <TextField
          label="Cantidad (kg)"
          type="number"
          value={cantidad_KSeleccionada}
          onChange={(e) => setCantidadKSeleccionada(e.target.value)}
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
          <Box key={item.producto.id} display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{item.producto.nombre}</Typography>
            <Typography>{item.cantidad_U} Unidades</Typography>
            <Typography>{item.cantidad_K} kg</Typography>
            <IconButton onClick={() => handleRemoveProducto(item.producto.id)}>
              <Delete />
            </IconButton>
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
