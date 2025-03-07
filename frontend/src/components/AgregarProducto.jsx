import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Typography } from '@mui/material';

const AgregarProducto = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioPorKilo, setPrecioPorKilo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('disponible');

  const handleAddProducto = async () => {
    const newProducto = {
      nombre,
      descripcion,
      precio_por_kilo: parseFloat(precioPorKilo),
      categoria,
      estado,
    };

    try {
      const response = await fetch("http://localhost:8000/api/productos/crear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProducto),
      });

      if (response.ok) {
        alert("Producto agregado con éxito!");
        setNombre('');
        setDescripcion('');
        setPrecioPorKilo('');
        setCategoria('');
        setEstado('disponible');
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert("Error al agregar el producto.");
      }
    } catch (error) {
      console.error("Error adding producto:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Agregar Producto
      </Typography>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Precio por Kilo"
          type="number"
          value={precioPorKilo}
          onChange={(e) => setPrecioPorKilo(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Categoría</InputLabel>
        <Select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          label="Categoría"
        >
          <MenuItem value="al vacio">Al Vacio</MenuItem>
          <MenuItem value="congelado">Congelado</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Estado</InputLabel>
        <Select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          label="Estado"
        >
          <MenuItem value="disponible">Disponible</MenuItem>
          <MenuItem value="agotado">Agotado</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleAddProducto}>
        Agregar Producto
      </Button>
    </Box>
  );
};

export default AgregarProducto;
