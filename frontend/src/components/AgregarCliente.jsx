import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Box, Typography } from '@mui/material';

const AgregarCliente = () => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [vendedores, setVendedores] = useState([]);
  const [vendedor, setVendedor] = useState('');

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/vendedores/");
        const data = await response.json();
        setVendedores(data);
      } catch (error) {
        console.error("Error fetching vendedores:", error);
      }
    };

    fetchVendedores();
  }, []);

  const handleAddCliente = async () => {
    const newCliente = {
      nombre,
      direccion,
      telefono,
      email,
      vendedor,
    };

    try {
      const response = await fetch("http://localhost:8000/api/clientes/crear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCliente),
      });

      if (response.ok) {
        alert("Cliente agregado con éxito!");
        setNombre('');
        setDireccion('');
        setTelefono('');
        setEmail('');
        setVendedor('');
      } else {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        alert("Error al agregar el cliente.");
      }
    } catch (error) {
      console.error("Error adding cliente:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Agregar Cliente
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
          label="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Vendedor</InputLabel>
        <Select
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
          label="Vendedor"
        >
          {vendedores.map((vendedor) => (
            <MenuItem key={vendedor.id} value={vendedor.id}>
              {vendedor.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleAddCliente}>
        Agregar Cliente
      </Button>
    </Box>
  );
};

export default AgregarCliente;
